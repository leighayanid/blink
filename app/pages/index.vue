<template>
  <div class="page-container">
    <!-- Three-Column Dashboard Grid -->
    <div class="dashboard-grid">
      <!-- LEFT COLUMN: Identity & Discovery -->
      <div class="dashboard-column column-left">
        <!-- App Header -->
        <div class="section-card header-card">
          <button class="theme-toggle" @click="toggleTheme"
            :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
            <ClientOnly>
              <!-- Sun Icon (for Dark Mode) -->
              <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
              <!-- Moon Icon (for Light Mode) -->
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
              <template #fallback>
                 <div style="width: 18px; height: 18px;" />
              </template>
            </ClientOnly>
          </button>

          <div class="header-content">
            <h1 class="app-title">BLINK</h1>
            <p class="app-subtitle">SECURE LOCAL FILE SHARING</p>
            <div class="header-status">
              <span class="status-dot active"></span>
              <span class="text-mono text-xs">ONLINE</span>
            </div>
          </div>
        </div>

        <!-- Your Device -->
        <div class="section-card">
          <div class="card-header">
            <h2 class="card-title">LOCAL DEVICE</h2>
          </div>
          <div v-if="localDevice" class="local-device-content">
            <div class="device-info">
              <span class="device-type-badge">{{ getPlatformLabel(localDevice.platform) }}</span>
              <div class="device-text">
                <span class="device-name">{{ localDevice.name }}</span>
                <span class="device-platform">{{ localDevice.platform }}</span>
              </div>
            </div>
            <div class="status-badge" :class="{ active: isConnected }">
              {{ isConnected ? 'CONNECTED' : 'OFFLINE' }}
            </div>
          </div>
        </div>

        <!-- Available Devices -->
        <div class="section-card flex-grow">
          <div class="card-header">
            <h2 class="card-title">DISCOVERED</h2>
            <span class="count-badge">{{ devices.length }}</span>
          </div>
          <DeviceList :devices="devices" :selected-device="selectedDevice" :connected-peers="connectedPeers"
            :connection-states="connectionStates" @select="handleDeviceSelect" @connect="handleDeviceConnect" />
        </div>
      </div>

      <!-- CENTER COLUMN: Actions -->
      <div class="dashboard-column column-center">
        <!-- File Uploader -->
        <div class="section-card">
          <div class="card-header">
            <h2 class="card-title">TRANSFER FILES</h2>
          </div>
          <FileUploader :disabled="connectedPeers.size === 0" :connected-count="connectedPeers.size"
            @files-selected="handleFilesSelected" />
        </div>

        <!-- Progress -->
        <div class="section-card flex-grow">
          <div class="card-header">
            <h2 class="card-title">QUEUE</h2>
            <span v-if="transfers.length > 0" class="count-badge">{{ transfers.length }}</span>
          </div>
          <TransferProgress :embedded="true" />
        </div>
      </div>

      <!-- RIGHT COLUMN: Connections -->
      <div class="dashboard-column column-right">
        <div class="section-card flex-grow">
          <div class="card-header">
            <h2 class="card-title">NETWORK</h2>
            <span class="count-badge">{{ connectedPeers.size }}</span>
          </div>

          <div v-if="connectedPeers.size === 0 && !hasConnectingDevices" class="empty-state">
            <p class="text-mono text-sm">NO ACTIVE CONNECTIONS</p>
          </div>

          <div v-else class="connected-list">
            <!-- Connecting -->
            <div v-for="device in connectingDevices" :key="'connecting-' + device.id" class="connected-item connecting">
              <div class="item-main">
                <span class="device-type-badge">{{ getPlatformLabel(device.platform) }}</span>
                <span class="item-name">{{ device.name }}</span>
              </div>
              <span class="text-xs text-mono">CONNECTING...</span>
            </div>

            <!-- Connected -->
            <div v-for="device in devices.filter(d => connectedPeers.has(d.peerId!))" :key="device.id"
              class="connected-item" :class="{ active: targetPeerForSend === device.peerId }">
              <div class="item-main">
                <span class="device-type-badge">{{ getPlatformLabel(device.platform) }}</span>
                <div class="item-details">
                  <span class="item-name">{{ device.name }}</span>
                  <span class="status-text">ACTIVE</span>
                </div>
              </div>
              <div class="item-actions">
                <button v-if="connectedPeers.size > 1" class="btn-base btn-ghost"
                  @click="targetPeerForSend = device.peerId">
                  {{ targetPeerForSend === device.peerId ? 'SELECTED' : 'SELECT' }}
                </button>
                <button class="btn-base btn-outline" @click="handleDeviceDisconnect(device)">
                  DISCONNECT
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="app-footer">
      <div class="footer-content">
        <span class="text-mono text-xs opacity-50">CREATED BY </span>
        <a href="https://leighdinaya.dev" target="_blank" rel="noopener" class="footer-link">LEIGH DINAYA</a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import type { Device } from '../types'
import { useDeviceDiscovery } from '../composables/useDeviceDiscovery'
import { useWebRTC } from '../composables/useWebRTC'
import { useFileTransfer } from '../composables/useFileTransfer'
import { useToast } from '../composables/useToast'
import { useTheme } from '../composables/useTheme'

const { devices, localDevice, isConnected, connect, disconnect, initDevice, setLocalPeerId, announce } = useDeviceDiscovery()
const { peer, localPeerId, initPeer, connectToPeer, connections, connectionStates, destroy } = useWebRTC()
const { success, error: showError } = useToast()
const { transfers, sendFile, receiveFile } = useFileTransfer()
const { isDark, toggleTheme } = useTheme()

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
  initDevice()
  try {
    const peerId = await initPeer(localDevice.value?.id)
    setLocalPeerId(peerId)
  } catch (error) {
    console.error('Failed to initialize peer:', error)
  }
  connect()

  watch(connections, (newConnections) => {
    newConnections.forEach((conn, peerId) => {
      if (!fileReceiveHandlerSetup.value.has(peerId)) {
        fileReceiveHandlerSetup.value.add(peerId)
        receiveFile(conn)
      }
    })
  }, { deep: true })
})

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

const handleDeviceSelect = (device: Device) => {
  selectedDevice.value = device
}

const handleDeviceConnect = async (device: Device) => {
  try {
    if (!device.peerId) {
      showError('Cannot connect: Device has no peer ID')
      return
    }
    if (connectedPeers.value.has(device.peerId)) {
      targetPeerForSend.value = device.peerId
      return
    }
    const conn = await connectToPeer(device.peerId)
    connectedPeers.value.add(device.peerId)
    targetPeerForSend.value = device.peerId
    success(`Connected to ${device.name}`)
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    showError(`Failed to connect to ${device.name}: ${errorMsg}`)
  }
}

const handleDeviceDisconnect = (device: Device) => {
  if (device.peerId && connectedPeers.value.has(device.peerId)) {
    connectedPeers.value.delete(device.peerId)
    fileReceiveHandlerSetup.value.delete(device.peerId)
    const conn = connections.value.get(device.peerId)
    if (conn) conn.close()
    if (targetPeerForSend.value === device.peerId) {
      const remaining = Array.from(connectedPeers.value)[0]
      targetPeerForSend.value = remaining || null
    }
  }
}

const handleFilesSelected = async (files: File[], targetPeerId?: string) => {
  const peerId = targetPeerId || targetPeerForSend.value
  if (!peerId) return
  const connection = connections.value.get(peerId)
  if (!connection) return

  for (const file of files) {
    try {
      await sendFile(file, connection)
    } catch (error) {
      console.error('Failed to send file:', error)
    }
  }
}

onUnmounted(() => {
  disconnect()
  destroy()
})
</script>

<style scoped>
.page-container {
  width: 100%;
  height: 100vh;
  margin: 0;
  padding: var(--space-6);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.dashboard-grid {
  display: flex;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.dashboard-column {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.dashboard-column:last-child {
  border-right: none;
}

.column-left {
  flex: 1;
  min-width: 300px;
}

.column-center {
  flex: 2;
  min-width: 400px;
}

.column-right {
  flex: 1;
  min-width: 300px;
}

/* Section Cards */
.section-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
}

.section-card.flex-grow {
  flex: 1;
}

.section-card:last-child {
  border-bottom: none;
}

/* Headers */
.header-card {
  padding: var(--space-8) var(--space-6);
  position: relative;
}

.theme-toggle {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  background: transparent;
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-toggle:hover {
  border-color: var(--text-primary);
  color: var(--text-primary);
}

.header-content {
  text-align: center;
}

.app-title {
  font-family: var(--font-sans);
  font-weight: 900;
  font-size: 3rem;
  letter-spacing: -0.05em;
  line-height: 1;
  margin-bottom: var(--space-2);
}

.app-subtitle {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  margin-bottom: var(--space-4);
}

.header-status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 4px 12px;
  border: 1px solid var(--border-primary);
  border-radius: 999px;
  font-size: var(--text-xs);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

:global(.dark) .card-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-title {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.count-badge {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  padding: 2px 6px;
  background: var(--bg-secondary);
  border-radius: 4px;
}

/* Local Device */
.local-device-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.device-info {
  display: flex;
  align-items: center;
  gap: var(--space-4);
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

.device-text {
  display: flex;
  flex-direction: column;
}

.device-name {
  font-weight: bold;
  font-size: var(--text-base);
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
}

.status-badge.active {
  background: var(--text-primary);
  color: var(--bg-primary);
}

/* Connected Devices */
.connected-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.connected-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--bg-secondary);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
}

.connected-item.active {
  background: var(--bg-primary);
  border-color: var(--border-strong);
}

.item-main {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.item-details {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 600;
  font-size: var(--text-sm);
}

.status-text {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-tertiary);
}

.item-actions {
  display: flex;
  gap: var(--space-2);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  opacity: 0.5;
  border: 1px dashed var(--border-primary);
  border-radius: var(--radius-md);
}

/* Footer */
.app-footer {
  padding-top: var(--space-4);
  margin-top: var(--space-2);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  opacity: 0.8;
}

.footer-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.footer-link {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
  letter-spacing: 0.1em;
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
}

.footer-link:hover {
  border-bottom-color: var(--text-primary);
  opacity: 1;
}

/* Responsive */
@media (max-width: 1024px) {
  .page-container {
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
  }

  .dashboard-grid {
    flex-direction: column;
    height: auto;
  }

  .dashboard-column {
    border-right: none;
    border-bottom: none;
    height: auto;
    overflow: visible;
    flex: none;
    width: 100%;
  }

  .column-left,
  .column-center,
  .column-right {
    min-width: 0;
    width: 100%;
    flex: none;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: var(--space-4);
  }

  .dashboard-column {
    padding-bottom: var(--space-6);
  }

  .section-card {
    padding: var(--space-4);
  }

  .header-card {
    padding: var(--space-6) var(--space-4);
  }
}
</style>
