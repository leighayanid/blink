<template>
  <!-- LEFT COLUMN: Your Device -->
  <template #left>
    <LocalDeviceCard
      :local-device="localDevice"
      :is-connected="isConnected"
    />
  </template>

  <!-- CENTER COLUMN: Available Devices -->
  <template #center>
    <section class="section">
      <h2>Available Devices ({{ devices.length }})</h2>
      <DeviceList
        :devices="devices"
        :selected-device="selectedDevice"
        @select="handleDeviceSelect"
        @connect="handleDeviceConnect"
      />
    </section>
  </template>

  <!-- RIGHT COLUMN: File Uploader -->
  <template #right>
    <section class="section">
      <h2>Send Files</h2>
      <FileUploader
        :disabled="!connectedPeer"
        @files-selected="handleFilesSelected"
      />
    </section>
  </template>

  <!-- BOTTOM SECTION: Transfer Progress (Full Width) -->
  <template #bottom>
    <TransferProgress
      :transfers="transfers"
      @clear-completed="clearCompleted"
    />
  </template>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { Device } from '../types'
import { useDeviceDiscovery } from '../composables/useDeviceDiscovery'
import { useWebRTC } from '../composables/useWebRTC'
import { useFileTransfer } from '../composables/useFileTransfer'

// Use the three-column layout
definePageMeta({
  layout: 'three-column'
})

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
</style>
