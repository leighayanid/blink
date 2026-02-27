<template>
  <div class="flex flex-col h-full">
    <!-- Tab Bar -->
    <div class="flex border-b border-neutral-200 dark:border-neutral-700 mb-3 gap-1">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="relative pb-2.5 px-1 text-xs font-mono font-bold tracking-widest transition-colors"
        :class="activeTab === tab.value
          ? 'text-neutral-900 dark:text-white'
          : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <UBadge
          v-if="tab.value === 'active' && activeCount > 0"
          color="neutral"
          variant="solid"
          size="xs"
          class="ml-1.5 font-mono text-[10px]"
        >
          {{ activeCount }}
        </UBadge>
        <span
          v-if="activeTab === tab.value"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 dark:bg-white rounded-t-full"
        />
      </button>
    </div>

    <!-- Active Tab -->
    <div v-if="activeTab === 'active'" class="flex-1 overflow-y-auto">
      <div
        v-if="activeTransfers.length === 0"
        class="flex items-center justify-center py-10 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg"
      >
        <p class="text-xs font-mono text-neutral-400 tracking-widest">NO ACTIVE TRANSFERS</p>
      </div>
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="transfer in activeTransfers"
          :key="transfer.id"
          class="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
        >
          <TransferItem :transfer="transfer" />
        </div>
      </div>
    </div>

    <!-- History Tab -->
    <div v-else class="flex-1 overflow-y-auto">
      <div
        v-if="historyTransfers.length === 0"
        class="flex items-center justify-center py-10 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg"
      >
        <p class="text-xs font-mono text-neutral-400 tracking-widest">NO HISTORY</p>
      </div>
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="transfer in historyTransfers"
          :key="transfer.id"
          class="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-900"
        >
          <TransferItem :transfer="transfer" />
        </div>
        <div class="flex justify-center pt-2">
          <UButton
            color="neutral"
            variant="ghost"
            size="xs"
            class="font-mono text-xs tracking-wider"
            @click="store.clearCompleted()"
          >
            CLEAR HISTORY
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
  { label: 'ACTIVE', value: 'active' as const },
  { label: 'HISTORY', value: 'history' as const }
]

const historyTransfers = computed(() => [
  ...completedTransfers.value,
  ...failedTransfers.value
])
</script>
