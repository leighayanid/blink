<template>
  <div class="flex min-h-[14rem] flex-col rounded-none border border-swiss-black dark:border-white bg-white dark:bg-swiss-paper-dark p-4 sm:p-6 xl:h-full xl:min-h-0">
    <div class="mb-4 sm:mb-6 flex border border-swiss-black dark:border-white bg-swiss-bg dark:bg-swiss-bg-dark p-1">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="relative flex-1 px-2 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
        :class="activeTab === tab.value
          ? 'bg-swiss-black dark:bg-white text-white dark:text-swiss-black'
          : 'text-swiss-black dark:text-white hover:bg-white dark:hover:bg-swiss-black'"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <span
          v-if="tab.value === 'active' && activeCount > 0"
          class="ml-2 text-[10px] font-black"
          :class="activeTab === tab.value ? 'text-swiss-orange' : 'text-swiss-orange'"
        >
          [{{ activeCount }}]
        </span>
      </button>
    </div>

    <div v-if="activeTab === 'active'" class="flex-1 overflow-y-auto">
      <div
        v-if="activeTransfers.length === 0"
        class="flex min-h-40 items-center justify-center border border-dashed border-swiss-border dark:border-white/20 bg-swiss-bg dark:bg-swiss-bg-dark xl:h-full xl:min-h-44"
      >
        <p class="text-[10px] font-black uppercase tracking-widest text-swiss-grey dark:text-swiss-grey-light">No transfers in progress</p>
      </div>
      <div v-else class="flex flex-col gap-4">
        <div
          v-for="transfer in activeTransfers"
          :key="transfer.id"
          class="border border-swiss-border dark:border-white/10 bg-white dark:bg-swiss-paper-dark"
        >
          <TransferItem :transfer="transfer" />
        </div>
      </div>
    </div>

    <div v-else class="flex-1 overflow-y-auto">
      <div
        v-if="historyTransfers.length === 0"
        class="flex min-h-40 items-center justify-center border border-dashed border-swiss-border dark:border-white/20 bg-swiss-bg dark:bg-swiss-bg-dark xl:h-full xl:min-h-44"
      >
        <p class="text-[10px] font-black uppercase tracking-widest text-swiss-grey dark:text-swiss-grey-light">No past transfers yet</p>
      </div>
      <div v-else class="flex flex-col gap-4">
        <div
          v-for="transfer in historyTransfers"
          :key="transfer.id"
          class="border border-swiss-border dark:border-white/10 bg-white dark:bg-swiss-paper-dark"
        >
          <TransferItem :transfer="transfer" />
        </div>
        <div class="flex justify-center pt-4">
          <UButton
            color="neutral"
            variant="outline"
            class="w-full rounded-none border border-swiss-black dark:border-white px-6 py-4 text-[10px] font-black uppercase tracking-widest hover:bg-swiss-black hover:text-white dark:hover:bg-white dark:hover:text-swiss-black transition-all text-swiss-black dark:text-white sm:w-auto"
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
  { label: 'In Progress', value: 'active' as const },
  { label: 'Past', value: 'history' as const }
]

const historyTransfers = computed(() => [
  ...completedTransfers.value,
  ...failedTransfers.value
])
</script>
