<template>
  <Teleport to="body">
    <div class="toast-container">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="[`toast--${toast.type}`]"
        >
          <span class="toast-icon">{{ getIcon(toast.type) }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button
            class="toast-close"
            @click="removeToast(toast.id)"
            aria-label="Close notification"
          >
            &times;
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { ToastType } from '../composables/useToast'
import { useToast } from '../composables/useToast'

const { toasts, removeToast } = useToast()

const getIcon = (type: ToastType): string => {
  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '!'
  }
  return icons[type]
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column-reverse;
  gap: 0.75rem;
  max-width: 360px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  min-width: 280px;
}

/* Light mode defaults */
.toast--success {
  background-color: #ecfdf5;
  border: 1px solid #10b981;
  color: #065f46;
}

.toast--error {
  background-color: #fef2f2;
  border: 1px solid #ef4444;
  color: #991b1b;
}

.toast--info {
  background-color: #eff6ff;
  border: 1px solid #3b82f6;
  color: #1e40af;
}

.toast--warning {
  background-color: #fffbeb;
  border: 1px solid #f59e0b;
  color: #92400e;
}

/* Dark mode */
:global(html.dark) .toast--success {
  background-color: rgba(16, 185, 129, 0.15);
  border-color: #10b981;
  color: #6ee7b7;
}

:global(html.dark) .toast--error {
  background-color: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #fca5a5;
}

:global(html.dark) .toast--info {
  background-color: rgba(59, 130, 246, 0.15);
  border-color: #3b82f6;
  color: #93c5fd;
}

:global(html.dark) .toast--warning {
  background-color: rgba(245, 158, 11, 0.15);
  border-color: #f59e0b;
  color: #fcd34d;
}

.toast-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 0.875rem;
  font-weight: bold;
  flex-shrink: 0;
}

.toast--success .toast-icon {
  background-color: #10b981;
  color: white;
}

.toast--error .toast-icon {
  background-color: #ef4444;
  color: white;
}

.toast--info .toast-icon {
  background-color: #3b82f6;
  color: white;
}

.toast--warning .toast-icon {
  background-color: #f59e0b;
  color: white;
}

.toast-message {
  flex: 1;
  font-size: 0.9375rem;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
  opacity: 0.6;
  padding: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
  color: inherit;
}

.toast-close:hover {
  opacity: 1;
}

/* Slide-in animation from right */
.toast-enter-active {
  animation: toast-slide-in 0.3s ease-out;
}

.toast-leave-active {
  animation: toast-slide-out 0.25s ease-in forwards;
}

.toast-move {
  transition: transform 0.3s ease;
}

@keyframes toast-slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes toast-slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}
</style>
