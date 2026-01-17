<template>
  <div class="device-list">
    <div v-if="devices.length === 0" class="empty-state">
      <p>No devices found on the network</p>
      <p class="text-sm">Make sure other devices are on the same network</p>
    </div>

    <div v-else class="devices-grid">
      <div
        v-for="device in devices"
        :key="device.id"
        class="device-card"
        :class="{
          selected: selectedDevice?.id === device.id,
          connected: connectedPeers?.has(device.peerId!),
          connecting: getDeviceState(device) === 'connecting',
          'connection-error': getDeviceState(device) === 'error'
        }"
        @click="$emit('select', device)"
      >
        <div class="device-icon">
          <span>{{ getPlatformIcon(device.platform) }}</span>
          <!-- Connecting spinner badge -->
          <span v-if="getDeviceState(device) === 'connecting'" class="state-badge connecting">
            <span class="spinner-small" />
          </span>
          <!-- Connected checkmark badge -->
          <span v-else-if="connectedPeers?.has(device.peerId!)" class="state-badge connected">✓</span>
          <!-- Error badge -->
          <span v-else-if="getDeviceState(device) === 'error'" class="state-badge error">!</span>
        </div>
        <div class="device-info">
          <h3>{{ device.name }}</h3>
          <p class="platform">{{ device.platform }}</p>
          <p v-if="device.ip" class="ip">{{ device.ip }}</p>
          <!-- Connection status text -->
          <p v-if="getDeviceState(device) === 'connecting'" class="status-text connecting">Connecting...</p>
          <p v-else-if="connectedPeers?.has(device.peerId!)" class="status-text connected">Connected</p>
          <p v-else-if="getDeviceState(device) === 'error'" class="status-text error">Connection failed</p>
        </div>
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
            <span class="btn-spinner" /> Connecting...
          </template>
          <template v-else-if="connectedPeers?.has(device.peerId!)">
            ✓ Connected
          </template>
          <template v-else>
            Connect
          </template>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
</script>

<style scoped>
.device-list {
  padding: 1rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.device-card {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.device-card:hover {
  border-color: #4CAF50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.device-card.selected {
  border-color: #4CAF50;
  background-color: #f1f8f4;
}

.device-card.connected {
  border-color: #10b981;
  background-color: rgba(16, 185, 129, 0.05);
}

.device-card.connecting {
  border-color: #f59e0b;
  background-color: rgba(245, 158, 11, 0.05);
  animation: connecting-card-pulse 1.5s ease-in-out infinite;
}

.device-card.connection-error {
  border-color: #ef4444;
  background-color: rgba(239, 68, 68, 0.05);
}

@keyframes connecting-card-pulse {
  0%,
  100% {
    border-color: rgba(245, 158, 11, 0.4);
  }

  50% {
    border-color: rgba(245, 158, 11, 0.8);
  }
}

.device-icon {
  font-size: 2rem;
  text-align: center;
  position: relative;
  display: inline-block;
}

.state-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  border: 2px solid white;
}

.state-badge.connected {
  background-color: #10b981;
  color: white;
}

.state-badge.connecting {
  background-color: #f59e0b;
}

.state-badge.error {
  background-color: #ef4444;
  color: white;
}

.spinner-small {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.device-info h3 {
  margin: 0;
  font-size: 1.1rem;
}

.device-info p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #666;
}

.status-text {
  font-weight: 600;
  font-size: 0.85rem;
}

.status-text.connected {
  color: #10b981;
}

.status-text.connecting {
  color: #f59e0b;
}

.status-text.error {
  color: #ef4444;
}

.connect-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.connect-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.connect-btn:disabled {
  cursor: not-allowed;
  opacity: 0.9;
}

.connect-btn.connected {
  background-color: #10b981;
}

.connect-btn.connected:hover {
  background-color: #059669;
}

.connect-btn.connecting {
  background-color: #f59e0b;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
</style>
