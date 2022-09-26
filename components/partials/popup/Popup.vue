<template>
  <div
    class="fixed top-0 left-0 grid w-screen h-screen z-100 py-10"
    @click="closeOnClick"
  >
    <Container class="grid">
      <div
        class="grid gap-10 content-start justify-self-center self-center w-full s:w-512 min-h-192 p-20 bg-white rounded-5"
        @click.stop
      >
        <button
          class="justify-self-end"
          @click="closeOnClick"
        >
          Close
        </button>
        <slot name="header" />
        <slot name="body" />
      </div>
    </Container>
  </div>
</template>

<script setup lang="ts">
const { emit, events } = useEventsBus()

const closeOnClick = (): void => {
  emit(events.POPUP_CLOSE)
}

const closeOnEscape = ({ key }: KeyboardEvent): void => {
  if (key === 'Escape') {
    closeOnClick()
  }
}

onMounted(() => {
  window.addEventListener('keydown', closeOnEscape)
})

onUnmounted(() => {
  window.removeEventListener('keydown', closeOnEscape)
})
</script>
