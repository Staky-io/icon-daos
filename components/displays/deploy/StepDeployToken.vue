<template>
  <div class="grid gap-10">
    <h1 class="typo-title-l text-white">
      Deploy your token
    </h1>
    <p class="typo-text-large text-grey-100">
      Your DAO will require a token to represent voting power, pick a token and fill out the parameters. Pick an option to discover the features of each token.
    </p>
  </div>
  <ControlsFormSelect
    v-model="models.token"
    label="Select token type"
    placeholder="Select a token"
    :options="['Sould Bounds NFT']"
  />
  <div>
    <span v-if="models.token == 'Sould Bounds NFT'">
      SoulBounds NFT are untransferable NFT tokens. Soulbound tokens cannot be bought and sold and are not designed to have market value. Instead, they can be issued by individuals or by another entity to symbolize an accomplishment.
    </span>
  </div>
  <!-- <div class="grid s:grid-cols-2 gap-16">
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
  </div> -->
  <ControlsButtonAction @click="onDeployAgora">
    Deploy token
  </ControlsButtonAction>
</template>

<script setup lang="ts">
type NextStep = 'StepDeployAgora'

type Emits = {
  (event: 'updateStep', parameter: NextStep): void
}
const { emit, events } = useEventsBus()

// const emit = defineEmits<Emits>()

const onDeployAgora = (): void => {
  if (models.token !== '') {
    emit(events.POPUP_ACTION, { name: 'Deploy', handleGuard: true })
  } else {
    notify.warning({
      title: 'Warning',
      message: 'You need to select a token',
      timeout: 5000,
    })
  }
}
const models = reactive<{ token: string, name: string, supply: string }>({ token: '' })
</script>
