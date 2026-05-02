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
        <TransferItem
          v-for="transfer in activeTransfers"
          :key="transfer.id"
          :transfer="transfer"
        />
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

const historyTransfers = computed(() => [
  ...completedTransfers.value,
  ...failedTransfers.value
])
</script>
