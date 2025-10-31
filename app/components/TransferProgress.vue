<template>
  <div v-if="transfers.length > 0" class="transfer-progress">
    <h3>Transfers ({{ activeCount }} active)</h3>

    <div class="transfers-list">
      <div
        v-for="transfer in transfers"
        :key="transfer.id"
        class="transfer-item"
        :class="transfer.status"
      >
        <div class="transfer-header">
          <span class="file-name">{{ transfer.fileName }}</span>
          <span class="status-badge" :class="transfer.status">
            {{ getStatusText(transfer.status) }}
          </span>
        </div>

        <div class="transfer-details">
          <span class="file-size">{{ formatFileSize(transfer.fileSize) }}</span>
          <span v-if="transfer.speed" class="speed">
            {{ formatSpeed(transfer.speed) }}
          </span>
        </div>

        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: transfer.progress + '%' }"
            :class="transfer.status"
          />
        </div>

        <div class="progress-text">
          {{ Math.round(transfer.progress) }}%
        </div>
      </div>
    </div>

    <button
      v-if="completedCount > 0"
      class="clear-btn"
      @click="$emit('clearCompleted')"
    >
      Clear Completed ({{ completedCount }})
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Transfer } from '../types'

const props = defineProps<{
  transfers: Transfer[]
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
    pending: 'Pending',
    sending: 'Sending',
    receiving: 'Receiving',
    completed: 'Completed',
    failed: 'Failed'
  }
  return statusMap[status] || status
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const formatSpeed = (bytesPerSecond: number): string => {
  return formatFileSize(bytesPerSecond) + '/s'
}
</script>

<style scoped>
.transfer-progress {
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 1.5rem;
}

.transfer-progress h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.transfers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transfer-item {
  background: white;
  border-radius: 6px;
  padding: 1rem;
  border-left: 4px solid #ccc;
}

.transfer-item.sending {
  border-left-color: #2196F3;
}

.transfer-item.receiving {
  border-left-color: #FF9800;
}

.transfer-item.completed {
  border-left-color: #4CAF50;
}

.transfer-item.failed {
  border-left-color: #f44336;
}

.transfer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.file-name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.sending {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-badge.receiving {
  background-color: #fff3e0;
  color: #f57c00;
}

.status-badge.completed {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status-badge.failed {
  background-color: #ffebee;
  color: #d32f2f;
}

.transfer-details {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
}

.progress-fill.sending {
  background-color: #2196F3;
}

.progress-fill.receiving {
  background-color: #FF9800;
}

.progress-fill.failed {
  background-color: #f44336;
}

.progress-text {
  text-align: right;
  font-size: 0.9rem;
  color: #666;
}

.clear-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.clear-btn:hover {
  background-color: #e0e0e0;
}
</style>
