<template>
  <div
    class="relative grid grid-rows-auto-1fr before:content-[''] before:absolute before:left-0 before:top-0 before:right-0 before:bottom-0 before:pointer-events-none"
    :class="$style.hero"
  >
    <PartialsNavigationHeader class="relative" />
    <Container class="grid place-items-center">
      <h1 class="typo-title-l text-center">
        Meet the autonomous organizations <span class="text-primary">of the ICON ecosystem</span>
      </h1>
    </Container>
  </div>
  <NuxtPage />
</template>

<script setup lang="ts">
</script>

<style lang="scss" module>
.hero {
  height: 210px;
  background: radial-gradient(ellipse at -50px -75px, #0890FE, #231A3B 75%);

  &::before {
    background-image: url("~/assets/images/waves.svg");
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }
}
</style>
