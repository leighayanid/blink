<template>
  <div class="device-list">
    <!-- Empty State -->
    <div v-if="devices.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </div>
      <h3 class="empty-title">No devices found</h3>
      <p class="empty-description">Make sure other devices are on the same network and running Hatid</p>
    </div>

    <!-- Devices Grid -->
    <div v-else class="devices-grid">
      <div
        v-for="(device, index) in devices"
        :key="device.id"
        class="device-card"
        :class="{
          selected: selectedDevice?.id === device.id,
          connected: connectedPeers?.has(device.peerId!),
          connecting: getDeviceState(device) === 'connecting',
          'connection-error': getDeviceState(device) === 'error',
          'error-shake': getDeviceState(device) === 'error' && isNewError(device)
        }"
        :style="{ '--card-index': index }"
        @click="$emit('select', device)"
      >
        <div class="card-header">
          <div class="device-icon-wrapper">
            <span class="device-icon">{{ getPlatformIcon(device.platform) }}</span>
            <!-- State indicator badges -->
            <span v-if="getDeviceState(device) === 'connecting'" class="state-indicator connecting">
              <span class="spinner-small" />
            </span>
            <span v-else-if="connectedPeers?.has(device.peerId!)" class="state-indicator connected">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span v-else-if="getDeviceState(device) === 'error'" class="state-indicator error">!</span>
          </div>
          <div class="device-info">
            <h3 class="device-name">{{ device.name }}</h3>
            <p class="device-platform">{{ device.platform }}</p>
          </div>
        </div>

        <!-- Connection status indicator -->
        <div v-if="getDeviceState(device)" class="connection-status">
          <span v-if="getDeviceState(device) === 'connecting'" class="status-text connecting">
            <span class="status-dot pulse" />
            Connecting...
          </span>
          <span v-else-if="connectedPeers?.has(device.peerId!)" class="status-text connected">
            <span class="status-dot" />
            Connected
          </span>
          <span v-else-if="getDeviceState(device) === 'error'" class="status-text error">
            <span class="status-dot" />
            Connection failed
          </span>
        </div>

        <!-- Connect Button -->
        <button
          v-if="selectedDevice?.id === device.id"
          class="connect-btn"
          :class="{
            connected: connectedPeers?.has(device.peerId!),
            connecting: getDeviceState(device) === 'connecting'
          }"
          :disabled="getDeviceState(device) === 'connecting'"
          @click.stop="$emit('connect', device)"
        >
          <template v-if="getDeviceState(device) === 'connecting'">
            <span class="btn-spinner" />
            <span>Connecting...</span>
          </template>
          <template v-else-if="connectedPeers?.has(device.peerId!)">
            <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Connected</span>
          </template>
          <template v-else>
            <span>Connect</span>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Device } from '../types'
import type { ConnectionState } from '../composables/useWebRTC'

const props = defineProps<{
  devices: Device[]
  selectedDevice?: Device | null
  connectedPeers?: Set<string>
  connectionStates?: Map<string, ConnectionState>
}>()

defineEmits<{
  select: [device: Device]
  connect: [device: Device]
}>()

// Track new errors for shake animation
const newErrors = ref<Set<string>>(new Set())

const getPlatformIcon = (platform: string): string => {
  const icons: Record<string, string> = {
    'Windows': '🪟',
    'macOS': '🍎',
    'Linux': '🐧',
    'Android': '🤖',
    'iOS': '📱',
    'Unknown': '💻'
  }
  return icons[platform] || '💻'
}

const getDeviceState = (device: Device): ConnectionState | undefined => {
  if (!device.peerId || !props.connectionStates) return undefined
  return props.connectionStates.get(device.peerId)
}

const isNewError = (device: Device): boolean => {
  return device.peerId ? newErrors.value.has(device.peerId) : false
}

// Watch for new error states to trigger shake animation
watch(() => props.connectionStates, (newStates) => {
  if (!newStates) return
  newStates.forEach((state, peerId) => {
    if (state === 'error' && !newErrors.value.has(peerId)) {
      newErrors.value.add(peerId)
      // Remove from newErrors after animation completes
      setTimeout(() => {
        newErrors.value.delete(peerId)
      }, 500)
    }
  })
}, { deep: true })
</script>

<style scoped>
/* ============================================
   DEVICE LIST CONTAINER
   ============================================ */
.device-list {
  padding: 0;
}

/* ============================================
   EMPTY STATE
   ============================================ */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-6);
  text-align: center;
}

.empty-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-4);
  color: var(--text-tertiary);
  opacity: 0.5;
}

.empty-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--space-2) 0;
}

.empty-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
  max-width: 280px;
  line-height: var(--leading-relaxed);
}

/* ============================================
   DEVICES GRID
   ============================================ */
.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
}

/* ============================================
   DEVICE CARD
   ============================================ */
.device-card {
  background: var(--bg-secondary);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 0.75rem;
  padding: var(--space-5);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  transition:
    transform var(--transition-base),
    box-shadow var(--transition-base),
    border-color var(--transition-base),
    background-color var(--transition-base);

  /* Staggered entry animation */
  opacity: 0;
  animation: cardSlideIn var(--duration-slow) var(--ease-out) forwards;
  animation-delay: calc(var(--card-index, 0) * 50ms);
}

@keyframes cardSlideIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

html.dark .device-card {
  border-color: rgba(255, 255, 255, 0.06);
}

/* Hover state - lift effect */
.device-card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 8px 16px -4px rgba(0, 0, 0, 0.1),
    0 4px 8px -2px rgba(0, 0, 0, 0.05);
  border-color: rgba(0, 0, 0, 0.1);
}

html.dark .device-card:hover {
  box-shadow:
    0 8px 16px -4px rgba(0, 0, 0, 0.4),
    0 4px 8px -2px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Selected state - orange accent */
.device-card.selected {
  border-color: var(--color-primary);
  background: rgba(255, 165, 0, 0.04);
  box-shadow:
    0 0 0 1px rgba(255, 165, 0, 0.2),
    0 4px 12px rgba(255, 165, 0, 0.1);
}

html.dark .device-card.selected {
  background: rgba(255, 149, 0, 0.08);
  box-shadow:
    0 0 0 1px rgba(255, 149, 0, 0.3),
    0 4px 12px rgba(255, 149, 0, 0.15);
}

/* Connected state - green border with subtle glow */
.device-card.connected {
  border-color: var(--color-success);
  background: rgba(16, 185, 129, 0.04);
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.15);
}

.device-card.connected:hover {
  box-shadow:
    0 0 0 1px rgba(16, 185, 129, 0.2),
    0 8px 16px -4px rgba(16, 185, 129, 0.15);
}

/* Connecting state - amber with subtle pulse */
.device-card.connecting {
  border-color: var(--color-warning);
  background: rgba(245, 158, 11, 0.04);
  animation: connectingPulse 2s var(--ease-in-out) infinite;
}

@keyframes connectingPulse {
  0%, 100% {
    box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.2);
  }
  50% {
    box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.3);
  }
}

/* Error state - red border */
.device-card.connection-error {
  border-color: var(--color-error);
  background: rgba(239, 68, 68, 0.04);
}

/* Error shake animation */
.device-card.error-shake {
  animation: shake 0.5s var(--ease-default);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
  20%, 40%, 60%, 80% { transform: translateX(4px); }
}

/* ============================================
   CARD HEADER (Icon + Info)
   ============================================ */
.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.device-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.device-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08));
  transition: filter var(--transition-base);
}

.device-card:hover .device-icon {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12));
}

/* State indicator badges */
.state-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  border: 2px solid var(--bg-secondary);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.state-indicator.connected {
  background: var(--color-success);
  color: white;
}

.state-indicator.connecting {
  background: var(--color-warning);
}

.state-indicator.error {
  background: var(--color-error);
  color: white;
}

.spinner-small {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Device info */
.device-info {
  flex: 1;
  min-width: 0;
}

.device-name {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
  letter-spacing: var(--tracking-tight);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-platform {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: var(--space-1) 0 0 0;
}

/* ============================================
   CONNECTION STATUS
   ============================================ */
.connection-status {
  padding-top: var(--space-2);
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}

html.dark .connection-status {
  border-top-color: rgba(255, 255, 255, 0.04);
}

.status-text {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.status-text.connected {
  color: var(--color-success);
}

.status-text.connecting {
  color: var(--color-warning);
}

.status-text.error {
  color: var(--color-error);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
}

.status-dot.pulse {
  animation: pulseSubtle 1.5s var(--ease-in-out) infinite;
}

@keyframes pulseSubtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ============================================
   CONNECT BUTTON
   ============================================ */
.connect-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    transform var(--transition-fast),
    box-shadow var(--transition-fast);

  /* Default: gradient background */
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(255, 165, 0, 0.2);
}

.connect-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 165, 0, 0.3);
}

.connect-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.connect-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* Connected button state */
.connect-btn.connected {
  background: var(--color-success);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.connect-btn.connected:hover:not(:disabled) {
  background: #059669;
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

/* Connecting button state */
.connect-btn.connecting {
  background: var(--color-warning);
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.btn-icon {
  flex-shrink: 0;
}

/* ============================================
   MOBILE RESPONSIVE
   ============================================ */
@media (max-width: 767px) {
  .devices-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .device-card {
    padding: var(--space-4);
  }

  .device-icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .device-icon {
    font-size: 2rem;
  }

  .connect-btn {
    min-height: 44px;
  }
}
</style>
