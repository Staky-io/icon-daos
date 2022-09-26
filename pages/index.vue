<template>
  <Container>
    <h1 data-test="title">
      {{ title }}
    </h1>
  </Container>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: 'Hello world! - %s',
})

const title = ref<string>('Hello world!')
</script>
