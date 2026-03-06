<template>
  <div class="flex min-h-[16rem] flex-col rounded-[1.75rem] border border-black/5 bg-white/50 p-4 dark:border-white/10 dark:bg-white/4 xl:h-full xl:min-h-0">
    <div class="mb-4 flex gap-2 rounded-full border border-black/5 bg-white/70 p-1 dark:border-white/10 dark:bg-white/5">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="relative flex-1 rounded-full px-4 py-2 text-[11px] font-medium tracking-[0.08em] transition-colors"
        :class="activeTab === tab.value
          ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/12 dark:text-primary-300'
          : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <UBadge
          v-if="tab.value === 'active' && activeCount > 0"
          color="neutral"
          variant="soft"
          size="xs"
          class="ml-1.5 rounded-full text-[10px] font-medium"
        >
          {{ activeCount }}
        </UBadge>
      </button>
    </div>

    <div v-if="activeTab === 'active'" class="flex-1 overflow-y-auto">
      <div
        v-if="activeTransfers.length === 0"
        class="flex min-h-40 items-center justify-center rounded-[1.5rem] border border-dashed border-primary-200/80 bg-primary-50/35 dark:border-primary-500/20 dark:bg-white/3 xl:h-full xl:min-h-44"
      >
        <p class="text-sm font-semibold text-neutral-500 dark:text-neutral-400">No active transfers</p>
      </div>
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="transfer in activeTransfers"
          :key="transfer.id"
          class="rounded-[1.5rem] border border-black/5 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
        >
          <TransferItem :transfer="transfer" />
        </div>
      </div>
    </div>

    <div v-else class="flex-1 overflow-y-auto">
      <div
        v-if="historyTransfers.length === 0"
        class="flex min-h-40 items-center justify-center rounded-[1.5rem] border border-dashed border-black/10 bg-neutral-50/60 dark:border-white/10 dark:bg-white/3 xl:h-full xl:min-h-44"
      >
        <p class="text-sm font-semibold text-neutral-500 dark:text-neutral-400">No history</p>
      </div>
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="transfer in historyTransfers"
          :key="transfer.id"
          class="rounded-[1.5rem] border border-black/5 bg-white/80 p-4 dark:border-white/10 dark:bg-white/5"
        >
          <TransferItem :transfer="transfer" />
        </div>
        <div class="flex justify-center pt-2">
          <UButton
            color="neutral"
            variant="outline"
            size="xs"
            class="rounded-full px-4 text-[11px] font-medium"
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
