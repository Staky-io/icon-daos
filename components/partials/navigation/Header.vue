<template>
  <header class="grid items-center h-60">
    <Container class="grid gap-20 grid-flow-col items-center justify-between">
      <div class="grid gap-10 grid-flow-col items-center">
        <div class="grid place-items-center w-20 h-20 rounded-full bg-white">
          <UtilsIcon
            name="Logo/Icon"
            class="w-12 h-12 text-[#1BBDC2]"
          />
        </div>
        <div class="text-14 font-bold">
          ICON DAOs
        </div>
      </div>
      <div class="grid gap-10 grid-flow-col items-center">
        <a
          v-for="(link, i) in links"
          :key="`link-${i}`"
          :href="link.url"
          rel="nofollow noopener noreferrer"
          target="_blank"
          class="typo-button-l opacity-60 transition-opacity duration-100 hover:opacity-100"
        >
          {{ link.text }}
        </a>
      </div>
    </Container>
  </header>
</template>

<script setup lang="ts">
type Link = { text: string, url: string }

const links = ref<Link[]>([
  { text: 'ICON website', url: 'https://icon.community/' },
  { text: 'ICON docs', url: 'https://docs.icon.community' },
  { text: 'Why $ICX?', url: 'https://whyicx.com/' },
])
</script>
