<template>
  <div class="w-full rounded-[1.25rem] border border-black/5 bg-white/60 p-4 dark:border-white/10 dark:bg-black/10">
    <div class="flex items-center gap-3">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-2xl" :class="statusBubbleClass">
        <UIcon
          :name="statusIcon"
          class="size-4"
          :class="statusIconClass"
        />
      </div>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-semibold text-neutral-950 dark:text-white">{{ transfer.fileName }}</p>
        <p class="text-xs text-neutral-500 dark:text-neutral-400">
          {{ formatFileSize(transfer.fileSize) }}<span v-if="transfer.speed"> · {{ formatSpeed(transfer.speed) }}</span>
        </p>
      </div>
      <span class="rounded-full px-3 py-1 text-[11px] font-medium" :class="statusLabelClass">{{ statusLabel }}</span>
    </div>

    <UProgress
      :value="transfer.progress"
      :color="progressColor"
      size="xs"
      class="mt-4"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Transfer } from '@blink/types'

const props = defineProps<{ transfer: Transfer }>()

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  sending: 'Sending',
  receiving: 'Receiving',
  completed: 'Done',
  failed: 'Failed'
}

const statusLabel = computed(() =>
  STATUS_LABELS[props.transfer.status] ?? props.transfer.status.toUpperCase()
)

const statusIcon = computed(() => {
  const map: Record<string, string> = {
    sending: 'i-lucide-send',
    receiving: 'i-lucide-download',
    completed: 'i-lucide-check',
    failed: 'i-lucide-x',
    pending: 'i-lucide-clock'
  }
  return map[props.transfer.status] ?? 'i-lucide-clock'
})

const statusIconClass = computed(() => {
  if (props.transfer.status === 'failed') return 'text-red-500'
  if (props.transfer.status === 'completed') return 'text-green-500'
  if (props.transfer.status === 'pending') return 'text-neutral-500 dark:text-neutral-300'
  return 'text-primary-700 dark:text-primary-300'
})

const statusBubbleClass = computed(() => {
  if (props.transfer.status === 'failed') return 'bg-red-50 dark:bg-red-950/20'
  if (props.transfer.status === 'completed') return 'bg-emerald-50 dark:bg-emerald-950/20'
  if (props.transfer.status === 'pending') return 'bg-neutral-100 dark:bg-white/10'
  return 'bg-primary-100 dark:bg-primary-500/15'
})

const statusLabelClass = computed(() => {
  if (props.transfer.status === 'failed') return 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-300'
  if (props.transfer.status === 'completed') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300'
  if (props.transfer.status === 'pending') return 'bg-neutral-100 text-neutral-600 dark:bg-white/10 dark:text-neutral-300'
  return 'bg-primary-50 text-primary-700 dark:bg-primary-500/12 dark:text-primary-300'
})

const progressColor = computed(() => {
  if (props.transfer.status === 'failed') return 'error'
  if (props.transfer.status === 'completed') return 'success'
  if (props.transfer.status === 'pending') return 'neutral'
  return 'warning'
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
