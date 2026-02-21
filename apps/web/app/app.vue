<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Toast />
</template>

<script setup lang="ts">
import Toast from './components/Toast.vue'
</script>

<style>
/* Orbitron is loaded via nuxt.config.ts app.head.link — no @import needed here */

/* ============================================
   GLOBAL BASE STYLES
   ============================================ */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: var(--font-sans);
  line-height: var(--leading-normal);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* ============================================
   LIGHT MODE CSS VARIABLES
   ============================================ */
:root {
  /* Background Colors */
  --bg-primary: #FAFAFA;
  --bg-secondary: #FFFFFF;
  --bg-tertiary: #F5F5F5;

  /* Text Colors */
  --text-primary: #1A1A1A;
  --text-secondary: #6B7280;
  --text-tertiary: #9CA3AF;

  /* Primary Brand Colors */
  --color-primary: #FF9500;
  --color-secondary: #FFB84D;

  /* Status Colors */
  --color-success: #10B981;
  --color-error: #EF4444;
  --color-warning: #F59E0B;
}

/* ============================================
   DARK MODE (SYNTHWAVE) CSS VARIABLES
   ============================================ */
html.dark {
  /* Synthwave Background Colors */
  --bg-primary: #0A0A0F;
  --bg-secondary: #16162A;
  --bg-tertiary: #1E1E3F;

  /* Neon Text Colors */
  --text-primary: #F0F0F5;
  --text-secondary: #A0A0C0;
  --text-tertiary: #6B6B8A;

  /* Neon Primary Colors */
  --color-primary: #FF00FF;
  --color-secondary: #00FFFF;

  /* Synthwave Status Colors */
  --color-success: #00FF7F;
  --color-error: #FF3366;
  --color-warning: #FFD700;
}

/* ============================================
   DARK MODE BODY STYLES - SYNTHWAVE BACKGROUND
   ============================================ */
html.dark body {
  background-color: var(--bg-primary);
  background-image:
    /* Layer 5: Vertical grid lines with perspective */
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 59px,
      rgba(255, 0, 255, 0.06) 59px,
      rgba(255, 0, 255, 0.06) 60px
    ),
    /* Layer 4: Horizontal grid lines (denser at horizon) */
    linear-gradient(
      180deg,
      transparent 0%,
      transparent 55%,
      rgba(255, 0, 255, 0.03) 56%,
      transparent 56.5%,
      transparent 62%,
      rgba(255, 0, 255, 0.04) 63%,
      transparent 63.5%,
      transparent 68%,
      rgba(255, 0, 255, 0.05) 69%,
      transparent 69.5%,
      transparent 73%,
      rgba(255, 0, 255, 0.06) 74%,
      transparent 74.5%,
      transparent 77%,
      rgba(255, 0, 255, 0.07) 78%,
      transparent 78.5%,
      transparent 80%,
      rgba(0, 255, 255, 0.08) 81%,
      transparent 81.5%,
      transparent 83%,
      rgba(0, 255, 255, 0.1) 84%,
      transparent 84.5%,
      transparent 86%,
      rgba(0, 255, 255, 0.12) 87%,
      transparent 87.5%
    ),
    /* Layer 3: Synthwave sun at horizon */
    radial-gradient(
      ellipse 120% 50% at 50% 105%,
      rgba(255, 0, 128, 0.4) 0%,
      rgba(255, 0, 255, 0.25) 25%,
      rgba(148, 0, 211, 0.15) 40%,
      rgba(0, 255, 255, 0.08) 55%,
      transparent 70%
    ),
    /* Layer 2: Horizon glow line */
    linear-gradient(
      180deg,
      transparent 0%,
      transparent 84%,
      rgba(255, 0, 255, 0.3) 85%,
      rgba(0, 255, 255, 0.5) 85.5%,
      rgba(255, 0, 255, 0.3) 86%,
      transparent 87%
    ),
    /* Layer 1: Base gradient (deep space) */
    linear-gradient(
      180deg,
      #0A0A0F 0%,
      #0D0D1A 25%,
      #16162A 50%,
      #1A1A35 75%,
      #1E1E3F 100%
    );
  background-size: 60px 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%;
  background-position: center, center, center, center, center;
}

/* Synthwave sun pulse animation container */
html.dark body::after {
  content: '';
  position: fixed;
  inset: 0;
  background: radial-gradient(
    ellipse 100% 40% at 50% 100%,
    rgba(255, 0, 128, 0.15) 0%,
    rgba(255, 0, 255, 0.08) 30%,
    transparent 60%
  );
  pointer-events: none;
  z-index: -1;
  animation: horizonPulse 8s ease-in-out infinite;
}

@keyframes horizonPulse {
  0%, 100% {
    opacity: 0.6;
    transform: scaleY(1);
  }
  50% {
    opacity: 1;
    transform: scaleY(1.1);
  }
}

/* ============================================
   SCROLLBAR STYLING (Dark Mode)
   ============================================ */
html.dark ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

html.dark ::-webkit-scrollbar-track {
  background: var(--bg-secondary);
}

html.dark ::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, var(--neon-pink), var(--neon-purple));
  border-radius: 4px;
}

html.dark ::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, var(--neon-pink-light), var(--neon-pink));
}

/* ============================================
   SELECTION STYLING
   ============================================ */
::selection {
  background: rgba(255, 165, 0, 0.3);
  color: var(--text-primary);
}

html.dark ::selection {
  background: rgba(255, 0, 255, 0.4);
  color: white;
}

/* ============================================
   FONT DISPLAY CLASS
   ============================================ */
.font-display {
  font-family: 'Orbitron', var(--font-sans);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* ============================================
   CRT SCANLINE OVERLAY (Optional)
   ============================================ */
html.dark body::before {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.02) 2px,
    rgba(0, 0, 0, 0.02) 4px
  );
  pointer-events: none;
  z-index: 9999;
  opacity: 0.4;
}

/* Reduce effects on mobile for performance */
@media (max-width: 767px) {
  html.dark body {
    background-image:
      /* Simplified grid for mobile */
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 39px,
        rgba(255, 0, 255, 0.04) 39px,
        rgba(255, 0, 255, 0.04) 40px
      ),
      /* Simplified horizon lines */
      linear-gradient(
        180deg,
        transparent 0%,
        transparent 75%,
        rgba(255, 0, 255, 0.05) 80%,
        transparent 80.5%,
        transparent 85%,
        rgba(0, 255, 255, 0.08) 86%,
        transparent 86.5%
      ),
      /* Synthwave sun */
      radial-gradient(
        ellipse 150% 60% at 50% 110%,
        rgba(255, 0, 128, 0.3) 0%,
        rgba(255, 0, 255, 0.15) 30%,
        transparent 60%
      ),
      /* Base gradient */
      linear-gradient(
        180deg,
        #0A0A0F 0%,
        #0D0D1A 30%,
        #16162A 60%,
        #1A1A35 100%
      );
    background-size: 40px 100%, 100% 100%, 100% 100%, 100% 100%;
  }

  html.dark body::before {
    opacity: 0;
  }

  html.dark body::after {
    opacity: 0.5;
  }
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  html.dark body::before {
    display: none;
  }

  html.dark body::after {
    animation: none;
  }
}
</style>
