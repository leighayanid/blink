import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

export default {
  content: [
    './app.vue',
    './app/**/*.{js,vue,ts}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Synthwave Neon Colors
        neon: {
          pink: '#FF00FF',
          'pink-light': '#FF66FF',
          'pink-dark': '#CC00CC',
          cyan: '#00FFFF',
          'cyan-light': '#66FFFF',
          'cyan-dark': '#00CCCC',
          purple: '#9400D3',
          'purple-light': '#A855F7',
          'purple-dark': '#7B22B8',
          yellow: '#FFFF00',
          green: '#00FF7F',
        },
        // Synthwave Background Colors
        synth: {
          black: '#0A0A0F',
          'dark-purple': '#0D0D1A',
          purple: '#16162A',
          'light-purple': '#1E1E3F',
          card: '#1A1A2E',
        },
        // Status Colors (Neon variants)
        status: {
          success: '#00FF7F',
          error: '#FF3366',
          warning: '#FFD700',
          info: '#00FFFF',
        },
        // Keep original colors for light mode fallback
        primary: {
          50: '#FFF9F0',
          100: '#FFEFDE',
          200: '#FFD580',
          300: '#FFE6B3',
          400: '#FFB84D',
          500: '#FFA500',
          600: '#FF9500',
          700: '#FF8C42',
          800: '#FF7A3D',
          900: '#FF6B00',
        },
        secondary: {
          50: '#FFF5EE',
          100: '#FFEAD0',
          500: '#FF8C42',
          600: '#FF7A3D',
          700: '#E57C2C',
          900: '#9B4A1A',
        },
        accent: {
          50: '#FFFEF5',
          100: '#FFFCE8',
          500: '#FFD700',
          600: '#FFC107',
          700: '#E5B800',
        },
        neutral: {
          0: '#FFFFFF',
          50: '#FFFAF0',
          100: '#FFF8E7',
          200: '#F5F5F5',
          300: '#E8E8E8',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          850: '#2D3E52',
          900: '#212121',
          950: '#121212',
        },
        dark: {
          primary: '#0A0A0F',
          secondary: '#16162A',
          tertiary: '#1E1E3F',
          text: '#F5F7FA',
          muted: '#8A92A0',
        },
        light: {
          primary: '#FFFAF0',
          secondary: '#FFFFFF',
          tertiary: '#FFF8E7',
          text: '#2C3E50',
          muted: '#95A5A6',
        },
      },
      backgroundColor: {
        'light-primary': '#FFFAF0',
        'light-secondary': '#FFFFFF',
        'light-tertiary': '#FFF8E7',
        'dark-primary': '#0A0A0F',
        'dark-secondary': '#16162A',
        'dark-tertiary': '#1E1E3F',
      },
      textColor: {
        'light-primary': '#2C3E50',
        'light-secondary': '#7F8C8D',
        'light-muted': '#95A5A6',
        'dark-primary': '#F5F7FA',
        'dark-secondary': '#B0B8C1',
        'dark-muted': '#8A92A0',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: 'var(--shadow-lg)',
        'primary-glow': '0 0 20px rgba(255, 165, 0, 0.3)',
        'primary-glow-dark': '0 0 20px rgba(255, 165, 0, 0.2)',
        // Neon glow shadows
        'neon-pink': '0 0 10px #FF00FF, 0 0 20px #FF00FF, 0 0 40px #FF00FF',
        'neon-pink-sm': '0 0 5px #FF00FF, 0 0 10px #FF00FF',
        'neon-cyan': '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 40px #00FFFF',
        'neon-cyan-sm': '0 0 5px #00FFFF, 0 0 10px #00FFFF',
        'neon-purple': '0 0 10px #9400D3, 0 0 20px #9400D3, 0 0 40px #9400D3',
        'neon-green': '0 0 10px #00FF7F, 0 0 20px #00FF7F, 0 0 40px #00FF7F',
        'neon-red': '0 0 10px #FF3366, 0 0 20px #FF3366',
      },
      transitionDuration: {
        300: '300ms',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
      },
      animation: {
        'neon-pulse': 'neonPulse 2s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 3s ease-in-out infinite',
        'text-glow': 'textGlow 2s ease-in-out infinite',
        'border-pulse': 'borderPulse 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 3s ease infinite',
      },
      keyframes: {
        neonPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '41%': { opacity: '1' },
          '42%': { opacity: '0.8' },
          '43%': { opacity: '1' },
          '45%': { opacity: '0.7' },
          '46%': { opacity: '1' },
        },
        textGlow: {
          '0%, 100%': {
            textShadow: '0 0 10px #FF00FF, 0 0 20px #FF00FF',
          },
          '50%': {
            textShadow: '0 0 20px #00FFFF, 0 0 40px #00FFFF',
          },
        },
        borderPulse: {
          '0%, 100%': {
            borderColor: '#FF00FF',
            boxShadow: '0 0 5px #FF00FF',
          },
          '50%': {
            borderColor: '#00FFFF',
            boxShadow: '0 0 15px #00FFFF',
          },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(255, 0, 255, 0.03) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(255, 0, 255, 0.03) 1px, transparent 1px)`,
        'synth-gradient': 'linear-gradient(135deg, #0A0A0F 0%, #16162A 50%, #1E1E3F 100%)',
        'neon-gradient': 'linear-gradient(135deg, #FF00FF 0%, #00FFFF 100%)',
        'neon-gradient-alt': 'linear-gradient(135deg, #9400D3 0%, #FF00FF 50%, #00FFFF 100%)',
      },
    },
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        // Text glow utilities
        '.text-glow-pink': {
          textShadow: '0 0 10px #FF00FF, 0 0 20px #FF00FF, 0 0 30px #FF00FF',
        },
        '.text-glow-cyan': {
          textShadow: '0 0 10px #00FFFF, 0 0 20px #00FFFF, 0 0 30px #00FFFF',
        },
        '.text-glow-purple': {
          textShadow: '0 0 10px #9400D3, 0 0 20px #9400D3',
        },
        // Gradient text
        '.text-gradient-neon': {
          background: 'linear-gradient(90deg, #FF00FF, #00FFFF, #FF00FF)',
          backgroundSize: '200% auto',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          backgroundClip: 'text',
        },
        // Border glow utilities
        '.border-glow-pink': {
          borderColor: '#FF00FF',
          boxShadow: '0 0 10px #FF00FF, inset 0 0 10px rgba(255, 0, 255, 0.1)',
        },
        '.border-glow-cyan': {
          borderColor: '#00FFFF',
          boxShadow: '0 0 10px #00FFFF, inset 0 0 10px rgba(0, 255, 255, 0.1)',
        },
        // Glass effect for synthwave
        '.glass-synth': {
          background: 'rgba(22, 22, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          '-webkit-backdrop-filter': 'blur(12px)',
          border: '1px solid rgba(255, 0, 255, 0.2)',
        },
        // Grid background
        '.bg-grid': {
          backgroundImage: `linear-gradient(rgba(255, 0, 255, 0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255, 0, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        },
      })
    }),
  ],
} satisfies Config
