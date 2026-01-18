<template>
  <div class="device-list">
    <!-- Empty State -->
    <div v-if="devices.length === 0" class="empty-state">
      <div class="empty-icon-text">NO DEVICES FOUND</div>
      <p class="empty-description">Ensure other devices are on the same network.</p>
    </div>

    <!-- Devices Grid -->
    <div v-else class="devices-grid">
      <div v-for="device in devices" :key="device.id" class="device-card" :class="{
        selected: selectedDeviceResolved?.id === device.id,
        connected: device.peerId ? connectedPeersResolved.has(device.peerId) : false,
        connecting: getDeviceState(device) === 'connecting',
        error: getDeviceState(device) === 'error'
      }" @click="$emit('select', device)">
        <div class="card-main">
          <div class="device-type-badge">{{ getPlatformLabel(device.platform) }}</div>
          <div class="device-info">
            <h3 class="device-name">{{ device.name }}</h3>
            <span class="device-status-text">
              {{ getStatusText(device) }}
            </span>
          </div>
        </div>

        <button v-if="selectedDeviceResolved?.id === device.id" class="action-btn" :class="{
          connected: device.peerId ? connectedPeersResolved.has(device.peerId) : false,
          connecting: getDeviceState(device) === 'connecting'
        }" :disabled="getDeviceState(device) === 'connecting' || !device.peerId"
          @click.stop="$emit('connect', device)">
          {{ getActionLabel(device) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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

// Helpers
const resolveConnectedPeers = (): Set<string> => {
  const cpAny: any = props.connectedPeers
  return (cpAny instanceof Set || (cpAny?.has)) ? cpAny : (cpAny?.value || new Set())
}
const connectedPeersResolved = computed(() => resolveConnectedPeers())

const resolveConnectionStates = (): Map<string, ConnectionState> | null => {
  const csAny: any = props.connectionStates
  return (csAny instanceof Map || (csAny?.get)) ? csAny : (csAny?.value || null)
}

const resolveSelectedDevice = (): Device | null => {
  const sAny: any = props.selectedDevice
  return (sAny?.id) ? sAny : (sAny?.value || null)
}
const selectedDeviceResolved = computed(() => resolveSelectedDevice())

const getPlatformLabel = (platform: string): string => {
  const map: Record<string, string> = {
    'Windows': 'WIN',
    'macOS': 'MAC',
    'Linux': 'LIN',
    'Android': 'AND',
    'iOS': 'IOS',
    'Unknown': 'UNK'
  }
  return map[platform] || 'UNK'
}

const getDeviceState = (device: Device): ConnectionState | undefined => {
  if (!device.peerId) return undefined
  const map = resolveConnectionStates()
  return map?.get(device.peerId)
}

const getStatusText = (device: Device): string => {
  const state = getDeviceState(device)
  if (state === 'connecting') return 'CONNECTING...'
  if (state === 'error') return 'FAILED'
  if (device.peerId && connectedPeersResolved.value.has(device.peerId)) return 'CONNECTED'
  return device.platform.toUpperCase()
}

const getActionLabel = (device: Device): string => {
  const state = getDeviceState(device)
  if (state === 'connecting') return 'CONNECTING...'
  if (device.peerId && connectedPeersResolved.value.has(device.peerId)) return 'CONNECTED'
  return 'CONNECT'
}
</script>

<style scoped>
.device-list {
  display: flex;
  flex-direction: column;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  text-align: center;
  border: 1px dashed var(--border-primary);
  border-radius: var(--radius-md);
  opacity: 0.6;
}

.empty-icon-text {
  font-family: var(--font-mono);
  font-weight: bold;
  margin-bottom: var(--space-2);
}

.empty-description {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-4);
  width: 100%;
}

.device-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-4);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  background: var(--bg-primary);
  transition: border-color 0.2s ease;
}

.device-card:hover {
  border-color: var(--border-strong);
}

.device-card.selected {
  border-color: var(--border-strong);
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.device-card.connected {
  border-color: var(--border-strong);
}

.card-main {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
  position: relative;
  z-index: 1;
}

.device-type-badge {
  font-family: var(--font-mono);
  font-weight: bold;
  font-size: var(--text-xs);
  padding: 8px;
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  min-width: 48px;
  text-align: center;
}

.device-info {
  display: flex;
  flex-direction: column;
}

.device-name {
  font-weight: bold;
  font-size: var(--text-base);
  margin: 0;
  color: var(--text-primary);
}

.device-status-text {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.action-btn {
  width: 100%;
  padding: 8px;
  font-size: var(--text-sm);
  font-weight: 600;
  text-transform: uppercase;
  background: var(--text-primary);
  color: var(--bg-primary);
  border: 1px solid var(--text-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  position: relative;
  z-index: 2;
  transition: all 0.2s ease;
}

.action-btn:hover {
  opacity: 0.9;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.connected {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}
</style>
