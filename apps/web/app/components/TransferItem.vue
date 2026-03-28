<template>
  <div class="w-full rounded-none border-b border-swiss-border dark:border-white/10 bg-white dark:bg-swiss-paper-dark p-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div class="flex min-w-0 items-center gap-3 sm:flex-1 sm:gap-4">
        <!-- Geometric Status Indicator -->
        <div class="flex size-10 shrink-0 items-center justify-center rounded-none border border-swiss-black dark:border-white" :class="statusBubbleClass">
          <UIcon
            :name="statusIcon"
            class="size-5"
            :class="statusIconClass"
          />
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-xs font-black uppercase tracking-tighter text-swiss-black dark:text-white">{{ transfer.fileName }}</p>
          <p class="mt-1 text-[9px] font-bold uppercase tracking-widest text-swiss-grey dark:text-swiss-grey-light">
            {{ formatFileSize(transfer.fileSize) }}<span v-if="transfer.speed"> · {{ formatSpeed(transfer.speed) }}</span>
          </p>
        </div>
      </div>
      <span class="self-start rounded-none border border-swiss-black dark:border-white px-3 py-1 text-[9px] font-black uppercase tracking-widest sm:self-auto" :class="statusLabelClass">{{ statusLabel }}</span>
    </div>

    <!-- Swiss Progress Bar -->
    <div class="mt-4 h-2 w-full bg-swiss-bg dark:bg-swiss-bg-dark border border-swiss-border dark:border-white/10">
      <div 
        class="h-full bg-swiss-orange transition-all duration-300"
        :style="{ width: `${transfer.progress}%` }"
        :class="{ 'bg-swiss-black dark:bg-white': transfer.status === 'completed', 'bg-red-600': transfer.status === 'failed' }"
      />
    </div>
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
  if (props.transfer.status === 'failed') return 'text-white dark:text-swiss-black'
  if (props.transfer.status === 'completed') return 'text-white dark:text-swiss-black'
  return 'text-swiss-black dark:text-white'
})

const statusBubbleClass = computed(() => {
  if (props.transfer.status === 'failed') return 'bg-red-600'
  if (props.transfer.status === 'completed') return 'bg-swiss-black dark:bg-white'
  if (props.transfer.status === 'pending') return 'bg-swiss-bg dark:bg-swiss-bg-dark'
  return 'bg-swiss-orange'
})

const statusLabelClass = computed(() => {
  if (props.transfer.status === 'failed') return 'bg-red-600 text-white'
  if (props.transfer.status === 'completed') return 'bg-swiss-black dark:bg-white text-white dark:text-swiss-black'
  if (props.transfer.status === 'pending') return 'bg-swiss-bg dark:bg-swiss-bg-dark text-swiss-grey'
  return 'bg-white dark:bg-swiss-paper-dark text-swiss-black dark:text-white'
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
