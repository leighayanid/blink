<template>
  <div
    class="transfer-progress flex min-h-[14rem] flex-col rounded-app border border-app-border bg-app-surface p-4 dark:border-app-border-dark dark:bg-app-surface-dark sm:p-5 xl:h-full xl:min-h-0"
    :class="{ embedded }"
  >
    <div class="mb-4 flex rounded-app bg-app-surface-muted p-1 dark:bg-app-surface-muted-dark">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="tab-btn relative flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors"
        :class="activeTab === tab.value
          ? 'active bg-app-surface text-app-text shadow-sm dark:bg-app-surface-dark dark:text-app-text-dark'
          : 'text-app-muted hover:text-app-text dark:text-app-muted-dark dark:hover:text-app-text-dark'"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <span
          v-if="tab.value === 'active' && activeCount > 0"
          class="badge ml-1 rounded-full bg-app-primary-soft px-1.5 py-0.5 text-xs text-app-primary dark:bg-app-primary-soft-dark dark:text-blue-200"
        >
          {{ activeCount }}
        </span>
      </button>
    </div>

    <div v-if="activeTab === 'active'" class="flex-1 overflow-y-auto">
      <div
        v-if="activeTransfers.length === 0"
        class="flex min-h-40 items-center justify-center rounded-app border border-dashed border-app-border bg-app-bg px-4 text-center dark:border-app-border-dark dark:bg-app-bg-dark xl:h-full xl:min-h-44"
      >
        <p class="text-sm text-app-muted dark:text-app-muted-dark">No transfers in progress</p>
      </div>
      <div v-else class="flex flex-col gap-3">
        <template v-for="item in activeDisplayItems" :key="item.key">
          <TransferItem
            v-if="item.type === 'single'"
            :transfer="item.transfer"
          />
          <div
            v-else
            class="batch-transfer rounded-app border border-app-border bg-app-surface p-4 dark:border-app-border-dark dark:bg-app-surface-dark"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div class="min-w-0">
                <div class="flex items-center gap-3">
                  <div class="flex size-10 shrink-0 items-center justify-center rounded-md bg-app-primary-soft text-app-primary dark:bg-app-primary-soft-dark dark:text-blue-200">
                    <UIcon name="i-lucide-files" class="size-5" />
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold text-app-text dark:text-app-text-dark">{{ item.title }}</p>
                    <p class="mt-1 text-xs text-app-muted dark:text-app-muted-dark">{{ item.summary }}</p>
                  </div>
                </div>
              </div>
              <span class="self-start rounded-full bg-app-primary-soft px-2.5 py-1 text-xs font-medium text-app-primary dark:bg-app-primary-soft-dark dark:text-blue-200">
                {{ Math.round(item.progress) }}%
              </span>
            </div>

            <div class="mt-4 h-2 w-full overflow-hidden rounded-full bg-app-surface-muted dark:bg-app-surface-muted-dark">
              <div
                class="h-full rounded-full bg-app-primary transition-all duration-300"
                :style="{ width: `${item.progress}%` }"
              />
            </div>

            <div class="mt-4 divide-y divide-app-border rounded-md border border-app-border bg-app-bg dark:divide-app-border-dark dark:border-app-border-dark dark:bg-app-bg-dark">
              <div
                v-for="transfer in item.transfers"
                :key="transfer.id"
                class="flex items-center gap-3 px-3 py-2.5"
              >
                <UIcon :name="statusIcon(transfer.status)" class="size-4 shrink-0" :class="statusIconClass(transfer.status)" />
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-medium text-app-text dark:text-app-text-dark">{{ transfer.fileName }}</p>
                  <p class="mt-0.5 text-xs text-app-muted dark:text-app-muted-dark">
                    {{ statusLabel(transfer.status) }} · {{ formatFileSize(transfer.fileSize) }}
                  </p>
                </div>
                <span class="shrink-0 text-xs font-medium text-app-muted dark:text-app-muted-dark">{{ Math.round(transfer.progress) }}%</span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <div v-else class="flex-1 overflow-y-auto">
      <div
        v-if="historyTransfers.length === 0"
        class="flex min-h-40 items-center justify-center rounded-app border border-dashed border-app-border bg-app-bg px-4 text-center dark:border-app-border-dark dark:bg-app-bg-dark xl:h-full xl:min-h-44"
      >
        <p class="text-sm text-app-muted dark:text-app-muted-dark">No past transfers yet</p>
      </div>
      <div v-else class="flex flex-col gap-3">
        <TransferItem
          v-for="transfer in historyTransfers"
          :key="transfer.id"
          :transfer="transfer"
        />
        <div class="flex justify-center pt-2">
          <UButton
            color="neutral"
            variant="outline"
            class="clear-btn w-full rounded-app border-app-border px-5 py-3 text-sm font-medium text-app-text hover:bg-app-surface-muted dark:border-app-border-dark dark:text-app-text-dark dark:hover:bg-app-surface-muted-dark sm:w-auto"
            @click="store.clearCompleted()"
          >
            Clear history
          </UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useTransfersStore } from '../stores/transfers'
import TransferItem from './TransferItem.vue'
import type { Transfer } from '@blink/types'

defineProps<{
  embedded?: boolean
}>()

const store = useTransfersStore()
const { activeTransfers, completedTransfers, failedTransfers, activeCount } = storeToRefs(store)

const activeTab = ref<'active' | 'history'>('active')

const tabs = [
  { label: 'Active', value: 'active' as const },
  { label: 'History', value: 'history' as const }
]

type ActiveDisplayItem =
  | { type: 'single'; key: string; transfer: Transfer }
  | {
      type: 'batch'
      key: string
      title: string
      summary: string
      progress: number
      transfers: Transfer[]
    }

const historyTransfers = computed(() => [
  ...completedTransfers.value,
  ...failedTransfers.value
])

const activeBatchIds = computed(() =>
  new Set(
    activeTransfers.value
      .filter(transfer => transfer.batchId && (transfer.batchCount ?? 0) > 1)
      .map(transfer => transfer.batchId as string)
  )
)

const allTransfers = computed(() => [
  ...activeTransfers.value,
  ...completedTransfers.value,
  ...failedTransfers.value
])

const activeDisplayItems = computed<ActiveDisplayItem[]>(() => {
  const batchItems = Array.from(activeBatchIds.value).map((batchId) => {
    const transfers = allTransfers.value
      .filter(transfer => transfer.batchId === batchId)
      .sort((a, b) => (a.batchIndex ?? 0) - (b.batchIndex ?? 0))

    const first = transfers[0]
    const totalCount = first?.batchCount ?? transfers.length
    const totalSize = first?.batchTotalSize ?? transfers.reduce((sum, transfer) => sum + transfer.fileSize, 0)
    const transferredBytes = transfers.reduce((sum, transfer) => {
      if (transfer.status === 'completed') return sum + transfer.fileSize
      return sum + transfer.fileSize * (transfer.progress / 100)
    }, 0)
    const progress = totalSize > 0 ? Math.min(100, (transferredBytes / totalSize) * 100) : 0
    const completedCount = transfers.filter(transfer => transfer.status === 'completed').length
    const failedCount = transfers.filter(transfer => transfer.status === 'failed').length
    const direction = transfers.some(transfer => transfer.status === 'receiving' || transfer.fromDevice) ? 'Receiving' : 'Sending'
    const labelledTransfer = transfers.find(transfer => transfer.fromDevice || transfer.toDevice)
    const peerLabel = labelledTransfer?.fromDevice || labelledTransfer?.toDevice
    const title = `${direction} ${totalCount} files${peerLabel ? ` from ${peerLabel}` : ''}`
    const summaryParts = [
      `${completedCount} of ${totalCount} complete`,
      `${formatFileSize(transferredBytes)} of ${formatFileSize(totalSize)}`
    ]
    if (failedCount > 0) summaryParts.push(`${failedCount} failed`)

    return {
      type: 'batch' as const,
      key: `batch-${batchId}`,
      title,
      summary: summaryParts.join(' · '),
      progress,
      transfers
    }
  })

  const singleItems = activeTransfers.value
    .filter(transfer => !transfer.batchId || !activeBatchIds.value.has(transfer.batchId))
    .map(transfer => ({
      type: 'single' as const,
      key: transfer.id,
      transfer
    }))

  return [...batchItems, ...singleItems]
})

const STATUS_LABELS: Record<string, string> = {
  queued: 'Queued',
  pending: 'Pending',
  sending: 'Sending',
  receiving: 'Receiving',
  completed: 'Done',
  failed: 'Failed'
}

const statusLabel = (status: string) => STATUS_LABELS[status] ?? status

const statusIcon = (status: string) => {
  const map: Record<string, string> = {
    queued: 'i-lucide-list-end',
    sending: 'i-lucide-send',
    receiving: 'i-lucide-download',
    completed: 'i-lucide-check',
    failed: 'i-lucide-x',
    pending: 'i-lucide-clock'
  }
  return map[status] ?? 'i-lucide-clock'
}

const statusIconClass = (status: string) => {
  if (status === 'failed') return 'text-app-error'
  if (status === 'completed') return 'text-app-success'
  if (status === 'queued' || status === 'pending') return 'text-app-muted dark:text-app-muted-dark'
  return 'text-app-primary'
}

const formatFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  const value = bytes / Math.pow(k, i)
  return `${Math.round(value * 100) / 100} ${sizes[i]}`
}
</script>
