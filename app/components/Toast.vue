<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :class="[`toast--${toast.type}`]">
          <div class="toast-content">
            <span class="toast-icon">
              <!-- Icons -->
              <svg v-if="toast.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <svg v-else-if="toast.type === 'error'" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              <svg v-else-if="toast.type === 'warning'" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </span>
            <span class="toast-message">{{ toast.message.toUpperCase() }}</span>
          </div>
          <button class="toast-close" @click="removeToast(toast.id)" aria-label="Close notification">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  gap: 12px;
  max-width: 360px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  background: var(--bg-primary);
  border: 1px solid var(--text-primary);
  border-radius: 4px;
  pointer-events: auto;
  min-width: 280px;
  box-shadow: 0 4px 0 var(--text-primary);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
}

/* Variant Specifics */
.toast--success {
  background: var(--text-primary);
  color: var(--bg-primary);
  border-color: var(--text-primary);
}

.toast--success .toast-icon {
  color: var(--bg-primary);
}

.toast--success .toast-message {
  color: var(--bg-primary);
}

.toast--success .toast-close {
  color: var(--bg-primary);
}

.toast--error {
  border-color: var(--error);
}

.toast--error .toast-icon {
  color: var(--error);
}

.toast-message {
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: bold;
  line-height: 1.4;
  color: var(--text-primary);
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-close:hover {
  opacity: 0.7;
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
