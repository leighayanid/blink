<template>
  <div class="flex flex-col gap-2 w-full">
    <div class="flex items-center gap-3">
      <UIcon
        :name="statusIcon"
        class="size-4 shrink-0"
        :class="statusIconClass"
      />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold truncate">{{ transfer.fileName }}</p>
        <p class="text-xs font-mono text-neutral-400">
          {{ formatFileSize(transfer.fileSize) }}<span v-if="transfer.speed"> · {{ formatSpeed(transfer.speed) }}</span>
        </p>
      </div>
      <span class="text-xs font-mono font-bold shrink-0 text-neutral-500">{{ statusLabel }}</span>
    </div>

    <UProgress
      :value="transfer.progress"
      :color="transfer.status === 'failed' ? 'error' : 'neutral'"
      size="xs"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Transfer } from '@blink/types'

const props = defineProps<{ transfer: Transfer }>()

const STATUS_LABELS: Record<string, string> = {
  pending: 'PENDING',
  sending: 'SENDING',
  receiving: 'RECEIVING',
  completed: 'DONE',
  failed: 'FAILED'
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
  return 'text-neutral-400'
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
