<template>
  <div class="layout">
    <header class="app-header">
      <div class="header-content">
        <h1>☀️ Blink</h1>
        <p class="subtitle">Share files instantly on your local network</p>
      </div>
      <button class="theme-toggle" @click="toggleColorMode" :title="colorMode.value === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
        <ClientOnly>
          {{ colorMode.value === 'dark' ? '☀️' : '🌙' }}
          <template #fallback>
            🌙
          </template>
        </ClientOnly>
      </button>
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
import { ref, onMounted, onUnmounted, computed } from 'vue'

const colorMode = useColorMode()
const containerRef = ref<HTMLElement | null>(null)
const columnHeights = ref({
  left: 0,
  center: 0,
  right: 0
})

const toggleColorMode = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

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
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-tertiary) 100%);
  padding: 2rem;
  transition: background 0.3s ease;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  max-width: 100%;
  background: linear-gradient(135deg, rgba(255, 165, 0, 0.05) 0%, rgba(255, 215, 0, 0.05) 100%);
  padding: 2rem;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  border: 2px solid var(--color-primary-lighter);
  box-shadow: var(--shadow-lg);
}

.header-content {
  text-align: center;
  flex: 1;
}

.app-header h1 {
  font-size: 2.8rem;
  margin-bottom: 0.5rem;
  color: var(--color-primary);
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  font-weight: 500;
}

.theme-toggle {
  flex-shrink: 0;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  border: none;
  border-radius: 50px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
  transform: scale(1);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  height: 52px;
}

.theme-toggle:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-lg);
}

.theme-toggle:active {
  transform: scale(0.95);
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
  align-content: start;
}

.center-column {
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

  .app-header {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
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
    padding: 1rem;
  }

  .content-wrapper {
    gap: 1rem;
  }

  .theme-toggle {
    padding: 0.5rem 0.75rem;
    font-size: 1.2rem;
  }
}
</style>
