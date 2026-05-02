import type { Config } from 'tailwindcss'

export default {
  content: [
    './app.vue',
    './app/**/*.{js,vue,ts}',
    './components/**/*.{js,vue,ts}',
    './pages/**/*.{js,vue,ts}',
    './app/app.vue',
    './app/pages/**/*.vue',
    './app/components/**/*.vue',
    './app/layouts/**/*.vue',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#F8FAFC',
          'bg-dark': '#0F172A',
          surface: '#FFFFFF',
          'surface-dark': '#111827',
          'surface-muted': '#F1F5F9',
          'surface-muted-dark': '#172033',
          border: '#E2E8F0',
          'border-dark': '#253044',
          text: '#111827',
          'text-dark': '#F8FAFC',
          muted: '#64748B',
          'muted-dark': '#94A3B8',
          primary: '#2563EB',
          'primary-soft': '#EFF6FF',
          'primary-soft-dark': '#172554',
          success: '#16A34A',
          warning: '#D97706',
          error: '#DC2626',
        },
      },
      fontFamily: {
        app: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        app: '8px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.06), 0 8px 24px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config
