<template>
  <Container class="my-40">
    <div
      v-if="isLoading"
      class="grid place-items-center text-primary"
    >
      <UtilsLoader />
    </div>
    <div
      v-else-if="hasError"
      class="px-12 py-8 typo-paragraph text-error bg-error bg-opacity-20 rounded-5"
    >
      Something wrong happened. Please retry later.
    </div>
    <div
      v-else-if="!governances.length"
      class="px-12 py-8 typo-paragraph text-info bg-info bg-opacity-20 rounded-5"
    >
      No governance has been found.
    </div>
    <div
      v-else
      class="grid gap-20 s:grid-cols-2 m:grid-cols-3 l:grid-cols-4 xl:grid-cols-4 xxl:grid-cols-4"
    >
      <DisplaysCardGovernance
        v-for="(governance, i) in governances"
        :key="`governance-${i}`"
        v-bind="governance"
      />
    </div>
  </Container>
</template>

<script setup lang="ts">
type Governance = {
  name: string
  link: string
  logo: string
  socials?: {
    discord?: string
    github?: string
    twitter?: string
    telegram?: string
    website?: string
  }
}

const isLoading = ref<boolean>(true)
const governances = ref<Governance[]>([])
const hasError = ref<boolean>(false)

onMounted(async () => {
  try {
    const modules = import.meta.glob('~/assets/data/*.json')
    const data = await Promise.all(Object.entries(modules).filter(([file]) => !file.includes('/example.json')).map(([file, module]) => module())).then<Governance[]>((result) => result.map((module) => module.default))
    governances.value = data.sort((a, b) => (a.name > b.name ? 1 : -1))
  } catch (error) {
    hasError.value = true
  } finally {
    isLoading.value = false
  }
})
</script>
