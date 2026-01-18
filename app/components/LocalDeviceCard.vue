<template>
  <div class="local-device-card">
    <div class="card-header">
      <h2>YOUR DEVICE</h2>
    </div>
    <div v-if="localDevice" class="device-content">
      <div class="device-info">
        <div class="device-badge">{{ getPlatformLabel(localDevice.platform) }}</div>
        <div class="device-details">
          <div class="device-name">{{ localDevice.name }}</div>
          <div class="device-platform">{{ localDevice.platform }}</div>
        </div>
      </div>
      <div class="status-badge" :class="{ connected: isConnected }">
        {{ isConnected ? 'CONNECTED' : 'OFFLINE' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Device } from '../types'

defineProps<{
  localDevice: Device | null
  isConnected: boolean
}>()

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
</script>

<style scoped>
.local-device-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  background: var(--bg-primary);
}

.card-header h2 {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: var(--text-sm);
  margin: 0 0 var(--space-4) 0;
  letter-spacing: 0.05em;
  color: var(--text-primary);
}

.device-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}

.device-info {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.device-badge {
  font-family: var(--font-mono);
  font-weight: bold;
  font-size: var(--text-xs);
  padding: 8px;
  border: 1px solid var(--border-strong);
  border-radius: 4px;
  min-width: 48px;
  text-align: center;
}

.device-details {
  display: flex;
  flex-direction: column;
}

.device-name {
  font-weight: bold;
  font-size: var(--text-base);
  color: var(--text-primary);
}

.device-platform {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.status-badge {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  padding: 4px 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  color: var(--text-secondary);
}

.status-badge.connected {
  background: var(--text-primary);
  color: var(--bg-primary);
}
</style>
