import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useDevicesStore } from '../../../app/stores/devices'
import type { Device } from '@blink/types'

const makeDevice = (overrides: Partial<Device> = {}): Device => ({
  id: `dev-${Math.random().toString(36).slice(2)}`,
  name: 'Test Device',
  platform: 'macOS',
  timestamp: Date.now(),
  ...overrides,
})

describe('useDevicesStore', () => {
  let store: ReturnType<typeof useDevicesStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useDevicesStore()
  })

  // ---------------------------------------------------------------------------
  // setLocalDevice
  // ---------------------------------------------------------------------------
  describe('setLocalDevice', () => {
    it('sets the local device', () => {
      const d = makeDevice({ name: 'My Device' })
      store.setLocalDevice(d)
      expect(store.localDevice).toEqual(d)
    })
  })

  // ---------------------------------------------------------------------------
  // addDiscoveredDevice
  // ---------------------------------------------------------------------------
  describe('addDiscoveredDevice', () => {
    it('adds a new device', () => {
      store.addDiscoveredDevice(makeDevice({ id: 'd1' }))
      expect(store.discoveredDevices).toHaveLength(1)
    })

    it('updates existing device with same id', () => {
      store.addDiscoveredDevice(makeDevice({ id: 'd1', name: 'Old' }))
      store.addDiscoveredDevice(makeDevice({ id: 'd1', name: 'New' }))
      expect(store.discoveredDevices).toHaveLength(1)
      expect(store.discoveredDevices[0].name).toBe('New')
    })
  })

  // ---------------------------------------------------------------------------
  // removeDiscoveredDevice
  // ---------------------------------------------------------------------------
  describe('removeDiscoveredDevice', () => {
    it('removes a device by id', () => {
      store.addDiscoveredDevice(makeDevice({ id: 'd1' }))
      store.removeDiscoveredDevice('d1')
      expect(store.discoveredDevices).toHaveLength(0)
    })

    it('clears selectedDevice if removed', () => {
      const d = makeDevice({ id: 'sel' })
      store.addDiscoveredDevice(d)
      store.selectDevice(d)
      store.removeDiscoveredDevice('sel')
      expect(store.selectedDevice).toBeNull()
    })

    it('does not clear selectedDevice when a different device is removed', () => {
      const d1 = makeDevice({ id: 'd1' })
      const d2 = makeDevice({ id: 'd2' })
      store.addDiscoveredDevice(d1)
      store.addDiscoveredDevice(d2)
      store.selectDevice(d1)
      store.removeDiscoveredDevice('d2')
      expect(store.selectedDevice?.id).toBe('d1')
    })
  })

  // ---------------------------------------------------------------------------
  // selectDevice / clearSelection
  // ---------------------------------------------------------------------------
  describe('selectDevice / clearSelection', () => {
    it('selects a device', () => {
      const d = makeDevice({ id: 's1' })
      store.selectDevice(d)
      expect(store.selectedDevice).toEqual(d)
    })

    it('clears selection', () => {
      store.selectDevice(makeDevice())
      store.clearSelection()
      expect(store.selectedDevice).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // setDiscovering
  // ---------------------------------------------------------------------------
  describe('setDiscovering', () => {
    it('sets discovering flag', () => {
      expect(store.isDiscovering).toBe(false)
      store.setDiscovering(true)
      expect(store.isDiscovering).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // clearDevices
  // ---------------------------------------------------------------------------
  describe('clearDevices', () => {
    it('clears discovered devices and selection', () => {
      const d = makeDevice({ id: 'c1' })
      store.addDiscoveredDevice(d)
      store.selectDevice(d)
      store.clearDevices()
      expect(store.discoveredDevices).toHaveLength(0)
      expect(store.selectedDevice).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------
  describe('getters', () => {
    it('deviceCount returns discovered device count', () => {
      store.addDiscoveredDevice(makeDevice())
      store.addDiscoveredDevice(makeDevice())
      expect(store.deviceCount).toBe(2)
    })

    it('hasSelectedDevice is false by default', () => {
      expect(store.hasSelectedDevice).toBe(false)
    })

    it('hasSelectedDevice is true when a device is selected', () => {
      store.selectDevice(makeDevice())
      expect(store.hasSelectedDevice).toBe(true)
    })

    it('availableDevices excludes the local device', () => {
      const local = makeDevice({ id: 'local' })
      const remote = makeDevice({ id: 'remote' })
      store.setLocalDevice(local)
      store.addDiscoveredDevice(local)
      store.addDiscoveredDevice(remote)
      expect(store.availableDevices).toHaveLength(1)
      expect(store.availableDevices[0].id).toBe('remote')
    })

    it('availableDevices returns all when no local device set', () => {
      store.addDiscoveredDevice(makeDevice({ id: 'r1' }))
      store.addDiscoveredDevice(makeDevice({ id: 'r2' }))
      expect(store.availableDevices).toHaveLength(2)
    })
  })
})
