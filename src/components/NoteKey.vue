<template>
  <button @click="toggleNote()" class="note-key" :class="isPlaying && '--is-playing'">
    {{ noteName }}
  </button>
</template>

<script setup lang="ts">
import { useNote, type Instrument } from '@/composables/use-note'
import { computed, toRef } from 'vue'

defineExpose({ toggleNote })

const props = defineProps<NoteKeyProps>()

const noteName = computed(() => `${props.note}${props.octave}`)
const { playNote, isPlaying } = useNote(noteName.value, toRef(props, 'instrument'))

function toggleNote(shouldSustain?: boolean) {
  playNote(shouldSustain ? 9999 : 1)
}

interface NoteKeyProps {
  instrument: Instrument
  note: string
  octave: number
}
</script>

<style lang="scss" scoped>
.note-key {
  padding: 1rem;
  border: 1px solid #000;
  border-radius: 0.5rem;
  cursor: pointer;

  &.--is-playing {
    background-color: darkblue;
    color: #fff;
  }
}
</style>
