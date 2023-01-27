<template>
  <div class="grid gap-10">
    <h1 class="typo-title-l text-white">
      Deploy Agora
    </h1>
    <p class="typo-text-large text-grey-100">
      The next step is to deploy Agora, the governance framework for you DAO.
    </p>
  </div>
  <ControlsButtonAction @click="onDeployAgora">
    Deploy Agora
  </ControlsButtonAction>
  <div class="w-full h-1 bg-grey-200" />
  <div class="grid gap-10">
    <h1 class="typo-title-l text-white">
      Setup Agora contracts
    </h1>
    <p class="typo-text-large text-grey-100">
      Once Agora is deployed, you can set it to track balances from your token contract. <span v-if="models.token == 'Sould Bounds NFT'">For a Soulbound NFT, you will need to specify the tokenId of the token that holds governance power.</span>
    </p>
  </div>
  <ControlsFormSelect
    v-model="models.token"
    label="Select token type"
    placeholder="Select a token"
    :options="['Sould Bounds NFT']"
  />
  <div class="grid s:grid-cols-2 gap-16">
    <ControlsFormInput
      v-model="models.address"
      label="Token address"
      placeholder="cx..."
    />
    <ControlsFormInput
      v-if="models.token == 'Sould Bounds NFT'"
      v-model="models.id"
      label="Id"
      placeholder="1"
    />
  </div>

  <ControlsButtonAction @click="onSetupAgora">
    Set Agora
  </ControlsButtonAction>
</template>

<script setup lang="ts">
const { notify } = useNotificationToast()

type Props = {
  stepData?: string
}

const props = defineProps<Props>()
const { emit, events } = useEventsBus()

const models = reactive<{ token: string, address: string, id: string }>({ token: props.stepData || '', address: '', id: '' })

const onDeployAgora = (): void => {
  emit(events.POPUP_ACTION, { name: 'DeployToken', params: { type: 'agora' }, handleGuard: true })
}

const onSetupAgora = (): void => {
  if (models.token !== '') {
    // emit(events.POPUP_ACTION, { name: 'DeployToken', params: { type: 'agora' }, handleGuard: true })
  } else {
    notify.error({
      title: 'Warning',
      message: 'You need to select a token type, address',
      timeout: 5000,
    })
  }
}
</script>
