<template>
  <div class="page-container">
    <!-- Hero Header -->
    <header class="hero-header">
      <div class="hero-bg-gradient" />
      <h1 class="hero-title">Hatid</h1>
      <p class="hero-subtitle">Share files instantly on your local network</p>
    </header>

    <div class="main-content">
      <!-- Local Device Info -->
      <section class="section local-device-section">
        <h2 class="section-header">
          <span class="section-title">Your Device</span>
        </h2>
        <div v-if="localDevice" class="local-device-card">
          <div class="device-badge">
            <span class="device-icon">{{ getPlatformIcon(localDevice.platform) }}</span>
            <div class="device-details">
              <div class="device-name">{{ localDevice.name }}</div>
              <div class="device-platform">{{ localDevice.platform }}</div>
            </div>
          </div>
          <div v-if="isConnected" class="status-pill connected">
            <span class="status-dot" />
            Connected
          </div>
          <div v-else class="status-pill disconnected">
            <span class="status-dot" />
            Disconnected
          </div>
        </div>
      </section>

      <!-- Connected Devices -->
      <section v-if="connectedPeers.size > 0 || hasConnectingDevices" class="section">
        <h2 class="section-header">
          <span class="section-title">Connected Devices</span>
          <span class="section-badge">{{ connectedPeers.size }}</span>
        </h2>
        <div class="connected-devices">
          <!-- Show connecting devices -->
          <div
            v-for="device in connectingDevices"
            :key="'connecting-' + device.id"
            class="connected-device connecting"
          >
            <div class="device-header">
              <span class="icon">{{ getPlatformIcon(device.platform) }}</span>
              <div class="device-info">
                <div class="device-name">{{ device.name }}</div>
                <div class="device-platform">{{ device.platform }}</div>
              </div>
              <div class="status connecting-status">
                <span class="spinner" />
                Connecting...
              </div>
            </div>
          </div>
          <!-- Show connected devices -->
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
        <h2 class="section-header">
          <span class="section-title">Available Devices</span>
          <span class="section-badge">{{ devices.length }}</span>
        </h2>
        <DeviceList
          :devices="devices"
          :selected-device="selectedDevice"
          :connected-peers="connectedPeers"
          :connection-states="connectionStates"
          @select="handleDeviceSelect"
          @connect="handleDeviceConnect"
        />
      </section>

      <!-- File Uploader -->
      <section class="section">
        <h2 class="section-header">
          <span class="section-title">Send Files</span>
        </h2>
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
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import type { Device } from '../types'
import { useDeviceDiscovery } from '../composables/useDeviceDiscovery'
import { useWebRTC } from '../composables/useWebRTC'
import { useFileTransfer } from '../composables/useFileTransfer'
import { useToast } from '../composables/useToast'

const { devices, localDevice, isConnected, connect, disconnect, initDevice, setLocalPeerId, announce } = useDeviceDiscovery()
const { peer, localPeerId, initPeer, connectToPeer, connections, connectionStates, destroy } = useWebRTC()
const { success, error: showError } = useToast()
const { transfers, sendFile, receiveFile, clearCompleted } = useFileTransfer()

const selectedDevice = ref<Device | null>(null)
const connectedPeers = ref<Set<string>>(new Set())
const targetPeerForSend = ref<string | null>(null)
const fileReceiveHandlerSetup = ref<Set<string>>(new Set())

// Computed properties for connection states
const connectingDevices = computed(() => {
  return devices.value.filter(device => {
    if (!device.peerId) return false
    const state = connectionStates.value.get(device.peerId)
    return state === 'connecting' && !connectedPeers.value.has(device.peerId)
  })
})

const hasConnectingDevices = computed(() => {
  return connectingDevices.value.length > 0
})

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
      showError('Cannot connect: Device has no peer ID')
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
    success(`Connected to ${device.name}`)
  } catch (error) {
    console.error('[Page] Failed to connect to device:', error)
    const errorMsg = error instanceof Error ? error.message : String(error)
    showError(`Failed to connect to ${device.name}: ${errorMsg}`)
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
/* ============================================
   PAGE CONTAINER & HERO HEADER
   ============================================ */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-6);
}

.hero-header {
  position: relative;
  text-align: center;
  padding: var(--space-12) var(--space-4) var(--space-8);
  margin-bottom: var(--space-8);
}

.hero-bg-gradient {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 80% 50% at 50% -20%,
    rgba(255, 165, 0, 0.12) 0%,
    rgba(255, 165, 0, 0.05) 40%,
    transparent 70%
  );
  pointer-events: none;
  z-index: -1;
}

html.dark .hero-bg-gradient {
  background: radial-gradient(
    ellipse 80% 50% at 50% -20%,
    rgba(255, 149, 0, 0.15) 0%,
    rgba(255, 149, 0, 0.05) 40%,
    transparent 70%
  );
}

.hero-title {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-3);
  background: linear-gradient(135deg, #FF9500 0%, #FFB84D 50%, #FFC107 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  font-weight: var(--font-normal);
  letter-spacing: var(--tracking-normal);
}

/* ============================================
   MAIN CONTENT & SECTIONS
   ============================================ */
.main-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.section {
  background: var(--bg-secondary);
  border-radius: 0.75rem;
  padding: var(--space-6);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 1px 3px rgba(0, 0, 0, 0.06);
  transition:
    box-shadow var(--transition-base),
    border-color var(--transition-base);
  animation: slideUp var(--duration-slow) var(--ease-out) forwards;
}

html.dark .section {
  border-color: rgba(255, 255, 255, 0.06);
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.2),
    0 1px 3px rgba(0, 0, 0, 0.3);
}

/* Section Headers */
.section-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: 0 0 var(--space-5) 0;
}

.section-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.section-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--color-primary);
  background: rgba(255, 165, 0, 0.1);
  border-radius: 9999px;
}

html.dark .section-badge {
  background: rgba(255, 149, 0, 0.15);
}

/* ============================================
   LOCAL DEVICE CARD (Glassmorphism)
   ============================================ */
.local-device-section {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
}

.local-device-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-6);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 1rem;
  border: 1px solid rgba(255, 165, 0, 0.15);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.05),
    0 2px 4px -1px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  transition: all var(--transition-base);
}

html.dark .local-device-card {
  background: rgba(26, 35, 50, 0.7);
  border-color: rgba(255, 149, 0, 0.2);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.3),
    0 2px 4px -1px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.device-badge {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.device-icon {
  font-size: 3rem;
  filter: drop-shadow(0 4px 8px rgba(255, 165, 0, 0.25));
}

.device-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.device-name {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  letter-spacing: var(--tracking-tight);
}

.device-platform {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

/* Status Pill */
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border-radius: 9999px;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.status-pill.connected {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-pill.disconnected {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
}

.status-pill.connected .status-dot {
  animation: pulseSubtle 2s var(--ease-in-out) infinite;
}

@keyframes pulseSubtle {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* ============================================
   CONNECTED DEVICES
   ============================================ */
.connected-devices {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.connected-device {
  padding: var(--space-4);
  background: rgba(16, 185, 129, 0.04);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 0.75rem;
  transition: all var(--transition-base);
}

.connected-device.active {
  border-color: rgba(16, 185, 129, 0.4);
  background: rgba(16, 185, 129, 0.08);
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.1);
}

.device-header {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
}

.device-header .icon {
  font-size: 2rem;
}

.device-info {
  flex: 1;
}

.status {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.device-actions {
  display: flex;
  gap: var(--space-3);
}

.select-btn,
.disconnect-btn {
  padding: var(--space-2) var(--space-4);
  border: none;
  border-radius: 0.5rem;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.select-btn {
  background-color: rgba(100, 116, 139, 0.08);
  color: var(--text-primary);
  border: 1px solid rgba(100, 116, 139, 0.2);
}

.select-btn:hover:not(.active) {
  background-color: rgba(100, 116, 139, 0.15);
}

.select-btn.active {
  background-color: rgba(16, 185, 129, 0.15);
  color: var(--color-success);
  border-color: rgba(16, 185, 129, 0.3);
}

.disconnect-btn {
  background-color: rgba(239, 68, 68, 0.08);
  color: var(--color-error);
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.disconnect-btn:hover {
  background-color: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.3);
}

/* Connecting state styles */
.connected-device.connecting {
  background: rgba(245, 158, 11, 0.06);
  border-color: rgba(245, 158, 11, 0.25);
  animation: connecting-pulse 1.5s var(--ease-in-out) infinite;
}

@keyframes connecting-pulse {
  0%, 100% {
    border-color: rgba(245, 158, 11, 0.25);
  }
  50% {
    border-color: rgba(245, 158, 11, 0.5);
  }
}

.connecting-status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-warning);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(245, 158, 11, 0.3);
  border-top-color: var(--color-warning);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ============================================
   MOBILE RESPONSIVE (Task 1 basic mobile styles)
   ============================================ */
@media (max-width: 768px) {
  .page-container {
    padding: var(--space-4);
  }

  .hero-header {
    padding: var(--space-8) var(--space-2) var(--space-6);
    margin-bottom: var(--space-6);
  }

  .hero-title {
    font-size: var(--text-3xl);
  }

  .hero-subtitle {
    font-size: var(--text-base);
  }

  .local-device-card {
    flex-direction: column;
    gap: var(--space-4);
    text-align: center;
  }

  .device-badge {
    flex-direction: column;
    gap: var(--space-2);
  }

  .device-header {
    flex-direction: column;
    text-align: center;
  }

  .device-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
