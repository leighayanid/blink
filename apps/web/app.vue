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
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  background: var(--bg-primary);
  color: var(--text-primary);
  /* Background pattern is defined in design-system.css */
}

/* Scrollbar styling for Webkit */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--synth-black);
}

::-webkit-scrollbar-thumb {
  background: var(--synth-light-purple);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--neon-pink);
}
</style>
