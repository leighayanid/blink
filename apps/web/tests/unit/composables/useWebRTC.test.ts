import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { DataConnection } from 'peerjs'

// ---------------------------------------------------------------------------
// PeerJS mock helpers
// ---------------------------------------------------------------------------

function createMockConnection(peerId = 'remote-peer'): DataConnection & { _emit: (event: string, ...args: unknown[]) => void } {
  const handlers: Record<string, Array<(...args: unknown[]) => void>> = {}
  const conn: any = {
    peer: peerId,
    open: true,
    send: vi.fn(),
    close: vi.fn(),
    on(event: string, handler: (...args: unknown[]) => void) {
      if (!handlers[event]) handlers[event] = []
      handlers[event].push(handler)
      return conn
    },
    _emit(event: string, ...args: unknown[]) {
      handlers[event]?.forEach(h => h(...args))
    },
  }
  return conn
}

function createMockPeer(id = 'local-peer') {
  const handlers: Record<string, Array<(...args: unknown[]) => void>> = {}
  const peer: any = {
    id,
    connect: vi.fn(),
    destroy: vi.fn(),
    reconnect: vi.fn(),
    on(event: string, handler: (...args: unknown[]) => void) {
      if (!handlers[event]) handlers[event] = []
      handlers[event].push(handler)
      return peer
    },
    _emit(event: string, ...args: unknown[]) {
      handlers[event]?.forEach(h => h(...args))
    },
  }
  return peer
}

// ---------------------------------------------------------------------------
// Tests — module is re-imported fresh per describe block via vi.resetModules
// ---------------------------------------------------------------------------
describe('useWebRTC', () => {
  let useWebRTC: typeof import('../../../app/composables/useWebRTC').useWebRTC
  let mockPeerInstance: ReturnType<typeof createMockPeer>

  beforeEach(async () => {
    vi.useFakeTimers()
    vi.resetModules()

    mockPeerInstance = createMockPeer('local-id')

    vi.doMock('peerjs', () => ({
      default: vi.fn().mockImplementation(() => mockPeerInstance),
    }))

    const mod = await import('../../../app/composables/useWebRTC')
    useWebRTC = mod.useWebRTC
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.doUnmock('peerjs')
    const { destroy } = useWebRTC()
    destroy()
  })

  // ---------------------------------------------------------------------------
  // initPeer
  // ---------------------------------------------------------------------------
  describe('initPeer', () => {
    it('resolves with the peer id on open', async () => {
      const { initPeer } = useWebRTC()
      const promise = initPeer('my-device-id')
      mockPeerInstance._emit('open', 'local-id')
      const id = await promise
      expect(id).toBe('local-id')
    })

    it('sets localPeerId on open', async () => {
      const { initPeer, localPeerId } = useWebRTC()
      const promise = initPeer()
      mockPeerInstance._emit('open', 'local-id')
      await promise
      expect(localPeerId.value).toBe('local-id')
    })

    it('rejects when peer emits an error', async () => {
      const { initPeer } = useWebRTC()
      const promise = initPeer()
      mockPeerInstance._emit('error', new Error('peer-fail'))
      await expect(promise).rejects.toThrow('peer-fail')
    })

    it('attempts reconnect on disconnected event when shouldReconnect is true', async () => {
      const { initPeer } = useWebRTC()
      const p = initPeer()
      mockPeerInstance._emit('open', 'local-id')
      await p
      mockPeerInstance._emit('disconnected')
      expect(mockPeerInstance.reconnect).toHaveBeenCalledTimes(1)
    })
  })

  // ---------------------------------------------------------------------------
  // connectToPeer
  // ---------------------------------------------------------------------------
  describe('connectToPeer', () => {
    it('rejects immediately if peer not initialized', async () => {
      const { connectToPeer } = useWebRTC()
      await expect(connectToPeer('some-peer')).rejects.toThrow('Peer not initialized')
    })

    it('resolves with the DataConnection on open', async () => {
      const { initPeer, connectToPeer } = useWebRTC()
      const initPromise = initPeer()
      mockPeerInstance._emit('open', 'local-id')
      await initPromise

      const mockConn = createMockConnection('remote-1')
      mockPeerInstance.connect.mockReturnValue(mockConn)

      const connPromise = connectToPeer('remote-1')
      mockConn._emit('open')
      const conn = await connPromise
      expect(conn.peer).toBe('remote-1')
    })

    it('sets connectionState to "connecting" before open', async () => {
      const { initPeer, connectToPeer, getConnectionState } = useWebRTC()
      const ip = initPeer()
      mockPeerInstance._emit('open', 'local-id')
      await ip

      const mockConn = createMockConnection('remote-2')
      mockPeerInstance.connect.mockReturnValue(mockConn)

      connectToPeer('remote-2')
      expect(getConnectionState('remote-2')).toBe('connecting')
    })

    it('rejects on timeout after 10 seconds', async () => {
      const { initPeer, connectToPeer } = useWebRTC()
      const ip = initPeer()
      mockPeerInstance._emit('open', 'local-id')
      await ip

      const mockConn = createMockConnection('remote-3')
      // Never fire 'open' to simulate timeout
      mockPeerInstance.connect.mockReturnValue(mockConn)

      const connPromise = connectToPeer('remote-3')
      vi.advanceTimersByTime(10001)
      await expect(connPromise).rejects.toThrow('Connection timeout')
    })

    it('rejects on connection error', async () => {
      const { initPeer, connectToPeer } = useWebRTC()
      const ip = initPeer()
      mockPeerInstance._emit('open', 'local-id')
      await ip

      const mockConn = createMockConnection('remote-4')
      mockPeerInstance.connect.mockReturnValue(mockConn)

      const connPromise = connectToPeer('remote-4')
      mockConn._emit('error', new Error('connect-error'))
      await expect(connPromise).rejects.toThrow('connect-error')
    })
  })

  // ---------------------------------------------------------------------------
  // handleConnection / onConnection callbacks
  // ---------------------------------------------------------------------------
  describe('onConnection', () => {
    it('fires registered callbacks when a connection is handled', async () => {
      const { initPeer, connectToPeer, onConnection } = useWebRTC()
      const ip = initPeer()
      mockPeerInstance._emit('open', 'local-id')
      await ip

      const cb = vi.fn()
      onConnection(cb)

      const mockConn = createMockConnection('cb-peer')
      mockPeerInstance.connect.mockReturnValue(mockConn)
      const cp = connectToPeer('cb-peer')
      mockConn._emit('open')
      await cp

      expect(cb).toHaveBeenCalledWith(mockConn)
    })

    it('sets connectionState to "connected" after open', async () => {
      const { initPeer, connectToPeer, getConnectionState } = useWebRTC()
      const ip = initPeer()
      mockPeerInstance._emit('open', 'local-id')
      await ip

      const mockConn = createMockConnection('state-peer')
      mockPeerInstance.connect.mockReturnValue(mockConn)
      const cp = connectToPeer('state-peer')
      mockConn._emit('open')
      await cp

      expect(getConnectionState('state-peer')).toBe('connected')
    })

    it('sets connectionState to "disconnected" when connection closes', async () => {
      const { initPeer, connectToPeer, getConnectionState } = useWebRTC()
      const ip = initPeer()
      mockPeerInstance._emit('open', 'local-id')
      await ip

      const mockConn = createMockConnection('close-peer')
      mockPeerInstance.connect.mockReturnValue(mockConn)
      const cp = connectToPeer('close-peer')
      mockConn._emit('open')
      await cp

      mockConn._emit('close')
      expect(getConnectionState('close-peer')).toBe('disconnected')
    })
  })

  // ---------------------------------------------------------------------------
  // sendData
  // ---------------------------------------------------------------------------
  describe('sendData', () => {
    it('sends data to an open connection and returns true', async () => {
      const { initPeer, connectToPeer, sendData } = useWebRTC()
      const ip = initPeer()
      mockPeerInstance._emit('open', 'local-id')
      await ip

      const mockConn = createMockConnection('send-peer')
      mockPeerInstance.connect.mockReturnValue(mockConn)
      const cp = connectToPeer('send-peer')
      mockConn._emit('open')
      await cp

      const result = sendData('send-peer', { hello: 'world' })
      expect(result).toBe(true)
      expect(mockConn.send).toHaveBeenCalledWith({ hello: 'world' })
    })

    it('returns false when no connection exists', () => {
      const { sendData } = useWebRTC()
      expect(sendData('ghost-peer', 'data')).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // closeConnection
  // ---------------------------------------------------------------------------
  describe('closeConnection', () => {
    it('closes the connection and sets state to disconnected', async () => {
      const { initPeer, connectToPeer, closeConnection, getConnectionState, connections } = useWebRTC()
      const ip = initPeer()
      mockPeerInstance._emit('open', 'local-id')
      await ip

      const mockConn = createMockConnection('close-me')
      mockPeerInstance.connect.mockReturnValue(mockConn)
      const cp = connectToPeer('close-me')
      mockConn._emit('open')
      await cp

      closeConnection('close-me')
      expect(mockConn.close).toHaveBeenCalled()
      expect(connections.value.has('close-me')).toBe(false)
      expect(getConnectionState('close-me')).toBe('disconnected')
    })
  })

  // ---------------------------------------------------------------------------
  // destroy
  // ---------------------------------------------------------------------------
  describe('destroy', () => {
    it('clears all state and destroys the peer', async () => {
      const { initPeer, destroy, localPeerId, connections, connectionCallbacks } = useWebRTC() as any
      const ip = initPeer()
      mockPeerInstance._emit('open', 'local-id')
      await ip
      destroy()
      expect(localPeerId.value).toBe('')
      expect(connections.value.size).toBe(0)
      expect(mockPeerInstance.destroy).toHaveBeenCalled()
    })
  })
})
