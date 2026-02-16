import { defineStore } from 'pinia'
import type { Device } from '@blink/types'

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
