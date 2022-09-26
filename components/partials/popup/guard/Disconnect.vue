<template>
  <PartialsPopup>
    <template #header>
      Log out
    </template>
    <template #body>
      <button @click="logoutOnClick">
        Disconnect
      </button>
    </template>
  </PartialsPopup>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const { logoutUser } = useUserStore()
const { emit, events } = useEventsBus()

const logoutOnClick = (): void => {
  logoutUser()
  emit(events.POPUP_CLOSE)
}
</script>
