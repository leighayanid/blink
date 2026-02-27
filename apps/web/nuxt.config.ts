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
        { name: 'theme-color', content: '#000000' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap'
        }
      ]
    }
  },

  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt'
  ],

  css: ['~/app/assets/css/main.css'],

  ui: {
    theme: {
      colors: ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral'],
      transitions: true,
      defaultVariants: {
        color: 'neutral',
        size: 'md'
      }
    }
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
