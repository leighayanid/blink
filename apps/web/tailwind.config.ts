import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

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
        // Swiss Minimalism / Bauhaus Palette
        swiss: {
          bg: '#F5F5F5',
          'bg-dark': '#1A1A1A',
          paper: '#FFFFFF',
          'paper-dark': '#262626',
          black: '#000000',
          'black-soft': '#1A1A1A',
          orange: '#FF6B00',
          'orange-light': '#FF8533',
          red: '#E63946',
          grey: '#666666',
          'grey-light': '#CCCCCC',
          border: '#000000',
          'border-dark': '#FFFFFF',
        },
        // HUD / Command Center Colors
        hud: {
          bg: '#050508',
          'bg-soft': '#0A0A0F',
          'bg-card': '#0D0D14',
          orange: '#FF6B00',
          'orange-glow': '#FF8533',
          cyan: '#00F0FF',
          'cyan-glow': '#33F3FF',
          green: '#00FF41',
          'green-glow': '#33FF67',
          red: '#FF003C',
          text: '#E0E6ED',
          'text-muted': '#8A92A0',
          border: '#1A1D23',
          'border-active': '#2D323A',
        },
        // Legacy colors kept for compatibility
        primary: {
          50: '#FFF9F0',
          100: '#FFEFDE',
          200: '#FFD580',
          300: '#FFE6B3',
          400: '#FFB84D',
          500: '#FF6B00',
          600: '#E66000',
          700: '#CC5500',
          800: '#B34A00',
          900: '#994000',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        swiss: ['Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderWidth: {
        DEFAULT: '1px',
        '0': '0',
        '2': '2px',
        '3': '3px',
        '4': '4px',
        '6': '6px',
        '8': '8px',
      },
      boxShadow: {
        'hud-orange': '0 0 15px rgba(255, 107, 0, 0.3), inset 0 0 10px rgba(255, 107, 0, 0.1)',
        'hud-cyan': '0 0 15px rgba(0, 240, 255, 0.3), inset 0 0 10px rgba(0, 240, 255, 0.1)',
        'hud-green': '0 0 15px rgba(0, 255, 65, 0.2), inset 0 0 10px rgba(0, 255, 65, 0.1)',
      },
      animation: {
        'crt-flicker': 'crtFlicker 0.15s infinite',
        'terminal-scan': 'terminalScan 4s linear infinite',
        'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glitch': 'glitch 1s linear infinite',
        'radar': 'radar 4s linear infinite',
      },
      keyframes: {
        crtFlicker: {
          '0%': { opacity: '0.97' },
          '100%': { opacity: '1' },
        },
        terminalScan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      backgroundImage: {
        'hud-grid': 'linear-gradient(rgba(26, 29, 35, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(26, 29, 35, 0.5) 1px, transparent 1px)',
        'hud-scanlines': 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0px, rgba(0, 0, 0, 0.1) 1px, transparent 1px, transparent 2px)',
      },
    },
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        '.text-glow-pink': {
          textShadow: '0 0 10px #FF00FF, 0 0 20px #FF00FF, 0 0 30px #FF00FF',
        },
        '.text-glow-cyan': {
          textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF',
        },
        '.text-glow-purple': {
          textShadow: '0 0 10px #9400D3, 0 0 20px #9400D3',
        },
        '.text-gradient-neon': {
          background: 'linear-gradient(90deg, #FF00FF, #00FFFF, #FF00FF)',
          backgroundSize: '200% auto',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          backgroundClip: 'text',
        },
        '.border-glow-pink': {
          borderColor: '#FF00FF',
          boxShadow: '0 0 10px #FF00FF, inset 0 0 10px rgba(255, 0, 255, 0.1)',
        },
        '.border-glow-cyan': {
          borderColor: '#00FFFF',
          boxShadow: '0 0 10px #00FFFF, inset 0 0 10px rgba(0, 255, 255, 0.1)',
        },
        '.glass-synth': {
          background: 'rgba(22, 22, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
          border: '1px solid rgba(255, 0, 255, 0.2)',
        },
        '.bg-grid': {
          backgroundImage: `linear-gradient(rgba(255, 0, 255, 0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255, 0, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        },
      })
    }),
  ],
} satisfies Config
