import { ref, getCurrentInstance, onMounted, onBeforeUnmount } from 'vue'

export function useKeyboard(
  onKeyDown?: (event: KeyboardEvent) => void,
  onKeyUp?: (event: KeyboardEvent) => void
) {
  const holdingKeys = ref(new Set())

  if (getCurrentInstance()) {
    onMounted(() => {
      window.addEventListener('keydown', listenKeyDown)

      window.addEventListener('keyup', listenKeyUp)
    })

    onBeforeUnmount(() => {
      window.removeEventListener('keydown', listenKeyDown)

      window.removeEventListener('keyup', listenKeyUp)
    })
  }

  return {
    holdingKeys
  }

  function listenKeyDown(event: KeyboardEvent) {
    onKeyDown?.(event)
    if (event.repeat) return
    holdingKeys.value.add(event.key)
  }

  function listenKeyUp(event: KeyboardEvent) {
    onKeyUp?.(event)
    holdingKeys.value.delete(event.key)
  }
}
