export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode'
  ],

  colorMode: {
    classSuffix: '',
    fallback: 'light',
    hid: 'nuxt-color-mode-script',
    storageKey: 'hatid-theme',
    classPrefix: '',
    classSuffixDark: 'dark'
  },

  tailwindcss: {
    configPath: 'tailwind.config.ts',
    exposeConfig: true
  },

  nitro: {
    experimental: {
      websocket: true
    }
  },

  alias: {
    '~': '<rootDir>'
  },

  vite: {
    server: {
      https: false,
      host: '0.0.0.0',
      port: 3000
    }
  },

  runtimeConfig: {
    public: {
      wsUrl: process.env.WS_URL || 'ws://localhost:3000',
      signalingServer: process.env.SIGNALING_SERVER || 'http://localhost:3000'
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  }
})
