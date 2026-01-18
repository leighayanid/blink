export default defineNuxtConfig({
  app: {
    head: {
      title: 'Blink',
      titleTemplate: '%s - Blink Local Share',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: 'Fast, secure, and peer-to-peer local file sharing directly between devices on your network.' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'theme-color', content: '#FF9500' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },

  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  css: ['~/app/assets/css/design-system.css'],

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
    storageKey: 'blink-theme',
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
    '~': './'
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
