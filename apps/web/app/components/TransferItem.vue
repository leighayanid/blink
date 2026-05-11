<template>
  <div class="w-full rounded-app border border-app-border bg-app-surface p-4 dark:border-app-border-dark dark:bg-app-surface-dark">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div class="flex min-w-0 items-center gap-3 sm:flex-1">
        <div class="flex size-10 shrink-0 items-center justify-center rounded-md" :class="statusBubbleClass">
          <UIcon
            :name="statusIcon"
            class="size-5"
            :class="statusIconClass"
          />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-app-text dark:text-app-text-dark">{{ transfer.fileName }}</p>
          <p class="mt-1 text-xs text-app-muted dark:text-app-muted-dark">
            {{ formatFileSize(transfer.fileSize) }}<span v-if="transfer.speed"> · {{ formatSpeed(transfer.speed) }}</span>
          </p>
        </div>
      </div>
      <span class="self-start rounded-full px-2.5 py-1 text-xs font-medium sm:self-auto" :class="statusLabelClass">{{ statusLabel }}</span>
    </div>

    <div class="mt-4 h-2 w-full overflow-hidden rounded-full bg-app-surface-muted dark:bg-app-surface-muted-dark">
      <div
        class="progress-fill h-full rounded-full transition-all duration-300"
        :style="{ width: `${transfer.progress}%` }"
        :class="[progressClass, { failed: transfer.status === 'failed' }]"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Transfer } from '@blink/types'

const props = defineProps<{ transfer: Transfer }>()

const STATUS_LABELS: Record<string, string> = {
  queued: 'Queued',
  pending: 'Pending',
  sending: 'Sending',
  receiving: 'Receiving',
  completed: 'Done',
  failed: 'Failed'
}

const statusLabel = computed(() =>
  STATUS_LABELS[props.transfer.status] ?? props.transfer.status
)

const statusIcon = computed(() => {
  const map: Record<string, string> = {
    queued: 'i-lucide-list-end',
    sending: 'i-lucide-send',
    receiving: 'i-lucide-download',
    completed: 'i-lucide-check',
    failed: 'i-lucide-x',
    pending: 'i-lucide-clock'
  }
  return map[props.transfer.status] ?? 'i-lucide-clock'
})

const statusIconClass = computed(() => {
  if (props.transfer.status === 'failed') return 'text-app-error'
  if (props.transfer.status === 'completed') return 'text-app-success'
  if (props.transfer.status === 'queued' || props.transfer.status === 'pending') return 'text-app-muted dark:text-app-muted-dark'
  return 'text-app-primary'
})

const statusBubbleClass = computed(() => {
  if (props.transfer.status === 'failed') return 'bg-red-50 dark:bg-red-950/30'
  if (props.transfer.status === 'completed') return 'bg-green-50 dark:bg-green-950/30'
  if (props.transfer.status === 'queued' || props.transfer.status === 'pending') return 'bg-app-surface-muted dark:bg-app-surface-muted-dark'
  return 'bg-app-primary-soft dark:bg-app-primary-soft-dark'
})

const statusLabelClass = computed(() => {
  if (props.transfer.status === 'failed') return 'bg-red-50 text-app-error dark:bg-red-950/30'
  if (props.transfer.status === 'completed') return 'bg-green-50 text-app-success dark:bg-green-950/30'
  if (props.transfer.status === 'queued' || props.transfer.status === 'pending') return 'bg-app-surface-muted text-app-muted dark:bg-app-surface-muted-dark dark:text-app-muted-dark'
  return 'bg-app-primary-soft text-app-primary dark:bg-app-primary-soft-dark dark:text-blue-200'
})

const progressClass = computed(() => {
  if (props.transfer.status === 'failed') return 'bg-app-error'
  if (props.transfer.status === 'completed') return 'bg-app-success'
  if (props.transfer.status === 'queued' || props.transfer.status === 'pending') return 'bg-app-muted dark:bg-app-muted-dark'
  return 'bg-app-primary'
})

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

const formatSpeed = (bytesPerSecond: number): string => formatFileSize(bytesPerSecond) + '/s'
</script>
