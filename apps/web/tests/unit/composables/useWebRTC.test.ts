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
  // initPeer — broker recovery
  //
  // The persisted device id is reused as the PeerJS broker id, so the broker
  // routinely still holds it from a previous session (refresh, second tab,
  // suspended mobile tab). If that kills init, the device is never announced
  // and stays invisible to every other device.
  // ---------------------------------------------------------------------------
  describe('initPeer broker recovery', () => {
    let resilientUseWebRTC: typeof import('../../../app/composables/useWebRTC').useWebRTC
    let PeerCtor: ReturnType<typeof vi.fn>
    let instances: Array<ReturnType<typeof createMockPeer>>

    const idTaken = () => Object.assign(new Error('ID is taken'), { type: 'unavailable-id' })

    beforeEach(async () => {
      vi.resetModules()
      instances = []
      PeerCtor = vi.fn().mockImplementation((id?: string) => {
        const instance = createMockPeer(typeof id === 'string' ? id : 'broker-generated')
        instances.push(instance)
        return instance
      })
      vi.doMock('peerjs', () => ({ default: PeerCtor }))
      const mod = await import('../../../app/composables/useWebRTC')
      resilientUseWebRTC = mod.useWebRTC
    })

    afterEach(() => {
      resilientUseWebRTC().destroy()
    })

    it('retries with the same id when the broker reports it as taken', async () => {
      const { initPeer } = resilientUseWebRTC()
      const promise = initPeer('device-persisted')

      instances[0]._emit('error', idTaken())
      await vi.advanceTimersByTimeAsync(1500)

      expect(PeerCtor).toHaveBeenCalledTimes(2)
      expect(PeerCtor.mock.calls[1]?.[0]).toBe('device-persisted')

      instances[1]._emit('open', 'device-persisted')
      await expect(promise).resolves.toBe('device-persisted')
    })

    it('falls back to a broker-generated id on the final attempt', async () => {
      const { initPeer } = resilientUseWebRTC()
      const promise = initPeer('device-persisted')

      instances[0]._emit('error', idTaken())
      await vi.advanceTimersByTimeAsync(1500)
      instances[1]._emit('error', idTaken())
      await vi.advanceTimersByTimeAsync(1500)

      expect(PeerCtor).toHaveBeenCalledTimes(3)
      expect(PeerCtor.mock.calls[2]?.[0]).toBeUndefined()

      instances[2]._emit('open', 'broker-generated')
      await expect(promise).resolves.toBe('broker-generated')
    })

    it('rejects once retries are exhausted', async () => {
      const { initPeer, peerError } = resilientUseWebRTC()
      const promise = initPeer('device-persisted')
      const assertion = expect(promise).rejects.toThrow('ID is taken')

      instances[0]._emit('error', idTaken())
      await vi.advanceTimersByTimeAsync(1500)
      instances[1]._emit('error', idTaken())
      await vi.advanceTimersByTimeAsync(1500)
      instances[2]._emit('error', idTaken())

      await assertion
      expect(peerError.value).toBe('ID is taken')
    })

    it('does not re-initialize when an error arrives after the peer is open', async () => {
      const { initPeer, localPeerId } = resilientUseWebRTC()
      const promise = initPeer('device-persisted')
      instances[0]._emit('open', 'device-persisted')
      await promise

      // A failed dial surfaces as a peer-level error; it must not tear down
      // the peer that discovery already announced.
      instances[0]._emit('error', Object.assign(new Error('no such peer'), { type: 'peer-unavailable' }))
      await vi.advanceTimersByTimeAsync(5000)

      expect(PeerCtor).toHaveBeenCalledTimes(1)
      expect(localPeerId.value).toBe('device-persisted')
    })

    it('fires onPeerOpen for every open, including reconnects', async () => {
      const { initPeer, onPeerOpen } = resilientUseWebRTC()
      const opened: string[] = []
      onPeerOpen(id => opened.push(id))

      const promise = initPeer('device-persisted')
      instances[0]._emit('open', 'device-persisted')
      await promise

      // PeerJS re-emits 'open' after reconnect()
      instances[0]._emit('open', 'device-persisted')

      expect(opened).toEqual(['device-persisted', 'device-persisted'])
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
