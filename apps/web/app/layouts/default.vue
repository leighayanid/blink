<template>
  <div class="layout">
    <slot />
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* Dark mode - transparent to show synthwave body background */
:global(html.dark) .layout {
  background-color: transparent;
}
</style>
