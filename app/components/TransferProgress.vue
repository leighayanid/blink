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
      <!-- Empty State -->
      <div v-if="activeTransfers.length === 0" class="empty-transfers">
        <div class="empty-text">NO ACTIVE TRANSFERS</div>
      </div>

      <!-- Active Transfers List -->
      <div v-else class="transfers-list">
        <div v-for="transfer in activeTransfers" :key="transfer.id" class="transfer-card" :class="transfer.status">
          <TransferItem :transfer="transfer" />
        </div>
      </div>
    </div>

    <!-- HISTORY TAB -->
    <div v-else class="tab-content">
      <!-- Empty State -->
      <div v-if="historyTransfers.length === 0" class="empty-transfers">
        <div class="empty-text">NO HISTORY</div>
      </div>

      <!-- History List -->
      <div v-else class="transfers-list">
        <div v-for="transfer in historyTransfers" :key="transfer.id" class="transfer-card" :class="transfer.status">
          <TransferItem :transfer="transfer" />
        </div>
        
        <!-- Clear Button -->
        <button class="btn-base btn-ghost clear-btn" @click="store.clearCompleted(); store.clearAll()">
          CLEAR HISTORY
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, h } from 'vue'
import { storeToRefs } from 'pinia'
import { useTransfersStore } from '../stores/transfers'
import type { Transfer } from '../types'

const props = defineProps<{
  embedded?: boolean
}>()

const store = useTransfersStore()
const { activeTransfers, completedTransfers, failedTransfers, activeCount } = storeToRefs(store)

const activeTab = ref<'active' | 'history'>('active')

const historyTransfers = computed(() => [
  ...completedTransfers.value,
  ...failedTransfers.value
])

// Inline component for rendering transfer item details to avoid duplication
const TransferItem = (props: { transfer: Transfer }) => {
  const { transfer } = props
  
  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      pending: 'PENDING',
      sending: 'SENDING',
      receiving: 'RECEIVING',
      completed: 'DONE',
      failed: 'FAILED'
    }
    return statusMap[status] || status.toUpperCase()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatSpeed = (bytesPerSecond: number): string => {
    return formatFileSize(bytesPerSecond) + '/s'
  }

  // Icons
  const renderIcon = () => {
    if (transfer.status === 'sending') {
      return h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
        h('line', { x1: 22, y1: 2, x2: 11, y2: 13 }),
        h('polygon', { points: '22 2 15 22 11 13 2 9 22 2' })
      ])
    } else if (transfer.status === 'receiving') {
      return h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
        h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
        h('polyline', { points: '7 10 12 15 17 10' }),
        h('line', { x1: 12, y1: 15, x2: 12, y2: 3 })
      ])
    } else if (transfer.status === 'completed') {
      return h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
        h('polyline', { points: '20 6 9 17 4 12' })
      ])
    } else if (transfer.status === 'failed') {
      return h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
        h('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
        h('line', { x1: 6, y1: 6, x2: 18, y2: 18 })
      ])
    }
    return h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2 }, [
      h('circle', { cx: 12, cy: 12, r: 10 }),
      h('polyline', { points: '12 6 12 12 16 14' })
    ])
  }

  return h('div', { class: 'transfer-content-wrapper' }, [
    h('div', { class: 'transfer-row' }, [
      h('div', { class: 'transfer-icon' }, [renderIcon()]),
      h('div', { class: 'transfer-info' }, [
        h('span', { class: 'file-name' }, transfer.fileName),
        h('div', { class: 'transfer-meta' }, [
          h('span', { class: 'file-size' }, formatFileSize(transfer.fileSize)),
          transfer.speed ? h('span', { class: 'speed' }, ` · ${formatSpeed(transfer.speed)}`) : null
        ])
      ]),
      h('div', { class: 'status-text' }, getStatusText(transfer.status))
    ]),
    h('div', { class: 'progress-bar-container' }, [
      h('div', { class: 'progress-bar' }, [
        h('div', { 
          class: ['progress-fill', transfer.status], 
          style: { width: transfer.progress + '%' } 
        })
      ])
    ])
  ])
}
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

:deep(.transfer-content-wrapper) {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
}

:deep(.transfer-row) {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
}

:deep(.transfer-icon) {
  color: var(--text-primary);
  flex-shrink: 0;
}

:deep(.transfer-info) {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

:deep(.file-name) {
  font-weight: 600;
  font-size: var(--text-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.transfer-meta) {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

:deep(.status-text) {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: bold;
  flex-shrink: 0;
}

/* Progress Bar */
:deep(.progress-bar-container) {
  height: 4px;
  background: var(--bg-secondary);
  border-radius: 2px;
  overflow: hidden;
  width: 100%;
}

:deep(.progress-bar) {
  width: 100%;
}

:deep(.progress-fill) {
  height: 100%;
  background: var(--text-primary);
  transition: width 0.2s ease;
  min-height: 4px; /* Ensure visibility */
}

.transfer-card.failed :deep(.progress-fill) {
  background: var(--error);
}

.clear-btn {
  margin-top: var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  align-self: center;
}
</style>
