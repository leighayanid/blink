# Local Sharing Web App - Nuxt 4 Implementation Guide

## Project Overview
Build a local file sharing web application similar to LocalSend using Nuxt 4, WebRTC, and WebSockets for peer-to-peer file transfers on a local network.

---

## Table of Contents
1. [Project Setup](#project-setup)
2. [Dependencies](#dependencies)
3. [Project Structure](#project-structure)
4. [Configuration](#configuration)
5. [Implementation Details](#implementation-details)
6. [Step-by-Step Build Instructions](#step-by-step-build-instructions)
7. [Key Features](#key-features)
8. [Testing Guide](#testing-guide)

---

## Project Setup

### Initialize Nuxt 4 Project
```bash
npx nuxi@latest init local-share-app
cd local-share-app
npm install
```

---

## Dependencies

### Required Packages
```bash
# Core dependencies
npm install socket.io-client
npm install peerjs
npm install qrcode.vue3

# State management and utilities
npm install pinia
npm install @vueuse/core

# Optional: UI/Styling
npm install @nuxtjs/tailwindcss
```

### Package Descriptions
- **socket.io-client**: WebSocket communication for device discovery
- **peerjs**: Simplified WebRTC peer-to-peer connections
- **qrcode.vue3**: QR code generation for device pairing
- **pinia**: State management for devices and transfers
- **@vueuse/core**: Useful Vue composition utilities

---

## Project Structure

```
local-share-app/
├── app/
│   ├── components/
│   │   ├── DeviceList.vue           # Display available devices
│   │   ├── FileUploader.vue         # File selection and upload UI
│   │   ├── TransferProgress.vue     # Transfer progress bars
│   │   └── QRCodeDisplay.vue        # QR code for device pairing
│   ├── composables/
│   │   ├── useWebRTC.ts             # WebRTC connection management
│   │   ├── useFileTransfer.ts       # File chunking and transfer logic
│   │   ├── useDeviceDiscovery.ts    # Device discovery via WebSocket
│   │   └── useP2P.ts                # Peer-to-peer coordination
│   ├── layouts/
│   │   └── default.vue              # Main app layout
│   ├── pages/
│   │   ├── index.vue                # Main page
│   │   ├── send.vue                 # Send files page
│   │   └── receive.vue              # Receive files page
│   ├── stores/
│   │   ├── devices.ts               # Device state management
│   │   └── transfers.ts             # Transfer state management
│   ├── types/
│   │   └── index.ts                 # TypeScript interfaces
│   └── app.vue
├── server/
│   ├── api/
│   │   ├── devices.ts               # Device API endpoints
│   │   └── transfer.ts              # Transfer API endpoints
│   ├── routes/
│   │   └── ws.ts                    # WebSocket handler
│   ├── utils/
│   │   ├── discovery.ts             # Device discovery utilities
│   │   └── signaling.ts             # WebRTC signaling utilities
│   └── plugins/
│       └── socket.ts                # Socket.io server setup
├── public/
│   └── favicon.ico
├── nuxt.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Configuration

### nuxt.config.ts
```typescript
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/tailwindcss' // optional
  ],

  nitro: {
    experimental: {
      websocket: true // Enable WebSocket support in Nitro
    }
  },

  vite: {
    server: {
      https: false, // Set to true with certificates for production
      host: '0.0.0.0', // Allow local network access
      port: 3000
    }
  },

  runtimeConfig: {
    public: {
      wsUrl: process.env.WS_URL || 'ws://localhost:3000',
      signalingServer: process.env.SIGNALING_SERVER || 'http://localhost:3000'
    }
  },

  typescript: {
    strict: true,
    typeCheck: true
  }
})
```

---

## Implementation Details

### 1. TypeScript Interfaces (`app/types/index.ts`)

```typescript
export interface Device {
  id: string
  name: string
  platform: string
  ip?: string
  timestamp: number
  peerId?: string
}

export interface Transfer {
  id: string
  fileName: string
  fileSize: number
  progress: number
  status: 'pending' | 'sending' | 'receiving' | 'completed' | 'failed'
  speed?: number
  fromDevice?: string
  toDevice?: string
  startTime?: number
  endTime?: number
}

export interface FileMetadata {
  name: string
  size: number
  type: string
  lastModified: number
}

export interface ChunkData {
  type: 'file-meta' | 'file-chunk' | 'file-complete'
  transferId?: string
  data?: ArrayBuffer
  metadata?: FileMetadata
  chunkIndex?: number
  totalChunks?: number
}

export interface SignalingMessage {
  type: 'announce' | 'signal' | 'peer-joined' | 'peer-left' | 'offer' | 'answer' | 'ice-candidate'
  deviceInfo?: Device
  peerId?: string
  signal?: any
  targetPeer?: string
}
```

### 2. Server WebSocket Handler (`server/routes/ws.ts`)

```typescript
export default defineWebSocketHandler({
  open(peer) {
    console.log('[WebSocket] Client connected:', peer.id)
    peer.subscribe('discovery')
    
    // Send existing peers to new peer
    peer.send(JSON.stringify({
      type: 'init',
      peerId: peer.id
    }))
  },

  message(peer, message) {
    try {
      const data = message.text()
      const parsed: SignalingMessage = JSON.parse(data)
      
      console.log('[WebSocket] Message received:', parsed.type)
      
      switch (parsed.type) {
        case 'announce':
          // Broadcast new device to all peers
          peer.publish('discovery', JSON.stringify({
            type: 'peer-joined',
            deviceInfo: {
              ...parsed.deviceInfo,
              peerId: peer.id
            }
          }))
          break
          
        case 'signal':
          // Forward WebRTC signaling messages to specific peer
          if (parsed.targetPeer) {
            peer.send(JSON.stringify({
              type: 'signal',
              signal: parsed.signal,
              fromPeer: peer.id
            }))
          }
          break
          
        case 'offer':
        case 'answer':
        case 'ice-candidate':
          // Forward WebRTC signaling
          peer.publish('discovery', JSON.stringify(parsed))
          break
      }
    } catch (error) {
      console.error('[WebSocket] Error handling message:', error)
    }
  },

  close(peer, event) {
    console.log('[WebSocket] Client disconnected:', peer.id)
    
    // Notify other peers
    peer.publish('discovery', JSON.stringify({
      type: 'peer-left',
      peerId: peer.id
    }))
  },

  error(peer, error) {
    console.error('[WebSocket] Error:', error)
  }
})
```

### 3. Device Discovery Composable (`app/composables/useDeviceDiscovery.ts`)

```typescript
export const useDeviceDiscovery = () => {
  const devices = ref<Device[]>([])
  const localDevice = ref<Device | null>(null)
  const socket = ref<WebSocket | null>(null)
  const isConnected = ref(false)

  const generateDeviceId = (): string => {
    return `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const getDeviceName = (): string => {
    // Try to get hostname or generate a friendly name
    return localStorage.getItem('deviceName') || `Device-${Math.floor(Math.random() * 1000)}`
  }

  const getPlatform = (): string => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('win')) return 'Windows'
    if (userAgent.includes('mac')) return 'macOS'
    if (userAgent.includes('linux')) return 'Linux'
    if (userAgent.includes('android')) return 'Android'
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'iOS'
    return 'Unknown'
  }

  const initDevice = () => {
    localDevice.value = {
      id: generateDeviceId(),
      name: getDeviceName(),
      platform: getPlatform(),
      timestamp: Date.now()
    }
    
    // Save to localStorage for persistence
    localStorage.setItem('deviceId', localDevice.value.id)
  }

  const connect = () => {
    const config = useRuntimeConfig()
    const wsUrl = config.public.wsUrl.replace('http', 'ws')
    
    socket.value = new WebSocket(`${wsUrl}/ws`)
    
    socket.value.onopen = () => {
      console.log('[Discovery] Connected to signaling server')
      isConnected.value = true
      announce()
    }
    
    socket.value.onmessage = (event) => {
      try {
        const data: SignalingMessage = JSON.parse(event.data)
        
        switch (data.type) {
          case 'init':
            if (localDevice.value) {
              localDevice.value.peerId = data.peerId
            }
            break
            
          case 'peer-joined':
            if (data.deviceInfo && data.deviceInfo.id !== localDevice.value?.id) {
              addDevice(data.deviceInfo)
            }
            break
            
          case 'peer-left':
            if (data.peerId) {
              removeDevice(data.peerId)
            }
            break
        }
      } catch (error) {
        console.error('[Discovery] Error parsing message:', error)
      }
    }
    
    socket.value.onerror = (error) => {
      console.error('[Discovery] WebSocket error:', error)
      isConnected.value = false
    }
    
    socket.value.onclose = () => {
      console.log('[Discovery] Disconnected from signaling server')
      isConnected.value = false
      
      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (!isConnected.value) {
          connect()
        }
      }, 5000)
    }
  }

  const announce = () => {
    if (socket.value?.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify({
        type: 'announce',
        deviceInfo: localDevice.value
      }))
    }
  }

  const addDevice = (device: Device) => {
    const existingIndex = devices.value.findIndex(d => d.id === device.id)
    if (existingIndex >= 0) {
      devices.value[existingIndex] = device
    } else {
      devices.value.push(device)
    }
  }

  const removeDevice = (peerId: string) => {
    devices.value = devices.value.filter(d => d.peerId !== peerId)
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
    isConnected.value = false
  }

  return {
    devices,
    localDevice,
    isConnected,
    connect,
    disconnect,
    initDevice,
    announce
  }
}
```

### 4. WebRTC Composable (`app/composables/useWebRTC.ts`)

```typescript
import Peer from 'peerjs'

export const useWebRTC = () => {
  const peer = ref<Peer | null>(null)
  const connections = ref<Map<string, any>>(new Map())
  const localPeerId = ref<string>('')

  const initPeer = (deviceId?: string) => {
    return new Promise((resolve, reject) => {
      try {
        peer.value = new Peer(deviceId || undefined, {
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          },
          debug: 2 // Enable debug logging
        })

        peer.value.on('open', (id) => {
          console.log('[WebRTC] Peer initialized with ID:', id)
          localPeerId.value = id
          resolve(id)
        })

        peer.value.on('connection', (conn) => {
          console.log('[WebRTC] Incoming connection from:', conn.peer)
          handleConnection(conn)
        })

        peer.value.on('error', (error) => {
          console.error('[WebRTC] Peer error:', error)
          reject(error)
        })

        peer.value.on('disconnected', () => {
          console.log('[WebRTC] Peer disconnected, attempting reconnect...')
          peer.value?.reconnect()
        })
      } catch (error) {
        console.error('[WebRTC] Failed to initialize peer:', error)
        reject(error)
      }
    })
  }

  const connectToPeer = (peerId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!peer.value) {
        reject(new Error('Peer not initialized'))
        return
      }

      console.log('[WebRTC] Connecting to peer:', peerId)

      const conn = peer.value.connect(peerId, {
        reliable: true,
        serialization: 'binary'
      })
      
      conn.on('open', () => {
        console.log('[WebRTC] Connection opened with', conn.peer)
        handleConnection(conn)
        resolve(conn)
      })

      conn.on('error', (error) => {
        console.error('[WebRTC] Connection error:', error)
        reject(error)
      })
    })
  }

  const handleConnection = (conn: any) => {
    connections.value.set(conn.peer, conn)

    conn.on('data', (data: any) => {
      // This will be handled by useFileTransfer
      console.log('[WebRTC] Data received from', conn.peer)
    })

    conn.on('close', () => {
      console.log('[WebRTC] Connection closed with', conn.peer)
      connections.value.delete(conn.peer)
    })

    conn.on('error', (error: any) => {
      console.error('[WebRTC] Connection error with', conn.peer, error)
      connections.value.delete(conn.peer)
    })
  }

  const sendData = (peerId: string, data: any) => {
    const conn = connections.value.get(peerId)
    if (conn && conn.open) {
      conn.send(data)
      return true
    }
    console.warn('[WebRTC] No open connection to', peerId)
    return false
  }

  const closeConnection = (peerId: string) => {
    const conn = connections.value.get(peerId)
    if (conn) {
      conn.close()
      connections.value.delete(peerId)
    }
  }

  const destroy = () => {
    connections.value.forEach(conn => conn.close())
    connections.value.clear()
    peer.value?.destroy()
    peer.value = null
  }

  return {
    peer,
    connections,
    localPeerId,
    initPeer,
    connectToPeer,
    sendData,
    closeConnection,
    destroy
  }
}
```

### 5. File Transfer Composable (`app/composables/useFileTransfer.ts`)

```typescript
export const useFileTransfer = () => {
  const transfers = ref<Transfer[]>([])
  const CHUNK_SIZE = 64 * 1024 // 64KB chunks

  const generateTransferId = (): string => {
    return `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const sendFile = async (file: File, connection: any): Promise<string> => {
    const transferId = generateTransferId()
    
    const transfer: Transfer = {
      id: transferId,
      fileName: file.name,
      fileSize: file.size,
      progress: 0,
      status: 'sending',
      startTime: Date.now()
    }
    
    transfers.value.push(transfer)

    try {
      // Send file metadata
      connection.send(JSON.stringify({
        type: 'file-meta',
        transferId,
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }
      }))

      // Wait a bit for metadata to be processed
      await new Promise(resolve => setTimeout(resolve, 100))

      // Calculate total chunks
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
      let chunkIndex = 0

      // Send file in chunks
      for (let offset = 0; offset < file.size; offset += CHUNK_SIZE) {
        const chunk = file.slice(offset, offset + CHUNK_SIZE)
        const arrayBuffer = await chunk.arrayBuffer()

        // Send chunk with metadata
        connection.send(JSON.stringify({
          type: 'file-chunk',
          transferId,
          chunkIndex,
          totalChunks
        }))
        
        // Send actual chunk data
        connection.send(arrayBuffer)

        chunkIndex++
        transfer.progress = (offset / file.size) * 100

        // Small delay to prevent overwhelming the connection
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      // Send completion message
      connection.send(JSON.stringify({
        type: 'file-complete',
        transferId
      }))

      transfer.status = 'completed'
      transfer.endTime = Date.now()
      transfer.progress = 100

      console.log(`[FileTransfer] File sent successfully: ${file.name}`)
      
      return transferId
    } catch (error) {
      console.error('[FileTransfer] Error sending file:', error)
      transfer.status = 'failed'
      throw error
    }
  }

  const receiveFile = (connection: any) => {
    let currentTransfer: {
      id: string
      chunks: ArrayBuffer[]
      metadata: FileMetadata | null
      receivedChunks: number
      totalChunks: number
    } | null = null

    connection.on('data', async (data: any) => {
      try {
        // Try to parse as JSON (metadata/control messages)
        if (typeof data === 'string') {
          const message = JSON.parse(data)

          if (message.type === 'file-meta') {
            // Initialize new transfer
            currentTransfer = {
              id: message.transferId,
              chunks: [],
              metadata: message.metadata,
              receivedChunks: 0,
              totalChunks: 0
            }

            const transfer: Transfer = {
              id: message.transferId,
              fileName: message.metadata.name,
              fileSize: message.metadata.size,
              progress: 0,
              status: 'receiving',
              startTime: Date.now()
            }

            transfers.value.push(transfer)
            console.log(`[FileTransfer] Receiving file: ${message.metadata.name}`)
          }

          if (message.type === 'file-chunk' && currentTransfer) {
            currentTransfer.totalChunks = message.totalChunks
          }

          if (message.type === 'file-complete' && currentTransfer) {
            // Assemble and download file
            const blob = new Blob(currentTransfer.chunks, { 
              type: currentTransfer.metadata?.type || 'application/octet-stream' 
            })
            
            downloadFile(blob, currentTransfer.metadata?.name || 'download')

            // Update transfer status
            const transfer = transfers.value.find(t => t.id === message.transferId)
            if (transfer) {
              transfer.status = 'completed'
              transfer.progress = 100
              transfer.endTime = Date.now()
            }

            console.log(`[FileTransfer] File received successfully: ${currentTransfer.metadata?.name}`)
            currentTransfer = null
          }
        } 
        // Binary data (file chunk)
        else if (data instanceof ArrayBuffer && currentTransfer) {
          currentTransfer.chunks.push(data)
          currentTransfer.receivedChunks++

          // Update progress
          const transfer = transfers.value.find(t => t.id === currentTransfer?.id)
          if (transfer && currentTransfer.totalChunks > 0) {
            transfer.progress = (currentTransfer.receivedChunks / currentTransfer.totalChunks) * 100
          }
        }
      } catch (error) {
        console.error('[FileTransfer] Error receiving data:', error)
      }
    })
  }

  const downloadFile = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearTransfer = (transferId: string) => {
    transfers.value = transfers.value.filter(t => t.id !== transferId)
  }

  const clearCompleted = () => {
    transfers.value = transfers.value.filter(t => t.status !== 'completed')
  }

  return {
    transfers,
    sendFile,
    receiveFile,
    clearTransfer,
    clearCompleted
  }
}
```

### 6. Device Store (`app/stores/devices.ts`)

```typescript
import { defineStore } from 'pinia'

export const useDevicesStore = defineStore('devices', {
  state: () => ({
    localDevice: null as Device | null,
    discoveredDevices: [] as Device[],
    selectedDevice: null as Device | null,
    isDiscovering: false
  }),

  getters: {
    deviceCount: (state) => state.discoveredDevices.length,
    
    hasSelectedDevice: (state) => state.selectedDevice !== null,
    
    availableDevices: (state) => {
      return state.discoveredDevices.filter(
        device => device.id !== state.localDevice?.id
      )
    }
  },

  actions: {
    setLocalDevice(device: Device) {
      this.localDevice = device
    },

    addDiscoveredDevice(device: Device) {
      const existingIndex = this.discoveredDevices.findIndex(
        d => d.id === device.id
      )
      
      if (existingIndex >= 0) {
        this.discoveredDevices[existingIndex] = device
      } else {
        this.discoveredDevices.push(device)
      }
    },

    removeDiscoveredDevice(deviceId: string) {
      this.discoveredDevices = this.discoveredDevices.filter(
        d => d.id !== deviceId
      )
      
      if (this.selectedDevice?.id === deviceId) {
        this.selectedDevice = null
      }
    },

    selectDevice(device: Device) {
      this.selectedDevice = device
    },

    clearSelection() {
      this.selectedDevice = null
    },

    setDiscovering(isDiscovering: boolean) {
      this.isDiscovering = isDiscovering
    },

    clearDevices() {
      this.discoveredDevices = []
      this.selectedDevice = null
    }
  }
})
```

### 7. Transfers Store (`app/stores/transfers.ts`)

```typescript
import { defineStore } from 'pinia'

export const useTransfersStore = defineStore('transfers', {
  state: () => ({
    activeTransfers: [] as Transfer[],
    completedTransfers: [] as Transfer[],
    failedTransfers: [] as Transfer[]
  }),

  getters: {
    allTransfers: (state) => [
      ...state.activeTransfers,
      ...state.completedTransfers,
      ...state.failedTransfers
    ],

    activeCount: (state) => state.activeTransfers.length,
    
    completedCount: (state) => state.completedTransfers.length,
    
    totalProgress: (state) => {
      if (state.activeTransfers.length === 0) return 0
      
      const total = state.activeTransfers.reduce(
        (sum, t) => sum + t.progress, 
        0
      )
      return total / state.activeTransfers.length
    }
  },

  actions: {
    addTransfer(transfer: Transfer) {
      this.activeTransfers.push(transfer)
    },

    updateTransfer(transferId: string, updates: Partial<Transfer>) {
      const transfer = this.activeTransfers.find(t => t.id === transferId)
      if (transfer) {
        Object.assign(transfer, updates)
        
        // Move to completed/failed if status changed
        if (updates.status === 'completed') {
          this.moveToCompleted(transferId)
        } else if (updates.status === 'failed') {
          this.moveToFailed(transferId)
        }
      }
    },

    moveToCompleted(transferId: string) {
      const index = this.activeTransfers.findIndex(t => t.id === transferId)
      if (index >= 0) {
        const [transfer] = this.activeTransfers.splice(index, 1)
        this.completedTransfers.push(transfer)
      }
    },

    moveToFailed(transferId: string) {
      const index = this.activeTransfers.findIndex(t => t.id === transferId)
      if (index >= 0) {
        const [transfer] = this.activeTransfers.splice(index, 1)
        this.failedTransfers.push(transfer)
      }
    },

    removeTransfer(transferId: string) {
      this.activeTransfers = this.activeTransfers.filter(t => t.id !== transferId)
      this.completedTransfers = this.completedTransfers.filter(t => t.id !== transferId)
      this.failedTransfers = this.failedTransfers.filter(t => t.id !== transferId)
    },

    clearCompleted() {
      this.completedTransfers = []
    },

    clearAll() {
      this.activeTransfers = []
      this.completedTransfers = []
      this.failedTransfers = []
    }
  }
})
```

---

## Component Examples

### DeviceList Component (`app/components/DeviceList.vue`)

```vue
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
        :class="{ selected: selectedDevice?.id === device.id }"
        @click="$emit('select', device)"
      >
        <div class="device-icon">
          <span>{{ getPlatformIcon(device.platform) }}</span>
        </div>
        <div class="device-info">
          <h3>{{ device.name }}</h3>
          <p class="platform">{{ device.platform }}</p>
          <p v-if="device.ip" class="ip">{{ device.ip }}</p>
        </div>
        <button
          v-if="selectedDevice?.id === device.id"
          class="connect-btn"
          @click.stop="$emit('connect', device)"
        >
          Connect
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  devices: Device[]
  selectedDevice?: Device | null
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.device-card.selected {
  border-color: #4CAF50;
  background-color: #f1f8f4;
}

.device-icon {
  font-size: 2rem;
  text-align: center;
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

.connect-btn {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.connect-btn:hover {
  background-color: #45a049;
}
</style>
```

### FileUploader Component (`app/components/FileUploader.vue`)

```vue
<template>
  <div class="file-uploader">
    <div
      class="drop-zone"
      :class="{ 'drag-over': isDragging, disabled }"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @click="!disabled && fileInput?.click()"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        :disabled="disabled"
        @change="handleFileSelect"
        style="display: none"
      >
      
      <div class="drop-zone-content">
        <div class="icon">📁</div>
        <p class="primary">{{ disabled ? 'Select a device first' : 'Click or drag files here' }}</p>
        <p class="secondary">{{ disabled ? '' : 'Multiple files supported' }}</p>
      </div>
    </div>

    <div v-if="selectedFiles.length > 0" class="selected-files">
      <h4>Selected Files ({{ selectedFiles.length }})</h4>
      <div class="file-list">
        <div
          v-for="(file, index) in selectedFiles"
          :key="index"
          class="file-item"
        >
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
          <button class="remove-btn" @click="removeFile(index)">×</button>
        </div>
      </div>
      <div class="actions">
        <button class="send-btn" @click="sendFiles">
          Send {{ selectedFiles.length }} file(s)
        </button>
        <button class="clear-btn" @click="clearFiles">Clear</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  disabled?: boolean
}>()

const emit = defineEmits<{
  filesSelected: [files: File[]]
}>()

const fileInput = ref<HTMLInputElement>()
const selectedFiles = ref<File[]>([])
const isDragging = ref(false)

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  if (props.disabled) return

  const files = Array.from(e.dataTransfer?.files || [])
  selectedFiles.value.push(...files)
}

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  selectedFiles.value.push(...files)
  
  // Reset input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const clearFiles = () => {
  selectedFiles.value = []
}

const sendFiles = () => {
  if (selectedFiles.value.length > 0) {
    emit('filesSelected', [...selectedFiles.value])
    selectedFiles.value = []
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
.file-uploader {
  padding: 1rem;
}

.drop-zone {
  border: 3px dashed #ccc;
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fafafa;
}

.drop-zone:hover:not(.disabled) {
  border-color: #4CAF50;
  background-color: #f1f8f4;
}

.drop-zone.drag-over {
  border-color: #4CAF50;
  background-color: #e8f5e9;
  transform: scale(1.02);
}

.drop-zone.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.drop-zone-content .icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.drop-zone-content .primary {
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0.5rem 0;
}

.drop-zone-content .secondary {
  color: #666;
  margin: 0;
}

.selected-files {
  margin-top: 1.5rem;
}

.selected-files h4 {
  margin-bottom: 1rem;
}

.file-list {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.file-item:last-child {
  border-bottom: none;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: #666;
  font-size: 0.9rem;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  color: #f44336;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.send-btn,
.clear-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.send-btn {
  background-color: #4CAF50;
  color: white;
  flex: 1;
}

.send-btn:hover {
  background-color: #45a049;
}

.clear-btn {
  background-color: #f5f5f5;
  color: #333;
}

.clear-btn:hover {
  background-color: #e0e0e0;
}
</style>
```

### TransferProgress Component (`app/components/TransferProgress.vue`)

```vue
<template>
  <div v-if="transfers.length > 0" class="transfer-progress">
    <h3>Transfers ({{ activeCount }} active)</h3>
    
    <div class="transfers-list">
      <div
        v-for="transfer in transfers"
        :key="transfer.id"
        class="transfer-item"
        :class="transfer.status"
      >
        <div class="transfer-header">
          <span class="file-name">{{ transfer.fileName }}</span>
          <span class="status-badge" :class="transfer.status">
            {{ getStatusText(transfer.status) }}
          </span>
        </div>
        
        <div class="transfer-details">
          <span class="file-size">{{ formatFileSize(transfer.fileSize) }}</span>
          <span v-if="transfer.speed" class="speed">
            {{ formatSpeed(transfer.speed) }}
          </span>
        </div>

        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: transfer.progress + '%' }"
            :class="transfer.status"
          ></div>
        </div>

        <div class="progress-text">
          {{ Math.round(transfer.progress) }}%
        </div>
      </div>
    </div>

    <button
      v-if="completedCount > 0"
      class="clear-btn"
      @click="$emit('clearCompleted')"
    >
      Clear Completed ({{ completedCount }})
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  transfers: Transfer[]
}>()

defineEmits<{
  clearCompleted: []
}>()

const activeCount = computed(() => 
  transfers.value.filter(t => 
    t.status === 'sending' || t.status === 'receiving'
  ).length
)

const completedCount = computed(() =>
  transfers.value.filter(t => t.status === 'completed').length
)

const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    sending: 'Sending',
    receiving: 'Receiving',
    completed: 'Completed',
    failed: 'Failed'
  }
  return statusMap[status] || status
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const formatSpeed = (bytesPerSecond: number): string => {
  return formatFileSize(bytesPerSecond) + '/s'
}
</script>

<style scoped>
.transfer-progress {
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-top: 1.5rem;
}

.transfer-progress h3 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.transfers-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.transfer-item {
  background: white;
  border-radius: 6px;
  padding: 1rem;
  border-left: 4px solid #ccc;
}

.transfer-item.sending {
  border-left-color: #2196F3;
}

.transfer-item.receiving {
  border-left-color: #FF9800;
}

.transfer-item.completed {
  border-left-color: #4CAF50;
}

.transfer-item.failed {
  border-left-color: #f44336;
}

.transfer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.file-name {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  margin-right: 1rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.sending {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-badge.receiving {
  background-color: #fff3e0;
  color: #f57c00;
}

.status-badge.completed {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status-badge.failed {
  background-color: #ffebee;
  color: #d32f2f;
}

.transfer-details {
  display: flex;
  gap: 1rem;
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background-color: #4CAF50;
  transition: width 0.3s ease;
}

.progress-fill.sending {
  background-color: #2196F3;
}

.progress-fill.receiving {
  background-color: #FF9800;
}

.progress-fill.failed {
  background-color: #f44336;
}

.progress-text {
  text-align: right;
  font-size: 0.9rem;
  color: #666;
}

.clear-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: 100%;
}

.clear-btn:hover {
  background-color: #e0e0e0;
}
</style>
```

### Main Page (`app/pages/index.vue`)

```vue
<template>
  <div class="container">
    <header class="app-header">
      <h1>🚀 Local Share</h1>
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
            <span class="dot"></span> Connected
          </div>
          <div v-else class="status-indicator disconnected">
            <span class="dot"></span> Disconnected
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
const { devices, localDevice, isConnected, connect, initDevice } = useDeviceDiscovery()
const { peer, localPeerId, initPeer, connectToPeer, connections } = useWebRTC()
const { transfers, sendFile, receiveFile, clearCompleted } = useFileTransfer()

const selectedDevice = ref<Device | null>(null)
const connectedPeer = ref<string | null>(null)

onMounted(async () => {
  // Initialize device info
  initDevice()
  
  // Initialize WebRTC peer
  await initPeer(localDevice.value?.id)
  
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
  if (peer.value) {
    peer.value.destroy()
  }
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
  0%, 100% {
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
```

---

## Step-by-Step Build Instructions

### Phase 1: Setup (Start Here)
1. Initialize Nuxt 4 project
2. Install all dependencies
3. Configure `nuxt.config.ts` with WebSocket support
4. Create project structure (folders and empty files)

### Phase 2: Core Infrastructure
5. Create TypeScript interfaces in `app/types/index.ts`
6. Implement WebSocket handler in `server/routes/ws.ts`
7. Create device discovery composable
8. Create WebRTC composable

### Phase 3: File Transfer Logic
9. Implement file transfer composable with chunking
10. Create Pinia stores for devices and transfers
11. Add error handling and reconnection logic

### Phase 4: UI Components
12. Build DeviceList component
13. Build FileUploader component with drag-and-drop
14. Build TransferProgress component
15. Create QRCodeDisplay component (optional)

### Phase 5: Main Application
16. Implement main page (`index.vue`)
17. Wire up all composables and components
18. Add state management integration

### Phase 6: Testing & Refinement
19. Test on localhost
20. Test with multiple devices on same network
21. Add error handling and edge cases
22. Optimize performance for large files

---

## Key Features to Implement

### Essential Features
- ✅ Device discovery on local network
- ✅ Peer-to-peer WebRTC connections
- ✅ File transfer with chunking
- ✅ Progress tracking
- ✅ Multiple file support
- ✅ Drag and drop interface

### Advanced Features (Optional)
- 🔄 Resume interrupted transfers
- 🔒 End-to-end encryption
- 📱 QR code pairing
- 💾 Transfer history
- 📁 Folder transfer support
- 🎨 Themes/customization
- 🌐 PWA support

---

## Testing Guide

### Local Testing
```bash
# Terminal 1: Start dev server
npm run dev

# Access from same machine
# Open: http://localhost:3000
```

### Network Testing
```bash
# Start server with network access
npm run dev -- --host 0.0.0.0

# Find your local IP
# Windows: ipconfig
# Mac/Linux: ifconfig or ip addr

# Access from other devices on same network
# Open: http://[YOUR_LOCAL_IP]:3000
```

### Testing Checklist
- [ ] Can discover devices on same network
- [ ] Can establish WebRTC connection
- [ ] Can send single file
- [ ] Can send multiple files
- [ ] Progress updates correctly
- [ ] Large files transfer successfully (test with 100MB+)
- [ ] Handles connection drops gracefully
- [ ] Works across different platforms (Windows/Mac/Linux/Mobile)

---

## Troubleshooting

### WebSocket Connection Issues
- Ensure port 3000 is not blocked by firewall
- Check that WebSocket is enabled in `nuxt.config.ts`
- Verify server is accessible from network

### WebRTC Connection Issues
- STUN server may be blocked (try alternative STUN servers)
- Check browser console for ICE candidate errors
- Ensure devices are on same local network

### File Transfer Issues
- Large files may need larger chunk sizes
- Check browser memory limits
- Ensure connection stays alive during transfer

### Device Discovery Issues
- Devices must be on same subnet
- Check firewall settings
- Verify WebSocket server is running

---

## Performance Optimization

### For Large Files
```typescript
// Increase chunk size
const CHUNK_SIZE = 256 * 1024 // 256KB

// Add compression (optional)
import pako from 'pako'
const compressed = pako.deflate(arrayBuffer)
```

### For Multiple Files
```typescript
// Implement queue system
// Send files sequentially instead of parallel
```

### For Slow Networks
```typescript
// Add adaptive chunk sizing
// Reduce chunk size on slow connections
```

---

## Deployment Notes

### Production Build
```bash
npm run build
npm run preview
```

### Environment Variables
```env
# .env
WS_URL=ws://your-server-url
SIGNALING_SERVER=http://your-server-url
```

### HTTPS Configuration
For production, you'll need HTTPS:
```typescript
// nuxt.config.ts
vite: {
  server: {
    https: {
      key: fs.readFileSync('path/to/key.pem'),
      cert: fs.readFileSync('path/to/cert.pem')
    }
  }
}
```

---

## Additional Resources

- [Nuxt 4 Documentation](https://nuxt.com)
- [PeerJS Documentation](https://peerjs.com/docs)
- [WebRTC API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

## Next Steps

1. Start with Phase 1 setup
2. Implement core infrastructure (Phase 2)
3. Build out file transfer logic (Phase 3)
4. Create UI components (Phase 4)
5. Integrate everything (Phase 5)
6. Test thoroughly (Phase 6)
7. Add advanced features as needed

---

**Good luck building your Local Share app! 🚀**
