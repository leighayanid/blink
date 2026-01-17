<template>
  <div v-if="transfers.length > 0" class="transfer-progress section animate-section" style="--animation-order: 4">
    <div class="section-header">
      <span class="section-title">Transfers</span>
      <span v-if="activeCount > 0" class="active-badge">
        <span class="active-dot" />
        {{ activeCount }} active
      </span>
    </div>

    <div class="transfers-list">
      <div
        v-for="(transfer, index) in transfers"
        :key="transfer.id"
        class="transfer-card"
        :class="[transfer.status, { 'fade-out': transfer.status === 'completed' && shouldFade(transfer) }]"
        :style="{ '--transfer-index': index }"
      >
        <div class="transfer-header">
          <div class="transfer-icon" :class="transfer.status">
            <!-- Sending icon -->
            <svg v-if="transfer.status === 'sending'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <!-- Receiving icon -->
            <svg v-else-if="transfer.status === 'receiving'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <!-- Completed checkmark -->
            <svg v-else-if="transfer.status === 'completed'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <!-- Failed X -->
            <svg v-else-if="transfer.status === 'failed'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            <!-- Pending -->
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <div class="transfer-info">
            <span class="file-name">{{ transfer.fileName }}</span>
            <div class="transfer-meta">
              <span class="file-size">{{ formatFileSize(transfer.fileSize) }}</span>
              <span v-if="transfer.speed" class="speed">{{ formatSpeed(transfer.speed) }}</span>
            </div>
          </div>

          <div class="status-indicator" :class="transfer.status">
            <span class="status-dot" :class="{ pulse: transfer.status === 'sending' || transfer.status === 'receiving' }" />
            <span class="status-text">{{ getStatusText(transfer.status) }}</span>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="progress-container">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :class="transfer.status"
              :style="{ width: transfer.progress + '%' }"
            />
          </div>
          <span class="progress-percent">{{ Math.round(transfer.progress) }}%</span>
        </div>

        <!-- Error message if failed -->
        <div v-if="transfer.status === 'failed'" class="error-message">
          Transfer failed. Please try again.
        </div>
      </div>
    </div>

    <!-- Clear completed button -->
    <button
      v-if="completedCount > 0"
      class="clear-btn"
      @click="$emit('clearCompleted')"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </svg>
      <span>Clear Completed ({{ completedCount }})</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import type { Transfer } from '../types'

const props = defineProps<{
  transfers: Transfer[]
}>()

defineEmits<{
  clearCompleted: []
}>()

// Track which completed transfers should fade
const fadeTimers = ref<Map<string, boolean>>(new Map())

const activeCount = computed(() =>
  props.transfers.filter(t =>
    t.status === 'sending' || t.status === 'receiving'
  ).length
)

const completedCount = computed(() =>
  props.transfers.filter(t => t.status === 'completed').length
)

const shouldFade = (transfer: Transfer): boolean => {
  return fadeTimers.value.get(transfer.id) || false
}

// Watch for newly completed transfers and set fade timer
watch(() => props.transfers, (newTransfers) => {
  newTransfers.forEach(transfer => {
    if (transfer.status === 'completed' && !fadeTimers.value.has(transfer.id)) {
      // Set fade after 3 seconds
      setTimeout(() => {
        fadeTimers.value.set(transfer.id, true)
      }, 3000)
    }
  })
}, { deep: true })

// Cleanup
onUnmounted(() => {
  fadeTimers.value.clear()
})

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    sending: 'Sending',
    receiving: 'Receiving',
    completed: 'Complete',
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
/* ============================================
   TRANSFER PROGRESS CONTAINER
   ============================================ */
.transfer-progress {
  background: var(--bg-secondary);
  border-radius: 0.75rem;
  padding: var(--space-6);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.06);
}

html.dark .transfer-progress {
  border-color: rgba(255, 255, 255, 0.06);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.2),
    0 1px 3px rgba(0, 0, 0, 0.3);
}

/* Section header */
.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}

.section-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.active-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--color-primary);
  background: rgba(255, 165, 0, 0.1);
  border-radius: 9999px;
}

.active-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: pulseSubtle 1.5s var(--ease-in-out) infinite;
}

@keyframes pulseSubtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ============================================
   TRANSFERS LIST
   ============================================ */
.transfers-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* ============================================
   TRANSFER CARD
   ============================================ */
.transfer-card {
  background: var(--bg-tertiary);
  border-radius: 0.625rem;
  padding: var(--space-4);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition:
    opacity var(--transition-slow),
    border-color var(--transition-base);

  /* Slide in animation */
  opacity: 0;
  animation: transferSlideIn var(--duration-slow) var(--ease-out) forwards;
  animation-delay: calc(var(--transfer-index, 0) * 50ms);
}

@keyframes transferSlideIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

html.dark .transfer-card {
  border-color: rgba(255, 255, 255, 0.04);
}

/* Fade out completed transfers after 3s */
.transfer-card.fade-out {
  opacity: 0.6;
}

/* Status-based border accents */
.transfer-card.sending {
  border-left: 3px solid var(--color-primary);
}

.transfer-card.receiving {
  border-left: 3px solid #3b82f6;
}

.transfer-card.completed {
  border-left: 3px solid var(--color-success);
}

.transfer-card.failed {
  border-left: 3px solid var(--color-error);
}

/* ============================================
   TRANSFER HEADER
   ============================================ */
.transfer-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

/* Transfer icon */
.transfer-icon {
  width: 36px;
  height: 36px;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.transfer-icon.sending {
  background: rgba(255, 165, 0, 0.1);
  color: var(--color-primary);
}

.transfer-icon.receiving {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.transfer-icon.completed {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.transfer-icon.failed {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.transfer-icon.pending {
  background: rgba(100, 116, 139, 0.1);
  color: var(--text-tertiary);
}

/* Transfer info */
.transfer-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  margin-bottom: var(--space-1);
}

.transfer-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.file-size,
.speed {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.speed {
  color: var(--text-secondary);
  font-weight: var(--font-medium);
}

/* Status indicator */
.status-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: 9999px;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  flex-shrink: 0;
}

.status-indicator.sending {
  background: rgba(255, 165, 0, 0.1);
  color: var(--color-primary);
}

.status-indicator.receiving {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-indicator.completed {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.status-indicator.failed {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.status-indicator.pending {
  background: rgba(100, 116, 139, 0.1);
  color: var(--text-tertiary);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.status-dot.pulse {
  animation: pulseSubtle 1.5s var(--ease-in-out) infinite;
}

/* ============================================
   PROGRESS BAR
   ============================================ */
.progress-container {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

html.dark .progress-bar {
  background: rgba(255, 255, 255, 0.08);
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s var(--ease-default);
}

/* Gradient fill for sending (orange to amber) */
.progress-fill.sending {
  background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%);
}

/* Blue for receiving */
.progress-fill.receiving {
  background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
}

/* Green for completed */
.progress-fill.completed {
  background: var(--color-success);
}

/* Red for failed */
.progress-fill.failed {
  background: var(--color-error);
}

.progress-percent {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  min-width: 40px;
  text-align: right;
}

/* ============================================
   ERROR MESSAGE
   ============================================ */
.error-message {
  margin-top: var(--space-3);
  padding: var(--space-2) var(--space-3);
  background: rgba(239, 68, 68, 0.08);
  border-radius: 0.375rem;
  font-size: var(--text-xs);
  color: var(--color-error);
}

/* ============================================
   CLEAR BUTTON
   ============================================ */
.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  width: 100%;
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: rgba(100, 116, 139, 0.06);
  border: 1px solid rgba(100, 116, 139, 0.1);
  border-radius: 0.5rem;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-secondary);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    transform var(--transition-fast);
}

.clear-btn:hover {
  background: rgba(100, 116, 139, 0.12);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.clear-btn:active {
  transform: translateY(0);
}

/* ============================================
   MOBILE RESPONSIVE
   ============================================ */
@media (max-width: 767px) {
  .transfer-progress {
    padding: var(--space-4);
  }

  .transfer-header {
    flex-wrap: wrap;
  }

  .status-indicator {
    margin-top: var(--space-2);
  }

  .clear-btn {
    min-height: 44px;
  }
}
</style>
