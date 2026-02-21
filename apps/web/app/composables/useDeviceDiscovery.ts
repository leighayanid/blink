import { ref } from 'vue'
import type { Device, SignalingMessage } from '@blink/types'

// ---------------------------------------------------------------------------
// Module-level singleton state — shared across all calls to useDeviceDiscovery
// ---------------------------------------------------------------------------
const devices = ref<Device[]>([])
const localDevice = ref<Device | null>(null)
const socket = ref<WebSocket | null>(null)
const isConnected = ref(false)
const shouldReconnect = ref(true)

const generateDeviceId = (): string => {
  // crypto.randomUUID() is available in browsers (secure context) and Node 18+
  return `device-${crypto.randomUUID()}`
}

const getDeviceName = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('deviceName') || `Device-${Math.floor(Math.random() * 1000)}`
  }
  return `Device-${Math.floor(Math.random() * 1000)}`
}

const getPlatform = (): string => {
  if (typeof window === 'undefined') return 'Server'
  const ua = navigator.userAgent.toLowerCase()
  // Check mobile platforms before desktop ones to avoid misclassification
  // (Android user-agents also contain 'linux'; iOS also contains 'mac')
  if (ua.includes('android')) return 'Android'
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS'
  if (ua.includes('win')) return 'Windows'
  if (ua.includes('mac')) return 'macOS'
  if (ua.includes('linux')) return 'Linux'
  return 'Unknown'
}

const initDevice = () => {
  // Reuse a persisted device ID so peers recognise the same browser across refreshes
  const savedId = typeof window !== 'undefined'
    ? (localStorage.getItem('deviceId') || null)
    : null

  const id = savedId || generateDeviceId()

  localDevice.value = {
    id,
    name: getDeviceName(),
    platform: getPlatform(),
    timestamp: Date.now()
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('deviceId', id)
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

const announce = () => {
  if (socket.value?.readyState === WebSocket.OPEN && localDevice.value?.peerId) {
    console.log('[Discovery] Announcing device:', {
      name: localDevice.value.name,
      id: localDevice.value.id,
      peerId: localDevice.value.peerId
    })
    socket.value.send(JSON.stringify({
      type: 'announce',
      deviceInfo: localDevice.value
    }))
  } else {
    console.warn('[Discovery] Cannot announce - socket not open or no peerId', {
      socketReady: socket.value?.readyState === WebSocket.OPEN,
      hasPeerId: !!localDevice.value?.peerId
    })
  }
}

const connect = () => {
  shouldReconnect.value = true

  let wsUrl: string
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    wsUrl = `${protocol}//${window.location.host}/ws`
  } else {
    const config = useRuntimeConfig()
    wsUrl = config.public.wsUrl as string
  }

  console.log('[Discovery] Connecting to WebSocket:', wsUrl)
  socket.value = new WebSocket(wsUrl)

  socket.value.onopen = () => {
    console.log('[Discovery] Connected to signaling server')
    isConnected.value = true
    if (localDevice.value?.peerId) {
      announce()
    } else {
      console.log('[Discovery] Waiting for peerId before announcing...')
    }
  }

  socket.value.onmessage = (event) => {
    try {
      const data: SignalingMessage = JSON.parse(event.data)
      console.log('[Discovery] Message received:', data.type, data)

      switch (data.type) {
        case 'init':
          console.log('[Discovery] Init received, local peerId already set:', localDevice.value?.peerId)
          break

        case 'peer-joined':
          if (data.deviceInfo && data.deviceInfo.id !== localDevice.value?.id) {
            addDevice(data.deviceInfo)
            console.log('[Discovery] Added device:', data.deviceInfo.name)
          }
          break

        case 'peer-left':
          if (data.peerId) {
            removeDevice(data.peerId)
            console.log('[Discovery] Removed device with peerId:', data.peerId)
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

    if (shouldReconnect.value) {
      console.log('[Discovery] Scheduling reconnect...')
      setTimeout(() => {
        if (!isConnected.value && shouldReconnect.value) {
          connect()
        }
      }, 5000)
    } else {
      console.log('[Discovery] Reconnect disabled, staying disconnected')
    }
  }
}

const setLocalPeerId = (peerId: string) => {
  if (localDevice.value) {
    localDevice.value.peerId = peerId
    console.log('[Discovery] Local peerId set:', peerId)
    if (socket.value?.readyState === WebSocket.OPEN) {
      announce()
    }
  }
}

const disconnect = () => {
  console.log('[Discovery] Intentional disconnect - disabling reconnect')
  shouldReconnect.value = false

  if (socket.value) {
    socket.value.close()
    socket.value = null
  }

  isConnected.value = false
  devices.value = []
  localDevice.value = null
}

export const useDeviceDiscovery = () => {
  return {
    devices,
    localDevice,
    isConnected,
    connect,
    disconnect,
    initDevice,
    setLocalPeerId,
    announce
  }
}
