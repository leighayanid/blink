<template>
  <div class="container">
    <header class="app-header">
      <h1>🚀 Hatid</h1>
      <p class="subtitle">Share files instantly on your local network</p>
    </header>

    <div class="main-content">
      <!-- Local Device Info -->
      <section class="section">
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

      <!-- Available Devices -->
      <section class="section">
        <h2>Available Devices ({{ devices.length }})</h2>
        <DeviceList
          :devices="devices"
          :selected-device="selectedDevice"
          @select="handleDeviceSelect"
          @connect="handleDeviceConnect"
        />
      </section>

      <!-- File Uploader -->
      <section class="section">
        <h2>Send Files</h2>
        <FileUploader
          :disabled="!connectedPeer"
          @files-selected="handleFilesSelected"
        />
      </section>

      <!-- Transfer Progress -->
      <TransferProgress
        :transfers="transfers"
        @clear-completed="clearCompleted"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Device } from '../types'
import { useDeviceDiscovery } from '../composables/useDeviceDiscovery'
import { useWebRTC } from '../composables/useWebRTC'
import { useFileTransfer } from '../composables/useFileTransfer'

const { devices, localDevice, isConnected, connect, disconnect, initDevice } = useDeviceDiscovery()
const { peer, localPeerId, initPeer, connectToPeer, connections, destroy } = useWebRTC()
const { transfers, sendFile, receiveFile, clearCompleted } = useFileTransfer()

const selectedDevice = ref<Device | null>(null)
const connectedPeer = ref<string | null>(null)

onMounted(async () => {
  // Initialize device info
  initDevice()

  // Initialize WebRTC peer
  try {
    await initPeer(localDevice.value?.id)
  } catch (error) {
    console.error('Failed to initialize peer:', error)
  }

  // Connect to signaling server
  connect()

  // Set up file receive handler for incoming connections
  watch(connections, (newConnections) => {
    newConnections.forEach((conn) => {
      receiveFile(conn)
    })
  }, { deep: true })
})

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

const handleDeviceSelect = (device: Device) => {
  selectedDevice.value = device
}

const handleDeviceConnect = async (device: Device) => {
  try {
    if (!device.peerId) {
      console.error('Device has no peer ID')
      return
    }

    const conn = await connectToPeer(device.peerId)
    connectedPeer.value = device.peerId

    // Set up file receive handler for this connection
    receiveFile(conn)

    console.log('Successfully connected to', device.name)
  } catch (error) {
    console.error('Failed to connect to device:', error)
  }
}

const handleFilesSelected = async (files: File[]) => {
  if (!connectedPeer.value) {
    console.error('No peer connected')
    return
  }

  const connection = connections.value.get(connectedPeer.value)
  if (!connection) {
    console.error('Connection not found')
    return
  }

  // Send each file
  for (const file of files) {
    try {
      await sendFile(file, connection)
    } catch (error) {
      console.error('Failed to send file:', error)
    }
  }
}

onUnmounted(() => {
  // Clean up connections
  disconnect()
  destroy()
})
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.app-header {
  text-align: center;
  margin-bottom: 3rem;
}

.app-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.subtitle {
  color: #666;
  font-size: 1.1rem;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
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
  align-items: center;
  justify-content: space-between;
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
  gap: 0.5rem;
  padding: 0.5rem 1rem;
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

@media (max-width: 768px) {
  .container {
    padding: 1rem;
  }

  .app-header h1 {
    font-size: 2rem;
  }

  .local-device {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}
</style>
