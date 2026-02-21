<template>
  <div class="transfer-content-wrapper">
    <div class="transfer-row">
      <div class="transfer-icon">
        <!-- Sending -->
        <svg v-if="transfer.status === 'sending'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
        <!-- Receiving -->
        <svg v-else-if="transfer.status === 'receiving'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <!-- Completed -->
        <svg v-else-if="transfer.status === 'completed'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <!-- Failed -->
        <svg v-else-if="transfer.status === 'failed'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
        <!-- Pending / fallback -->
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>

      <div class="transfer-info">
        <span class="file-name">{{ transfer.fileName }}</span>
        <div class="transfer-meta">
          <span class="file-size">{{ formatFileSize(transfer.fileSize) }}</span>
          <span v-if="transfer.speed" class="speed"> · {{ formatSpeed(transfer.speed) }}</span>
        </div>
      </div>

      <div class="status-text">{{ statusLabel }}</div>
    </div>

    <div class="progress-bar-container">
      <div class="progress-bar">
        <div class="progress-fill" :class="transfer.status" :style="{ width: transfer.progress + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Transfer } from '@blink/types'

const props = defineProps<{ transfer: Transfer }>()

const STATUS_LABELS: Record<string, string> = {
  pending: 'PENDING',
  sending: 'SENDING',
  receiving: 'RECEIVING',
  completed: 'DONE',
  failed: 'FAILED'
}

const statusLabel = computed(() =>
  STATUS_LABELS[props.transfer.status] ?? props.transfer.status.toUpperCase()
)

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

const formatSpeed = (bytesPerSecond: number): string => {
  return formatFileSize(bytesPerSecond) + '/s'
}
</script>

<style scoped>
.transfer-content-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  width: 100%;
}

.transfer-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
}

.transfer-icon {
  color: var(--text-primary);
  flex-shrink: 0;
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
  flex-shrink: 0;
}

.progress-bar-container {
  height: 4px;
  background: var(--bg-secondary);
  border-radius: 2px;
  overflow: hidden;
  width: 100%;
}

.progress-bar {
  width: 100%;
}

.progress-fill {
  height: 100%;
  background: var(--text-primary);
  transition: width 0.2s ease;
  min-height: 4px;
}

.progress-fill.failed {
  background: var(--color-error);
}
</style>
