import { ref } from 'vue'
import type { Device, SignalingMessage } from '../types'

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
    if (typeof window !== 'undefined') {
      return localStorage.getItem('deviceName') || `Device-${Math.floor(Math.random() * 1000)}`
    }
    return `Device-${Math.floor(Math.random() * 1000)}`
  }

  const getPlatform = (): string => {
    if (typeof window === 'undefined') {
      return 'Server'
    }
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
    if (typeof window !== 'undefined') {
      localStorage.setItem('deviceId', localDevice.value.id)
    }
  }

  const connect = () => {
    // Dynamically build WebSocket URL from current window location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host // This includes the IP and port
    const wsUrl = `${protocol}//${host}/ws`

    console.log('[Discovery] Connecting to WebSocket:', wsUrl)
    socket.value = new WebSocket(wsUrl)

    socket.value.onopen = () => {
      console.log('[Discovery] Connected to signaling server')
      isConnected.value = true
      // Only announce if we have a peerId set
      if (localDevice.value?.peerId) {
        console.log('[Discovery] Announcing with peerId:', localDevice.value.peerId)
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
            // Note: The 'init' message from server is no longer used to set peerId
            // The peerId is now set from PeerJS before connecting to WebSocket
            console.log('[Discovery] Init received, local peerId already set:', localDevice.value?.peerId)
            break

          case 'peer-joined':
            console.log('[Discovery] Peer joined:', data.deviceInfo)
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

      // Attempt to reconnect after 5 seconds
      setTimeout(() => {
        if (!isConnected.value) {
          connect()
        }
      }, 5000)
    }
  }

  const setLocalPeerId = (peerId: string) => {
    if (localDevice.value) {
      localDevice.value.peerId = peerId
      console.log('[Discovery] Local peerId set:', peerId)
      // If WebSocket is already connected, announce now
      if (socket.value?.readyState === WebSocket.OPEN) {
        console.log('[Discovery] WebSocket already open, announcing now with peerId:', peerId)
        announce()
      }
    }
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
    setLocalPeerId,
    announce
  }
}
