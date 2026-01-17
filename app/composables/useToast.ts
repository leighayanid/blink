import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration: number
}

// Singleton pattern - shared state across components
const toasts = ref<Toast[]>([])

let toastIdCounter = 0

const generateId = (): string => {
  return `toast-${Date.now()}-${++toastIdCounter}`
}

const removeToast = (id: string): void => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

const showToast = (type: ToastType, message: string, duration: number = 4000): string => {
  const id = generateId()
  const toast: Toast = { id, type, message, duration }

  toasts.value.push(toast)

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

// Helper functions for common toast types
const success = (message: string, duration?: number): string => {
  return showToast('success', message, duration)
}

const error = (message: string, duration?: number): string => {
  return showToast('error', message, duration)
}

const info = (message: string, duration?: number): string => {
  return showToast('info', message, duration)
}

const warning = (message: string, duration?: number): string => {
  return showToast('warning', message, duration)
}

export function useToast() {
  return {
    toasts,
    showToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
}
