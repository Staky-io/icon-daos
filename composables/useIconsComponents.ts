const icons = {
  'Logo/Discord': markRaw(defineAsyncComponent(() => import('@/assets/scripts/icons/Logo/Discord.vue'))),
  'Logo/Github': markRaw(defineAsyncComponent(() => import('@/assets/scripts/icons/Logo/Github.vue'))),
  'Logo/Icon': markRaw(defineAsyncComponent(() => import('@/assets/scripts/icons/Logo/Icon.vue'))),
  'Logo/Telegram': markRaw(defineAsyncComponent(() => import('@/assets/scripts/icons/Logo/Telegram.vue'))),
  'Logo/Twitter': markRaw(defineAsyncComponent(() => import('@/assets/scripts/icons/Logo/Twitter.vue'))),
  'Logo/Website': markRaw(defineAsyncComponent(() => import('@/assets/scripts/icons/Logo/Website.vue'))),
  Chevron: markRaw(defineAsyncComponent(() => import('@/assets/scripts/icons/Chevron.vue'))),
  Cross: markRaw(defineAsyncComponent(() => import('@/assets/scripts/icons/Cross.vue'))),
}

export type IconsNames = keyof typeof icons
export type IconsComponents = typeof icons[IconsNames]

export const useIconsComponents = (): Record<IconsNames, IconsComponents> => icons
