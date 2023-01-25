<template>
  <div class="grid gap-10">
    <h1 class="typo-title-l text-white">
      Deploy Agora
    </h1>
    <p class="typo-text-medium text-grey-100">
      The next step is to deploy Agora, the governance framework for you DAO
    </p>
  </div>
  <ControlsButtonAction>
    Deploy Agora
  </ControlsButtonAction>
  <div class="w-full h-1 bg-grey-200" />
  <div class="grid gap-10">
    <h1 class="typo-title-l text-white">
      Setup Agora contracts
    </h1>
    <p class="typo-text-medium text-grey-100">
      The next step is to deploy Agora, the governance framework for you DAO
    </p>
  </div>
  <ControlsFormInput
    v-model="models.address"
    label="Address"
    placeholder="cx..."
  />
  <ControlsFormSelect
    v-model="models.token"
    label="Select token type"
    placeholder="Select a token"
    :options="['Sould Bounds NFT', 'IRC2 token', 'Stakeable IRC2']"
  />
  <ControlsButtonAction @click="onDeploy">
    Deploy token
  </ControlsButtonAction>
</template>

<script setup lang="ts">
const { emit, events } = useEventsBus()

const models = reactive<{ token: string, address: string }>({ token: '', address: '' })

const onDeploy = (): void => {
  emit(events.POPUP_ACTION, { name: 'CloseProposal', handleGuard: false, params: { uid: '0' } })
}
</script>
