<template>
  <div class="transfer-progress" :class="{ embedded: embedded }">
    <!-- Header -->
    <div v-if="!embedded && transfers.length > 0" class="section-header">
      <span class="section-title">TRANSFERS</span>
      <span v-if="activeCount > 0" class="active-badge">
        {{ activeCount }} ACTIVE
      </span>
    </div>

    <!-- Embedded Header/Status -->
    <div v-if="embedded && activeCount > 0" class="active-badge-inline">
      {{ activeCount }} ACTIVE TRANSFER{{ activeCount > 1 ? 'S' : '' }}
    </div>

    <!-- Empty State -->
    <div v-if="embedded && transfers.length === 0" class="empty-transfers">
      <div class="empty-text">NO ACTIVE TRANSFERS</div>
    </div>

    <!-- Transfers List -->
    <div v-if="transfers.length > 0" class="transfers-list">
      <div v-for="transfer in transfers" :key="transfer.id" class="transfer-card" :class="transfer.status">
        <div class="transfer-row">
          <div class="transfer-icon">
            <!-- Icons -->
            <svg v-if="transfer.status === 'sending'" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <svg v-else-if="transfer.status === 'receiving'" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <svg v-else-if="transfer.status === 'completed'" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <svg v-else-if="transfer.status === 'failed'" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <div class="transfer-info">
            <span class="file-name">{{ transfer.fileName }}</span>
            <div class="transfer-meta">
              <span class="file-size">{{ formatFileSize(transfer.fileSize) }}</span>
              <span v-if="transfer.speed" class="speed"> · {{ formatSpeed(transfer.speed) }}</span>
            </div>
          </div>

          <div class="status-text">{{ getStatusText(transfer.status) }}</div>
        </div>

        <!-- Progress Bar -->
        <div class="progress-bar-container">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: transfer.progress + '%' }" :class="transfer.status" />
          </div>
        </div>
      </div>
    </div>

    <!-- Clear Button -->
    <button v-if="completedCount > 0" class="btn-base btn-ghost clear-btn" @click="$emit('clearCompleted')">
      CLEAR COMPLETED ({{ completedCount }})
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Transfer } from '../types'

const props = defineProps<{
  transfers: Transfer[]
  embedded?: boolean
}>()

defineEmits<{
  clearCompleted: []
}>()

const activeCount = computed(() =>
  props.transfers.filter(t =>
    t.status === 'sending' || t.status === 'receiving'
  ).length
)

const completedCount = computed(() =>
  props.transfers.filter(t => t.status === 'completed').length
)

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
</script>

<style scoped>
.transfer-progress {
  display: flex;
  flex-direction: column;
}

.embedded {
  padding: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.section-title {
  font-family: var(--font-mono);
  font-weight: bold;
  font-size: var(--text-sm);
}

.active-badge,
.active-badge-inline {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  background: var(--text-primary);
  color: var(--bg-primary);
  padding: 2px 6px;
  border-radius: 4px;
}

.active-badge-inline {
  align-self: flex-start;
  margin-bottom: var(--space-4);
}

.empty-transfers {
  padding: var(--space-8);
  text-align: center;
  border: 1px dashed var(--border-primary);
  border-radius: var(--radius-md);
  opacity: 0.6;
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
}

.transfer-card {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
}

.transfer-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.transfer-icon {
  color: var(--text-primary);
}

.transfer-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.file-name {
  font-weight: 600;
  font-size: var(--text-sm);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.transfer-meta {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.status-text {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: bold;
}

/* Progress Bar */
.progress-bar-container {
  height: 4px;
  background: var(--bg-secondary);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--text-primary);
  transition: width 0.2s ease;
}

.transfer-card.failed .progress-fill {
  background: var(--error);
}

.clear-btn {
  margin-top: var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
}
</style>
