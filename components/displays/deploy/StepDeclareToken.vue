<template>
  <div class="grid gap-10">
    <h1 class="typo-title-l text-white">
      Get your DAO started
    </h1>
    <p class="typo-text-large text-grey-100">
      This page allows you to deploy the contracts required to launch a token based DAO on the ICON network. Do you have a token ready for your governance?
    </p>
  </div>
  <div class="grid m:grid-cols-2 gap-16">
    <ControlsButtonAction
      version="secondary"
      @click="emit('updateStep', 'StepDeployToken')"
    >
      I don't have a token contract
    </ControlsButtonAction>
    <ControlsButtonAction
      version="secondary"
      @click="emit('updateStep', 'StepDeployAgora')"
    >
      I have a token ready
    </ControlsButtonAction>
  </div>
</template>

<script setup lang="ts">
type NextStep = 'StepDeployToken' | 'StepDeployAgora'

type Emits = {
  (event: 'updateStep', parameter: NextStep): void
}

const emit = defineEmits<Emits>()
</script>
