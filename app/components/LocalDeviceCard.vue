<template>
  <section class="section local-device-card">
    <h2>Your Device</h2>
    <div v-if="localDevice" class="local-device">
      <div class="device-badge">
        <span class="icon">{{ getPlatformIcon(localDevice.platform) }}</span>
        <div>
          <div class="device-name">{{ localDevice.name }}</div>
          <div class="device-platform">{{ localDevice.platform }}</div>
        </div>
      </div>
      <div v-if="isConnected" class="status-indicator connected">
        <span class="dot" />
        Connected
      </div>
      <div v-else class="status-indicator disconnected">
        <span class="dot" />
        Disconnected
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Device } from '../types'

defineProps<{
  localDevice: Device | null
  isConnected: boolean
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
.local-device-card {
  position: sticky;
  top: 2rem;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.local-device {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.device-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.device-badge .icon {
  font-size: 2rem;
}

.device-name {
  font-weight: 600;
  font-size: 1.1rem;
}

.device-platform {
  color: #666;
  font-size: 0.9rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.status-indicator.connected {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-indicator.disconnected {
  background-color: #ffebee;
  color: #c62828;
}

.status-indicator .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }
}

@media (max-width: 1200px) {
  .local-device-card {
    position: static;
  }
}
</style>
