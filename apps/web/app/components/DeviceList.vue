<template>
  <div class="device-list">
    <!-- Empty State -->
    <div v-if="devices.length === 0" class="empty-state animate-fade-in">
      <div class="empty-icon-wrapper">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="empty-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      </div>
      <div class="empty-text font-display">NO DEVICES FOUND</div>
      <p class="empty-description">Ensure devices are on the same network.</p>
    </div>

    <!-- Devices Grid -->
    <div v-else class="devices-grid">
      <div v-for="(device, index) in devices" :key="device.id" 
        class="device-card card-minimal" 
        :class="{
          'selected': selectedDeviceResolved?.id === device.id,
          'connected border-glow-green': device.peerId ? connectedPeersResolved.has(device.peerId) : false,
          'connecting border-glow-cyan': getDeviceState(device) === 'connecting',
          'error border-glow-pink': getDeviceState(device) === 'error',
          'animate-stagger': true
        }" 
        :style="{ animationDelay: `${index * 50}ms` }"
        @click="$emit('select', device)"
      >
        
        <div class="card-content">
          <div class="device-icon-wrapper">
             <!-- Dynamic Icon based on Platform -->
             <svg v-if="getPlatformIcon(device.platform) === 'monitor'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
             </svg>
             <svg v-else-if="getPlatformIcon(device.platform) === 'smartphone'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                <line x1="12" y1="18" x2="12.01" y2="18"></line>
             </svg>
             <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
                <rect x="9" y="9" width="6" height="6"></rect>
                <line x1="9" y1="1" x2="9" y2="4"></line>
                <line x1="15" y1="1" x2="15" y2="4"></line>
                <line x1="9" y1="20" x2="9" y2="23"></line>
                <line x1="15" y1="20" x2="15" y2="23"></line>
                <line x1="20" y1="9" x2="23" y2="9"></line>
                <line x1="20" y1="14" x2="23" y2="14"></line>
                <line x1="1" y1="9" x2="4" y2="9"></line>
                <line x1="1" y1="14" x2="4" y2="14"></line>
             </svg>
             
             <!-- Connection Status Dot -->
             <div v-if="device.peerId && connectedPeersResolved.has(device.peerId)" class="status-indicator connected"></div>
             <div v-else-if="getDeviceState(device) === 'connecting'" class="status-indicator connecting"></div>
          </div>

          <div class="device-details">
            <div class="device-badges">
               <span class="badge-neon cyan">{{ getPlatformLabel(device.platform) }}</span>
            </div>
            <h3 class="device-name text-glow">{{ device.name }}</h3>
            <span class="device-meta text-mono">
              {{ getStatusText(device) }}
            </span>
          </div>
        </div>

        <button 
          class="connect-btn"
          :class="{
            'btn-gradient-synth': !connectedPeersResolved.has(device.peerId || ''),
            'btn-outline': connectedPeersResolved.has(device.peerId || ''),
            'loading': getDeviceState(device) === 'connecting'
          }" 
          :disabled="getDeviceState(device) === 'connecting' || !device.peerId"
          @click.stop="$emit('connect', device)"
        >
          <span v-if="getDeviceState(device) === 'connecting'" class="spinner"></span>
          <span v-else>{{ getActionLabel(device) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Device } from '@blink/types'
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

// Vue auto-unwraps refs when passed as props, so no manual unwrapping is needed.
const connectedPeersResolved = computed(() => props.connectedPeers ?? new Set<string>())
const selectedDeviceResolved = computed(() => props.selectedDevice ?? null)

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

const getPlatformIcon = (platform: string): 'monitor' | 'smartphone' | 'unknown' => {
    const lower = platform.toLowerCase();
    if (lower.includes('android') || lower.includes('ios') || lower.includes('phone')) return 'smartphone';
    if (lower.includes('win') || lower.includes('mac') || lower.includes('linux')) return 'monitor';
    return 'unknown';
}

const getDeviceState = (device: Device): ConnectionState | undefined => {
  if (!device.peerId) return undefined
  return props.connectionStates?.get(device.peerId)
}

const getStatusText = (device: Device): string => {
  const state = getDeviceState(device)
  if (state === 'connecting') return 'ESTABLISHING...'
  if (state === 'error') return 'CONNECTION FAILED'
  if (device.peerId && connectedPeersResolved.value.has(device.peerId)) return 'CONNECTED'
  return 'AVAILABLE'
}

const getActionLabel = (device: Device): string => {
  const state = getDeviceState(device)
  if (state === 'connecting') return ''
  if (device.peerId && connectedPeersResolved.value.has(device.peerId)) return 'DISCONNECT'
  return 'CONNECT'
}
</script>

<style scoped>
.device-list {
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) var(--space-6);
  text-align: center;
  border: 1px dashed var(--border-primary);
  border-radius: var(--radius-lg);
  background: rgba(0,0,0,0.02);
  margin-top: var(--space-4);
}

.empty-icon-wrapper {
  color: var(--text-tertiary);
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.empty-text {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.empty-description {
  font-size: var(--text-sm);
  color: var(--text-tertiary);
}

/* Grid Layout */
.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
  width: 100%;
}

/* Device Card */
.device-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  min-height: 180px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.device-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.15);
  border-color: var(--text-primary);
}

.device-card.selected {
  border-color: var(--neon-cyan);
  background: rgba(0, 255, 255, 0.03);
}

/* Animations */
@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-stagger {
  animation: slideUpFade 0.5s ease backwards;
}

/* Card Content */
.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.device-icon-wrapper {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
}

.device-card:hover .device-icon-wrapper {
  color: var(--text-primary);
  background: var(--bg-secondary);
}

.status-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
}

.status-indicator.connected {
  background-color: var(--neon-green);
  box-shadow: 0 0 8px var(--neon-green);
}

.status-indicator.connecting {
  background-color: var(--neon-cyan);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(0, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 255, 255, 0); }
}

.device-details {
  display: flex;
  flex-direction: column;
}

.device-badges {
  margin-bottom: var(--space-2);
}

.device-name {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  line-height: 1.2;
  margin-bottom: var(--space-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-meta {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Connect Button */
.connect-btn {
  width: 100%;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  font-weight: var(--font-bold);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.connect-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

