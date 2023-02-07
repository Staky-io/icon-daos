<template>
  <div class="grid gap-10">
    <h1 class="typo-title-l text-white">
      Congratulations! 🎉
    </h1>
    <p class="typo-text-large text-grey-100">
      You have deployed the on-chain infrastructure for your DAO 🚀 The next step consist in deploying the user interface for Agora, you can do so by following the instructions there: https://github.com/Staky-io/agora
    </p>
  </div>
</template>

<script setup lang="ts">
type NextStep = 'StepDeployToken' | 'StepDeployAgora'

type Props = {
  stepData?: string
}

type Emits = {
  (event: 'updateStep', parameter: { step: NextStep }): void
}

const emit = defineEmits<Emits>()
withDefaults(defineProps<Props>(), {
  stepData: '',
})
</script>
