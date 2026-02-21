import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ---------------------------------------------------------------------------
// MockWebSocket
// ---------------------------------------------------------------------------
class MockWebSocket {
  static OPEN = 1
  static CONNECTING = 0
  static CLOSED = 3

  readyState = MockWebSocket.OPEN
  url: string
  onopen: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  send = vi.fn()
  close = vi.fn().mockImplementation(() => {
    this.readyState = MockWebSocket.CLOSED
  })

  constructor(url: string) {
    this.url = url
    MockWebSocket._instances.push(this)
  }

  simulateOpen() {
    this.onopen?.(new Event('open'))
  }
  simulateMessage(data: unknown) {
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) }))
  }
  simulateClose() {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.(new CloseEvent('close'))
  }

  static _instances: MockWebSocket[] = []
  static lastInstance(): MockWebSocket {
    return MockWebSocket._instances[MockWebSocket._instances.length - 1]
  }
  static reset() {
    MockWebSocket._instances = []
  }
}

vi.stubGlobal('WebSocket', MockWebSocket)

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useDeviceDiscovery', () => {
  let useDeviceDiscovery: typeof import('../../../app/composables/useDeviceDiscovery').useDeviceDiscovery

  beforeEach(async () => {
    MockWebSocket.reset()
    vi.useFakeTimers()
    vi.resetModules()
    vi.stubGlobal('WebSocket', MockWebSocket)
    const mod = await import('../../../app/composables/useDeviceDiscovery')
    useDeviceDiscovery = mod.useDeviceDiscovery
  })

  afterEach(() => {
    vi.useRealTimers()
    const { disconnect } = useDeviceDiscovery()
    disconnect()
  })

  // ---------------------------------------------------------------------------
  // initDevice
  // ---------------------------------------------------------------------------
  describe('initDevice', () => {
    it('creates a local device with id, name, platform, timestamp', () => {
      const { localDevice, initDevice } = useDeviceDiscovery()
      initDevice()
      expect(localDevice.value).not.toBeNull()
      expect(localDevice.value?.id).toMatch(/^device-/)
      expect(typeof localDevice.value?.name).toBe('string')
      expect(typeof localDevice.value?.platform).toBe('string')
      expect(typeof localDevice.value?.timestamp).toBe('number')
    })

    it('reuses saved deviceId from localStorage', () => {
      localStorage.setItem('deviceId', 'device-existing-123')
      const { localDevice, initDevice } = useDeviceDiscovery()
      initDevice()
      expect(localDevice.value?.id).toBe('device-existing-123')
    })

    it('generates a new deviceId when localStorage is empty and persists it', () => {
      const { localDevice, initDevice } = useDeviceDiscovery()
      initDevice()
      const id = localDevice.value?.id
      expect(id).toMatch(/^device-/)
      expect(localStorage.getItem('deviceId')).toBe(id)
    })

    it('uses stored deviceName from localStorage', () => {
      localStorage.setItem('deviceName', 'My Custom Device')
      const { localDevice, initDevice } = useDeviceDiscovery()
      initDevice()
      expect(localDevice.value?.name).toBe('My Custom Device')
    })
  })

  // ---------------------------------------------------------------------------
  // setLocalPeerId
  // ---------------------------------------------------------------------------
  describe('setLocalPeerId', () => {
    it('sets peerId on localDevice', () => {
      const { localDevice, initDevice, setLocalPeerId } = useDeviceDiscovery()
      initDevice()
      setLocalPeerId('peer-abc')
      expect(localDevice.value?.peerId).toBe('peer-abc')
    })

    it('announces when socket is open and peerId is set', () => {
      const { initDevice, connect, setLocalPeerId } = useDeviceDiscovery()
      initDevice()
      connect()
      const ws = MockWebSocket.lastInstance()
      ws.simulateOpen()
      // peerId not set yet, so no announce on open
      ws.send.mockClear()
      setLocalPeerId('peer-xyz')
      // Should announce after setLocalPeerId
      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"announce"')
      )
    })

    it('is a no-op when localDevice is null', () => {
      // Don't call initDevice — localDevice is null
      const { setLocalPeerId } = useDeviceDiscovery()
      expect(() => setLocalPeerId('peer-test')).not.toThrow()
    })
  })

  // ---------------------------------------------------------------------------
  // connect
  // ---------------------------------------------------------------------------
  describe('connect', () => {
    it('creates a WebSocket with the correct URL', () => {
      const { connect } = useDeviceDiscovery()
      connect()
      expect(MockWebSocket._instances).toHaveLength(1)
      expect(MockWebSocket.lastInstance().url).toContain('/ws')
    })

    it('sets isConnected to true on socket open', () => {
      const { isConnected, connect } = useDeviceDiscovery()
      connect()
      expect(isConnected.value).toBe(false)
      MockWebSocket.lastInstance().simulateOpen()
      expect(isConnected.value).toBe(true)
    })

    it('sets isConnected to false on socket error', () => {
      const { isConnected, connect } = useDeviceDiscovery()
      connect()
      MockWebSocket.lastInstance().simulateOpen()
      MockWebSocket.lastInstance().onerror?.(new Event('error'))
      expect(isConnected.value).toBe(false)
    })

    it('announces after open when peerId is already set', () => {
      const { initDevice, connect, setLocalPeerId } = useDeviceDiscovery()
      initDevice()
      // Pre-assign peerId before connecting
      const { localDevice } = useDeviceDiscovery()
      localDevice.value!.peerId = 'peer-pre'
      connect()
      const ws = MockWebSocket.lastInstance()
      ws.simulateOpen()
      expect(ws.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"announce"')
      )
    })
  })

  // ---------------------------------------------------------------------------
  // message handling
  // ---------------------------------------------------------------------------
  describe('message handling', () => {
    it('adds device on peer-joined (excluding self)', () => {
      const { initDevice, connect, devices } = useDeviceDiscovery()
      initDevice()
      connect()
      const ws = MockWebSocket.lastInstance()
      ws.simulateOpen()
      ws.simulateMessage({
        type: 'peer-joined',
        deviceInfo: { id: 'remote-1', name: 'Remote', platform: 'Windows', timestamp: Date.now(), peerId: 'p1' }
      })
      expect(devices.value).toHaveLength(1)
      expect(devices.value[0].id).toBe('remote-1')
    })

    it('does not add self on peer-joined', () => {
      const { initDevice, connect, devices, localDevice } = useDeviceDiscovery()
      initDevice()
      connect()
      const ws = MockWebSocket.lastInstance()
      ws.simulateOpen()
      ws.simulateMessage({
        type: 'peer-joined',
        deviceInfo: { ...localDevice.value, peerId: 'p-self' }
      })
      expect(devices.value).toHaveLength(0)
    })

    it('updates existing device on peer-joined with same id', () => {
      const { connect, devices } = useDeviceDiscovery()
      connect()
      const ws = MockWebSocket.lastInstance()
      ws.simulateOpen()
      ws.simulateMessage({
        type: 'peer-joined',
        deviceInfo: { id: 'r1', name: 'Old', platform: 'Linux', timestamp: Date.now(), peerId: 'p1' }
      })
      ws.simulateMessage({
        type: 'peer-joined',
        deviceInfo: { id: 'r1', name: 'New', platform: 'Linux', timestamp: Date.now(), peerId: 'p1' }
      })
      expect(devices.value).toHaveLength(1)
      expect(devices.value[0].name).toBe('New')
    })

    it('removes device on peer-left', () => {
      const { connect, devices } = useDeviceDiscovery()
      connect()
      const ws = MockWebSocket.lastInstance()
      ws.simulateOpen()
      ws.simulateMessage({
        type: 'peer-joined',
        deviceInfo: { id: 'r1', name: 'Remote', platform: 'Linux', timestamp: Date.now(), peerId: 'p1' }
      })
      ws.simulateMessage({ type: 'peer-left', peerId: 'p1' })
      expect(devices.value).toHaveLength(0)
    })

    it('ignores malformed JSON messages without throwing', () => {
      const { connect } = useDeviceDiscovery()
      connect()
      const ws = MockWebSocket.lastInstance()
      ws.onmessage?.(new MessageEvent('message', { data: 'not-json' }))
      // should not throw
    })
  })

  // ---------------------------------------------------------------------------
  // disconnect
  // ---------------------------------------------------------------------------
  describe('disconnect', () => {
    it('sets isConnected to false and clears devices', () => {
      const { initDevice, connect, disconnect, isConnected, devices } = useDeviceDiscovery()
      initDevice()
      connect()
      const ws = MockWebSocket.lastInstance()
      ws.simulateOpen()
      ws.simulateMessage({
        type: 'peer-joined',
        deviceInfo: { id: 'r1', name: 'Remote', platform: 'Linux', timestamp: Date.now(), peerId: 'p1' }
      })
      disconnect()
      expect(isConnected.value).toBe(false)
      expect(devices.value).toHaveLength(0)
    })

    it('prevents reconnect after disconnect', () => {
      const { connect, disconnect } = useDeviceDiscovery()
      connect()
      const ws = MockWebSocket.lastInstance()
      ws.simulateOpen()
      disconnect()
      MockWebSocket.reset()
      ws.simulateClose()
      vi.advanceTimersByTime(6000)
      // No new WebSocket should be created after intentional disconnect
      expect(MockWebSocket._instances).toHaveLength(0)
    })
  })

  // ---------------------------------------------------------------------------
  // reconnect logic
  // ---------------------------------------------------------------------------
  describe('reconnect logic', () => {
    it('reconnects after 5 seconds on unexpected close', () => {
      const { connect } = useDeviceDiscovery()
      connect()
      const ws = MockWebSocket.lastInstance()
      ws.simulateOpen()
      ws.simulateClose()
      MockWebSocket.reset()
      vi.advanceTimersByTime(5000)
      expect(MockWebSocket._instances).toHaveLength(1)
    })
  })
})
