<template>
  <div class="grid gap-10">
    <h1 class="typo-title-l text-white">
      Deploy your token
    </h1>
    <p class="typo-text-medium text-grey-100">
      Your DAO will require a token to represent voting power, pick a token and fill out the parameters
    </p>
  </div>
  <ControlsFormSelect
    v-model="models.token"
    label="Select token type"
    placeholder="Select a token"
    :options="['Sould Bounds NFT', 'IRC2 token', 'Stakeable IRC2']"
  />
  <div class="grid s:grid-cols-2 gap-16">
    <ControlsFormInput
      v-model="models.name"
      label="Name"
      placeholder="Name"
    />
    <ControlsFormInput
      v-model="models.supply"
      label="Total supply"
      placeholder="Total supply"
    />
  </div>
  <ControlsButtonAction @click="emit('updateStep', 'StepDeployAgora')">
    Deploy token
  </ControlsButtonAction>
</template>

<script setup lang="ts">
type NextStep = 'StepDeployAgora'

type Emits = {
  (event: 'updateStep', parameter: NextStep): void
}

const emit = defineEmits<Emits>()

const models = reactive<{ token: string, name: string, supply: string }>({ token: '', name: '', supply: '' })
</script>
