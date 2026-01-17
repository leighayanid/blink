<template>
  <div :class="[isDark ? 'dark' : '', 'min-h-screen transition-colors duration-300']">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <!-- Global Toast Notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import Toast from '~/components/Toast.vue'

const { isDark } = useTheme()
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  color-scheme: light dark;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  @apply bg-light-primary text-light-primary dark:bg-dark-primary dark:text-dark-primary transition-colors duration-300;
}

/* Light mode CSS variables for fallback */
:root {
  --color-primary: #FFA500;
  --color-primary-light: #FFD580;
  --color-primary-lighter: #FFE6B3;
  --color-secondary: #FF8C42;
  --color-accent: #FFD700;

  --bg-primary: #FFFAF0;
  --bg-secondary: #FFFFFF;
  --bg-tertiary: #FFF8E7;

  --text-primary: #2C3E50;
  --text-secondary: #7F8C8D;
  --text-light: #95A5A6;

  --color-success: #10B981;
  --color-error: #EF4444;
  --color-warning: #F59E0B;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(255, 165, 0, 0.1);
}

/* Dark mode CSS variables */
html.dark {
  --color-primary: #FF9500;
  --color-primary-light: #FFB84D;
  --color-primary-lighter: #FFCC99;
  --color-secondary: #FF7A3D;
  --color-accent: #FFC107;

  --bg-primary: #0F1419;
  --bg-secondary: #1A2332;
  --bg-tertiary: #2D3E52;

  --text-primary: #F5F7FA;
  --text-secondary: #B0B8C1;
  --text-light: #8A92A0;

  --shadow-lg: 0 10px 15px rgba(255, 165, 0, 0.15);
}
</style>
