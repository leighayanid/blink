<template>
  <div class="layout">
    <header class="app-header">
      <h1>🚀 Hatid</h1>
      <p class="subtitle">Share files instantly on your local network</p>
    </header>

    <div class="content-wrapper">
      <!-- Autoresize Container -->
      <div class="autoresize-container">
        <!-- Left Column -->
        <div class="column left-column">
          <slot name="left" />
        </div>

        <!-- Center Column -->
        <div class="column center-column">
          <slot name="center" />
        </div>

        <!-- Right Column -->
        <div class="column right-column">
          <slot name="right" />
        </div>
      </div>

      <!-- Full Width Bottom Section -->
      <div class="bottom-section">
        <slot name="bottom" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const containerRef = ref<HTMLElement | null>(null)
const columnHeights = ref({
  left: 0,
  center: 0,
  right: 0
})

const updateColumnHeights = () => {
  if (!containerRef.value) return

  const columns = containerRef.value.querySelectorAll('.column')
  if (columns.length >= 3) {
    columnHeights.value.left = (columns[0] as HTMLElement).offsetHeight
    columnHeights.value.center = (columns[1] as HTMLElement).offsetHeight
    columnHeights.value.right = (columns[2] as HTMLElement).offsetHeight
  }
}

onMounted(() => {
  updateColumnHeights()
  // Use ResizeObserver for better autoresize functionality
  const resizeObserver = new ResizeObserver(() => {
    updateColumnHeights()
  })

  const container = containerRef.value as HTMLElement
  if (container) {
    const columns = container.querySelectorAll('.column')
    columns.forEach((col) => resizeObserver.observe(col))
  }

  // Also listen to window resize
  window.addEventListener('resize', updateColumnHeights)

  onUnmounted(() => {
    window.removeEventListener('resize', updateColumnHeights)
    resizeObserver.disconnect()
  })
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem;
}

.app-header {
  text-align: center;
  margin-bottom: 2rem;
  max-width: 100%;
}

.app-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.content-wrapper {
  max-width: 1600px;
  margin: 0 auto;
}

.autoresize-container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.left-column,
.right-column {
  /* Auto-resize to fit content */
  align-content: start;
}

.center-column {
  /* Takes up more space in the center */
  align-content: start;
}

.bottom-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Tablet Breakpoint (1200px and below) */
@media (max-width: 1200px) {
  .autoresize-container {
    grid-template-columns: 1fr 1.5fr;
    gap: 1.5rem;
  }

  .right-column {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

/* Tablet Breakpoint (768px and below) */
@media (max-width: 768px) {
  .layout {
    padding: 1rem;
  }

  .app-header h1 {
    font-size: 2rem;
  }

  .autoresize-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .left-column,
  .center-column,
  .right-column {
    width: 100%;
  }
}

/* Mobile Breakpoint (480px and below) */
@media (max-width: 480px) {
  .layout {
    padding: 0.75rem;
  }

  .app-header h1 {
    font-size: 1.75rem;
  }

  .app-header {
    margin-bottom: 1.5rem;
  }

  .content-wrapper {
    gap: 1rem;
  }
}
</style>
