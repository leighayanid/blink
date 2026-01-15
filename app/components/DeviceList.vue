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
          connected: connectedPeers?.has(device.peerId!)
        }"
        @click="$emit('select', device)"
      >
        <div class="device-icon">
          <span>{{ getPlatformIcon(device.platform) }}</span>
          <span v-if="connectedPeers?.has(device.peerId!)" class="connected-badge">✓</span>
        </div>
        <div class="device-info">
          <h3>{{ device.name }}</h3>
          <p class="platform">{{ device.platform }}</p>
          <p v-if="device.ip" class="ip">{{ device.ip }}</p>
          <p v-if="connectedPeers?.has(device.peerId!)" class="connected-status">Connected</p>
        </div>
        <button
          v-if="selectedDevice?.id === device.id"
          class="connect-btn"
          :class="{ connected: connectedPeers?.has(device.peerId!) }"
          @click.stop="$emit('connect', device)"
        >
          {{ connectedPeers?.has(device.peerId!) ? '✓ Connected' : 'Connect' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Device } from '../types'

defineProps<{
  devices: Device[]
  selectedDevice?: Device | null
  connectedPeers?: Set<string>
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

.device-icon {
  font-size: 2rem;
  text-align: center;
  position: relative;
}

.connected-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #10b981;
  color: white;
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

.device-info h3 {
  margin: 0;
  font-size: 1.1rem;
}

.device-info p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
  color: #666;
}

.connected-status {
  color: #10b981;
  font-weight: 600;
  font-size: 0.85rem;
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
}

.connect-btn:hover {
  background-color: #45a049;
}

.connect-btn.connected {
  background-color: #10b981;
}

.connect-btn.connected:hover {
  background-color: #059669;
}
</style>
