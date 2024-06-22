<template>
  <div class="js-music-notes">
    <h1>JS Music Notes</h1>
    <p>
      Press Key Up and Down to change the selection of octaves. <br />
      Press from 1 to + to play notes of the first selected octave. <br />
      Press from q to ] to play notes of the second selected octave.
    </p>
    <div>
      Instrument
      <select v-model="instrument">
        <option v-for="instrument in instruments" :value="instrument" :key="instrument">
          {{ instrument }}
        </option>
      </select>
    </div>
    <div class="js-music-notes__container">
      <div class="js-music-notes__octave" v-for="(notes, octave) of octavesNotes" :key="octave">
        <NoteKey
          ref="noteKeys"
          :id="note + octave"
          v-for="note in notes"
          :note="note"
          :octave="octave"
          :key="note + octave"
          :instrument="instrument"
        />
      </div>
      <div ref="notesSelection" class="js-music-notes__notes-selection"></div>
    </div>
    <small>All sounds is created by Javascript, no sound file is used</small>
  </div>
</template>

<script lang="ts">
const MAPPED_KEYS: Record<string, number> = {
  '1': 0,
  '2': 1,
  '3': 2,
  '4': 3,
  '5': 4,
  '6': 5,
  '7': 6,
  '8': 7,
  '9': 8,
  '0': 9,
  '-': 10,
  '=': 11,
  q: 12,
  w: 13,
  e: 14,
  r: 15,
  t: 16,
  y: 17,
  u: 18,
  i: 19,
  o: 20,
  p: 21,
  '[': 22,
  ']': 23
}
</script>

<script setup lang="ts">
import NoteKey from '@/components/NoteKey.vue'
import { useKeyboard } from '@/composables/use-keyboard'
import { NOTES, type Instrument } from '@/composables/use-note'
import { ref, type ComponentPublicInstance } from 'vue'

const instrument = ref<Instrument>('piano')
const notesSelection = ref<HTMLElement | null>(null)
const notesSelectionTop = ref<string>('calc(2 * 100% / 4)')
const notesSelectionIndex = ref<number>(2)
const noteKeys = ref<ComponentPublicInstance<typeof NoteKey>[]>([])
const instruments: Instrument[] = ['piano', 'bass']
const octavesNotes = Array.from({ length: 8 }, () => NOTES)
useKeyboard(
  ({ key, repeat }) => {
    console.log('down', key)

    if (repeat) {
      return
    }

    setNotesSelectionTop(key)
    togglePressedNote(key)
  },
  ({ key }) => {
    console.log('up', key)

    togglePressedNote(key)
  }
)

function togglePressedNote(key: string) {
  const selectedOctavesNotes = Array.from({ length: 2 }, () => NOTES)
    .map((notes, octave) => notes.map((note) => `${note}${octave + notesSelectionIndex.value * 2}`))
    .flat()
  const noteIndex = MAPPED_KEYS[key]
  const pressedNote = selectedOctavesNotes[noteIndex]

  if (pressedNote) {
    const noteKey = noteKeys.value.find((noteKey) => noteKey.$el.id === pressedNote)

    if (noteKey) {
      noteKey.toggleNote(true)
    }
  }
}

function setNotesSelectionTop(key: string) {
  if (key === 'ArrowDown') {
    notesSelectionIndex.value = Math.min(notesSelectionIndex.value + 1, 3)
  } else if (key === 'ArrowUp') {
    notesSelectionIndex.value = Math.max(notesSelectionIndex.value - 1, 0)
  }
  if (notesSelection.value) {
    notesSelectionTop.value = `calc(${notesSelection.value.clientHeight * notesSelectionIndex.value}px + 0.25rem)`
  }
}
</script>

<style lang="scss" scoped>
.js-music-notes {
  text-align: center;

  &__container {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 0.5rem;
  }

  &__octave {
    display: flex;
    gap: 0.5rem;
  }

  &__notes-selection {
    position: absolute;
    width: 100%;
    height: calc(100% / 4);
    top: v-bind(notesSelectionTop);
    left: 0;
    border: 1px yellow solid;
    border-radius: 0.5rem;
    transition: ease-in-out 0.3s;
    pointer-events: none;
  }
}
</style>
