<template>
  <Container class="grid place-content-center pt-60 h-screen">
    <div class="grid gap-24 m:w-768">
      <component
        :is="steps[currentStep]"
        @updateStep="updateStep"
      />
    </div>
  </Container>
</template>

<script setup lang="ts">
enum STEPS {
  DECLARE_TOKEN = 'StepDeclareToken',
  DEPLOY_TOKEN = 'StepDeployToken',
  DEPLOY_AGORA = 'StepDeployAgora',
}

const steps = {
  StepDeclareToken: markRaw(defineAsyncComponent(() => import('@/components/displays/deploy/StepDeclareToken.vue'))),
  StepDeployToken: markRaw(defineAsyncComponent(() => import('@/components/displays/deploy/StepDeployToken.vue'))),
  StepDeployAgora: markRaw(defineAsyncComponent(() => import('@/components/displays/deploy/StepDeployAgora.vue'))),
}

const currentStep = ref<STEPS>(STEPS.DECLARE_TOKEN)

const updateStep = (step: STEPS): void => {
  currentStep.value = step
}
</script>
