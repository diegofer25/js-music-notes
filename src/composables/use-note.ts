import { ref, type Ref } from 'vue'

// Mapeamento das notas em relação ao A4
export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export function useNote(note: string, instrument: Ref<Instrument>) {
  const audioContext = new AudioContext()
  const instruments: Record<Instrument, (options: AddSoundOptions) => OscillatorNode> = {
    piano: addPianoSound,
    bass: addBassSound
  }
  const isPlaying = ref(false)
  let activeOscillator: OscillatorNode | null = null
  let timeout = 0

  return {
    playNote,
    isPlaying
  }

  // Função para tocar uma nota
  function playNote(duration = 1) {
    // Obtém a frequência da nota
    const frequency = getFrequency(note)
    // Parar a nota se já estiver tocando
    if (activeOscillator) {
      activeOscillator.stop()
      activeOscillator = null
      isPlaying.value = false
      clearTimeout(timeout)
      return
    }

    // Configura o envelope do ganho (para suavizar o início e o fim do som)
    const now = audioContext.currentTime

    const oscillator = instruments[instrument.value]({
      oscillator: audioContext.createOscillator(),
      now,
      frequency,
      duration
    })

    // Inicia o oscilador
    oscillator.start(now)

    // Atualiza a variável de estado
    isPlaying.value = true

    // Para o oscilador após a duração especificada (em segundos)
    oscillator.stop(now + duration)

    // Armazena o oscilador ativo
    activeOscillator = oscillator

    // Remove o oscilador ativo após a duração
    timeout = setTimeout(() => {
      if (activeOscillator === oscillator) {
        activeOscillator = null
        isPlaying.value = false
      }
    }, duration * 1000)
  }

  function getFrequency(note: string) {
    // Frequência básica (A4 = 440 Hz)
    const A4_FREQUENCY = 440
    // Razão da progressão geométrica (12ª raiz de 2)
    const SEMITONE_RATIO = Math.pow(2, 1 / 12)

    // Extraindo a nota e a oitava da string de entrada
    const notePattern = /^([A-G]#?)(\d)$/
    const match = note.match(notePattern)
    if (!match) {
      throw new Error('Invalid note format. Use the format like A4, C#3, etc.')
    }

    const noteName = match[1]
    const octave = match[2]

    // Calculando o número de semitons de distância entre a nota dada e o A4
    const noteIndex = NOTES.indexOf(noteName)
    if (noteIndex === -1) {
      throw new Error('Invalid note name.')
    }

    // A4 está na oitava 4 e é a 9ª nota no array NOTES
    const A4_INDEX = 9
    const A4_OCTAVE = 4
    const semitoneDistance = noteIndex - A4_INDEX + 12 * (Number(octave) - A4_OCTAVE)

    // Calculando a frequência
    const frequency = A4_FREQUENCY * Math.pow(SEMITONE_RATIO, semitoneDistance)

    return frequency
  }

  // Piano
  function addPianoSound({ oscillator, now, frequency, duration }: AddSoundOptions) {
    // Cria um ganho (para controle de volume)
    const gainNode = audioContext.createGain()

    // Cria um filtro (para ajustar o timbre)
    const filter = audioContext.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(1500, audioContext.currentTime)

    // Configura o oscilador para usar uma onda dente de serra (sawtooth)
    oscillator.type = 'sawtooth'

    // Define a frequência (em Hertz)
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)

    // Conecta o oscilador ao filtro, depois ao ganho e finalmente aos alto-falantes
    oscillator.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(audioContext.destination)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(1, now + 0.02) // Ataque rápido
    gainNode.gain.exponentialRampToValueAtTime(0.5, now + 0.1) // Decaimento inicial
    gainNode.gain.exponentialRampToValueAtTime(0.2, now + duration - 0.1) // Sustentação
    gainNode.gain.linearRampToValueAtTime(0, now + duration) // Liberação

    return oscillator
  }

  // Bass
  function addBassSound({ oscillator, now, frequency, duration }: AddSoundOptions) {
    // Cria um ganho (para controle de volume)
    const gainNode = audioContext.createGain()

    // Configura o oscilador para usar uma onda senoidal (sine)
    oscillator.type = 'sine'

    // Define a frequência (em Hertz)
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)

    // Conecta o oscilador ao ganho e finalmente aos alto-falantes
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(1, now + 0.02) // Ataque rápido
    gainNode.gain.exponentialRampToValueAtTime(0.5, now + 0.1) // Decaimento inicial
    gainNode.gain.exponentialRampToValueAtTime(0.2, now + duration - 0.1) // Sustentação
    gainNode.gain.linearRampToValueAtTime(0, now + duration) // Liberação

    return oscillator
  }
}

interface AddSoundOptions {
  oscillator: OscillatorNode
  now: number
  frequency: number
  duration: number
}

export type Instrument = 'piano' | 'bass'
