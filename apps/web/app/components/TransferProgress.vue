<template>
  <div class="transfer-progress" :class="{ embedded: embedded }">
    <!-- Header with Tabs -->
    <div class="section-header">
      <div class="tabs">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'active' }"
          @click="activeTab = 'active'"
        >
          ACTIVE
          <span v-if="activeCount > 0" class="badge">{{ activeCount }}</span>
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          HISTORY
        </button>
      </div>
    </div>

    <!-- ACTIVE TAB -->
    <div v-if="activeTab === 'active'" class="tab-content">
      <div v-if="activeTransfers.length === 0" class="empty-transfers">
        <div class="empty-text">NO ACTIVE TRANSFERS</div>
      </div>
      <div v-else class="transfers-list">
        <div v-for="transfer in activeTransfers" :key="transfer.id" class="transfer-card" :class="transfer.status">
          <TransferItem :transfer="transfer" />
        </div>
      </div>
    </div>

    <!-- HISTORY TAB -->
    <div v-else class="tab-content">
      <div v-if="historyTransfers.length === 0" class="empty-transfers">
        <div class="empty-text">NO HISTORY</div>
      </div>
      <div v-else class="transfers-list">
        <div v-for="transfer in historyTransfers" :key="transfer.id" class="transfer-card" :class="transfer.status">
          <TransferItem :transfer="transfer" />
        </div>
        <button class="btn-base btn-ghost clear-btn" @click="store.clearCompleted()">
          CLEAR HISTORY
        </button>
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

const historyTransfers = computed(() => [
  ...completedTransfers.value,
  ...failedTransfers.value
])
</script>

<style scoped>
.transfer-progress {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.embedded {
  padding: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-primary);
}

.tabs {
  display: flex;
  gap: var(--space-4);
}

.tab-btn {
  background: none;
  border: none;
  padding: var(--space-2) 0;
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-tertiary);
  cursor: pointer;
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.tab-btn:hover {
  color: var(--text-secondary);
}

.tab-btn.active {
  color: var(--text-primary);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--text-primary);
}

.badge {
  font-size: 10px;
  background: var(--text-primary);
  color: var(--bg-primary);
  padding: 1px 5px;
  border-radius: 999px;
  line-height: 1;
}

.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow-y: auto;
}

.empty-transfers {
  padding: var(--space-8);
  text-align: center;
  border: 1px dashed var(--border-primary);
  border-radius: var(--radius-md);
  opacity: 0.6;
  margin-top: var(--space-4);
}

.empty-text {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: bold;
}

.transfers-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-2);
}

.transfer-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
}

.clear-btn {
  margin-top: var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  align-self: center;
}
</style>
