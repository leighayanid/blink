import { ref } from 'vue'
import type { Device, SignalingMessage } from '@blink/types'

// ---------------------------------------------------------------------------
// Module-level singleton state — shared across all calls to useDeviceDiscovery
// ---------------------------------------------------------------------------
const devices = ref<Device[]>([])
const localDevice = ref<Device | null>(null)
const socket = ref<WebSocket | null>(null)
const isConnected = ref(false)
const lastError = ref<string | null>(null)
const shouldReconnect = ref(true)
let heartbeatInterval: ReturnType<typeof setInterval> | null = null
let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let reconnectAttempts = 0
const HEARTBEAT_INTERVAL_MS = 30_000
const RECONNECT_BASE_DELAY_MS = 5_000
const RECONNECT_MAX_DELAY_MS = 60_000

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

const stopHeartbeat = () => {
  if (!heartbeatInterval) return
  clearInterval(heartbeatInterval)
  heartbeatInterval = null
}

const startHeartbeat = () => {
  stopHeartbeat()
  heartbeatInterval = setInterval(() => {
    if (socket.value?.readyState !== WebSocket.OPEN) return
    socket.value.send(JSON.stringify({ type: 'heartbeat' }))
  }, HEARTBEAT_INTERVAL_MS)
}

const connect = () => {
  shouldReconnect.value = true

  const config = useRuntimeConfig()
  const roomId = (config.public.signalingRoom as string) || 'local'
  const accessToken = (config.public.signalingAccessToken as string) || ''
  const query = new URLSearchParams({ room: roomId })
  if (accessToken) query.set('token', accessToken)

  let wsUrl: string
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    wsUrl = `${protocol}//${window.location.host}/ws?${query.toString()}`
  } else {
    const configuredWsUrl = new URL(config.public.wsUrl as string, 'ws://localhost')
    configuredWsUrl.searchParams.set('room', roomId)
    if (accessToken) configuredWsUrl.searchParams.set('token', accessToken)
    wsUrl = configuredWsUrl.toString()
  }

  console.log('[Discovery] Connecting to WebSocket:', wsUrl)
  socket.value = new WebSocket(wsUrl)

  socket.value.onopen = () => {
    console.log('[Discovery] Connected to signaling server')
    isConnected.value = true
    lastError.value = null
    reconnectAttempts = 0
    startHeartbeat()
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

        case 'error':
          // The server rejects (capacity, bad token, rate limit) by sending
          // this and then closing, so keep the reason for the UI — otherwise
          // the page looks healthy while discovery silently never works.
          lastError.value = data.reason || 'Unknown error'
          console.warn('[Discovery] Signaling server error:', lastError.value)
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
    stopHeartbeat()

    if (shouldReconnect.value) {
      // Back off on repeated failures. A server that is rejecting us outright
      // (at capacity, bad token) would otherwise be hammered every 5s by every
      // client, which keeps it at capacity.
      const delay = Math.min(
        RECONNECT_BASE_DELAY_MS * 2 ** reconnectAttempts,
        RECONNECT_MAX_DELAY_MS
      )
      reconnectAttempts++
      console.log(`[Discovery] Scheduling reconnect in ${delay}ms...`)

      if (reconnectTimer) clearTimeout(reconnectTimer)
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null
        if (!isConnected.value && shouldReconnect.value) {
          connect()
        }
      }, delay)
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

  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  reconnectAttempts = 0

  if (socket.value) {
    socket.value.close()
    socket.value = null
  }

  stopHeartbeat()
  isConnected.value = false
  lastError.value = null
  devices.value = []
  localDevice.value = null
}

export const useDeviceDiscovery = () => {
  return {
    devices,
    localDevice,
    isConnected,
    lastError,
    connect,
    disconnect,
    initDevice,
    setLocalPeerId,
    announce
  }
}
