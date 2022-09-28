import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  app: {
    head: {
      title: 'ICON DAOs',
      titleTemplate: '%s - Staky starter',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Meet the decentralized autonomous organizations of the ICON ecosystem! Anyone can submit his own DAO through a pull request.' },
      ],
    },
  },
  css: [
    '~/assets/styles/tailwind.css',
    '~/assets/styles/fonts.css',
    '~/assets/styles/global.css',
    '~/assets/styles/overrides.css',
    '~/assets/styles/transitions.css',
    '~/assets/styles/typography.css',
    '~/assets/styles/utils.css',
  ],
  build: {
    postcss: {
      postcssOptions: {
        plugins: {
          tailwindcss: {},
          autoprefixer: {},
        },
      },
    },
  },
})
