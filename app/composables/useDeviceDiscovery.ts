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
