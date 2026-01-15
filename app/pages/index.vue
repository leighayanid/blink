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

      <!-- Connected Devices -->
      <section v-if="connectedPeers.size > 0" class="section">
        <h2>Connected Devices ({{ connectedPeers.size }})</h2>
        <div class="connected-devices">
          <div
            v-for="device in devices.filter(d => connectedPeers.has(d.peerId!))"
            :key="device.id"
            class="connected-device"
            :class="{ active: targetPeerForSend === device.peerId }"
          >
            <div class="device-header">
              <span class="icon">{{ getPlatformIcon(device.platform) }}</span>
              <div class="device-info">
                <div class="device-name">{{ device.name }}</div>
                <div class="device-platform">{{ device.platform }}</div>
              </div>
              <div class="status">🟢 Connected</div>
            </div>
            <div class="device-actions">
              <button
                v-if="connectedPeers.size > 1"
                class="select-btn"
                :class="{ active: targetPeerForSend === device.peerId }"
                @click="targetPeerForSend = device.peerId"
              >
                {{ targetPeerForSend === device.peerId ? '✓ Active' : 'Select' }}
              </button>
              <button class="disconnect-btn" @click="handleDeviceDisconnect(device)">
                Disconnect
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Available Devices -->
      <section class="section">
        <h2>Available Devices ({{ devices.length }})</h2>
        <DeviceList
          :devices="devices"
          :selected-device="selectedDevice"
          :connected-peers="connectedPeers"
          @select="handleDeviceSelect"
          @connect="handleDeviceConnect"
        />
      </section>

      <!-- File Uploader -->
      <section class="section">
        <h2>Send Files</h2>
        <FileUploader
          :disabled="connectedPeers.size === 0"
          :connected-count="connectedPeers.size"
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

const { devices, localDevice, isConnected, connect, disconnect, initDevice, setLocalPeerId, announce } = useDeviceDiscovery()
const { peer, localPeerId, initPeer, connectToPeer, connections, destroy } = useWebRTC()
const { transfers, sendFile, receiveFile, clearCompleted } = useFileTransfer()

const selectedDevice = ref<Device | null>(null)
const connectedPeers = ref<Set<string>>(new Set())
const targetPeerForSend = ref<string | null>(null)
const fileReceiveHandlerSetup = ref<Set<string>>(new Set())

onMounted(async () => {
  // Initialize device info
  initDevice()

  // Initialize WebRTC peer with a unique ID
  // PeerJS will use this ID for the peer connection
  try {
    const peerId = await initPeer(localDevice.value?.id)
    // Store the PeerJS peer ID in the local device so it's included in announcements
    setLocalPeerId(peerId)
    console.log('[Page] PeerJS initialized with ID:', peerId)
  } catch (error) {
    console.error('Failed to initialize peer:', error)
  }

  // Connect to signaling server AFTER PeerJS is ready
  // This ensures the announce includes the correct peerId
  connect()

  // Set up file receive handler for incoming connections
  // Only set up handler once per connection to prevent duplicate listeners
  watch(connections, (newConnections) => {
    newConnections.forEach((conn, peerId) => {
      if (!fileReceiveHandlerSetup.value.has(peerId)) {
        fileReceiveHandlerSetup.value.add(peerId)
        receiveFile(conn)
      }
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
      alert('Cannot connect: Device has no peer ID. Please try again.')
      return
    }

    // Check if already connected
    if (connectedPeers.value.has(device.peerId)) {
      console.log('[Page] Already connected to', device.name)
      targetPeerForSend.value = device.peerId
      return
    }

    console.log('[Page] Attempting to connect to device:', device.name, 'with peerId:', device.peerId)
    const conn = await connectToPeer(device.peerId)
    connectedPeers.value.add(device.peerId)
    targetPeerForSend.value = device.peerId

    // File receive handler is set up by the connections watcher
    // to ensure it's only registered once per connection

    console.log('[Page] Successfully connected to', device.name)
    alert(`Connected to ${device.name}!`)
  } catch (error) {
    console.error('[Page] Failed to connect to device:', error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    alert(`Failed to connect to ${device.name}: ${errorMsg}`)
  }
}

const handleDeviceDisconnect = (device: Device) => {
  if (device.peerId && connectedPeers.value.has(device.peerId)) {
    connectedPeers.value.delete(device.peerId)
    // Clean up file receive handler tracking
    fileReceiveHandlerSetup.value.delete(device.peerId)
    // Close the WebRTC connection
    const conn = connections.value.get(device.peerId)
    if (conn) {
      conn.close()
    }
    // Update target peer if this was the selected one
    if (targetPeerForSend.value === device.peerId) {
      const remaining = Array.from(connectedPeers.value)[0]
      targetPeerForSend.value = remaining || null
    }
    console.log('[Page] Disconnected from', device.name)
  }
}

const handleFilesSelected = async (files: File[], targetPeerId?: string) => {
  const peerId = targetPeerId || targetPeerForSend.value

  if (!peerId) {
    console.error('No peer selected for sending')
    return
  }

  const connection = connections.value.get(peerId)
  if (!connection) {
    console.error('Connection not found for peer:', peerId)
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
  color: var(--color-primary);
  font-weight: 700;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255, 165, 0, 0.1);
  transition: all 0.3s ease;
}

.section:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--color-primary);
  font-weight: 600;
}

.local-device {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: linear-gradient(135deg, rgba(255, 165, 0, 0.05) 0%, rgba(255, 215, 0, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(255, 165, 0, 0.2);
  transition: all 0.3s ease;
}

.device-badge {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.device-badge .icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(255, 165, 0, 0.2));
}

.device-name {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-primary);
}

.device-platform {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-indicator.connected {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%);
  color: var(--color-success);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.status-indicator.disconnected {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%);
  color: var(--color-error);
  border: 1px solid rgba(239, 68, 68, 0.3);
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

.connected-devices {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.connected-device {
  padding: 1rem;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%);
  border: 2px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.connected-device.active {
  border-color: rgba(16, 185, 129, 0.6);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.2);
}

.device-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.device-header .icon {
  font-size: 2rem;
}

.device-info {
  flex: 1;
}

.device-name {
  font-weight: 600;
  color: var(--text-primary);
}

.device-platform {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.status {
  font-size: 0.9rem;
  font-weight: 600;
}

.device-actions {
  display: flex;
  gap: 0.75rem;
}

.select-btn,
.disconnect-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-btn {
  background-color: rgba(100, 116, 139, 0.1);
  color: var(--text-primary);
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.select-btn:hover:not(.active) {
  background-color: rgba(100, 116, 139, 0.2);
}

.select-btn.active {
  background-color: rgba(16, 185, 129, 0.2);
  color: var(--color-success);
  border-color: rgba(16, 185, 129, 0.5);
}

.disconnect-btn {
  background-color: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.disconnect-btn:hover {
  background-color: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
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

  .device-header {
    flex-direction: column;
    text-align: center;
  }

  .device-actions {
    flex-wrap: wrap;
  }
}
</style>
