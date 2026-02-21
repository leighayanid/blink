import { describe, it, expect, beforeEach, vi } from 'vitest'

// ---------------------------------------------------------------------------
// MockPeer — stands in for Nitro's `peer` object in WebSocket handler tests
// ---------------------------------------------------------------------------
function makePeer(id: string) {
  return { id, send: vi.fn() }
}

function makeMessage(data: object) {
  return { text: () => JSON.stringify(data) }
}

// ---------------------------------------------------------------------------
// Tests
// The handler is exported as `export default defineWebSocketHandler({...})`.
// setup.ts stubs defineWebSocketHandler to return its argument, so importing
// the module gives us the raw { open, message, close, error } object.
// We re-import the module fresh (via vi.resetModules) before each test to
// get clean module-level Map state (announcedDevices, connectedPeers).
// ---------------------------------------------------------------------------
describe('WebSocket signaling handler', () => {
  let handler: {
    open: (peer: ReturnType<typeof makePeer>) => void
    message: (peer: ReturnType<typeof makePeer>, msg: ReturnType<typeof makeMessage>) => void
    close: (peer: ReturnType<typeof makePeer>) => void
    error: (peer: ReturnType<typeof makePeer>, err: Error) => void
  }

  beforeEach(async () => {
    vi.resetModules()
    vi.stubGlobal('defineWebSocketHandler', (h: typeof handler) => h)
    const mod = await import('../../../server/routes/ws')
    handler = mod.default as typeof handler
  })

  // ---------------------------------------------------------------------------
  // open
  // ---------------------------------------------------------------------------
  describe('open', () => {
    it('sends init message with peer id', () => {
      const peer = makePeer('ws-001')
      handler.open(peer)
      expect(peer.send).toHaveBeenCalledWith(
        expect.stringContaining('"type":"init"')
      )
      expect(peer.send).toHaveBeenCalledWith(
        expect.stringContaining('"peerId":"ws-001"')
      )
    })

    it('sends existing announced devices to new peer', () => {
      const existing = makePeer('ws-existing')
      handler.open(existing)

      // Announce a device from the existing peer
      handler.message(existing, makeMessage({
        type: 'announce',
        deviceInfo: { id: 'd1', name: 'Device One', platform: 'macOS', peerId: 'p1', timestamp: 1 }
      }))

      // New peer connects — should receive the previously announced device
      const newPeer = makePeer('ws-new')
      handler.open(newPeer)
      const calls = newPeer.send.mock.calls.map((c: [string]) => JSON.parse(c[0]))
      const peerJoinedMsg = calls.find((c: any) => c.type === 'peer-joined')
      expect(peerJoinedMsg).toBeDefined()
      expect(peerJoinedMsg.deviceInfo.id).toBe('d1')
    })
  })

  // ---------------------------------------------------------------------------
  // message — announce
  // ---------------------------------------------------------------------------
  describe('message: announce', () => {
    it('broadcasts peer-joined to all connected peers', () => {
      const p1 = makePeer('ws-1')
      const p2 = makePeer('ws-2')
      handler.open(p1)
      handler.open(p2)
      p1.send.mockClear()
      p2.send.mockClear()

      handler.message(p1, makeMessage({
        type: 'announce',
        deviceInfo: { id: 'dev-a', name: 'Dev A', platform: 'Linux', peerId: 'peer-a', timestamp: 1 }
      }))

      // Both p1 and p2 should receive the peer-joined broadcast (p1 sees itself too)
      const p2Msgs = p2.send.mock.calls.map((c: [string]) => JSON.parse(c[0]))
      expect(p2Msgs.some((m: any) => m.type === 'peer-joined' && m.deviceInfo.id === 'dev-a')).toBe(true)
    })

    it('rejects malformed announce (missing required fields)', () => {
      const peer = makePeer('bad-peer')
      handler.open(peer)
      peer.send.mockClear()

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      handler.message(peer, makeMessage({ type: 'announce', deviceInfo: { name: 'no-id' } }))
      // console.warn is called with two args: message string + peer.id
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('malformed'),
        expect.anything()
      )
      warnSpy.mockRestore()
    })

    it('truncates overly long device name', () => {
      const peer = makePeer('trunc-peer')
      handler.open(peer)
      peer.send.mockClear()

      const longName = 'A'.repeat(200)
      handler.message(peer, makeMessage({
        type: 'announce',
        deviceInfo: { id: 'trunc-dev', name: longName, platform: 'Linux', peerId: 'p-trunc', timestamp: 1 }
      }))

      const calls = peer.send.mock.calls.map((c: [string]) => JSON.parse(c[0]))
      const joinMsg = calls.find((c: any) => c.type === 'peer-joined')
      expect(joinMsg.deviceInfo.name.length).toBeLessThanOrEqual(128)
    })

    it('truncates overly long id', () => {
      const peer = makePeer('trunc-id-peer')
      handler.open(peer)
      peer.send.mockClear()

      const longId = 'x'.repeat(200)
      handler.message(peer, makeMessage({
        type: 'announce',
        deviceInfo: { id: longId, name: 'Dev', platform: 'Linux', peerId: 'p-id', timestamp: 1 }
      }))

      const calls = peer.send.mock.calls.map((c: [string]) => JSON.parse(c[0]))
      const joinMsg = calls.find((c: any) => c.type === 'peer-joined')
      expect(joinMsg.deviceInfo.id.length).toBeLessThanOrEqual(64)
    })

    it('defaults platform to "Unknown" when missing', () => {
      const peer = makePeer('plat-peer')
      handler.open(peer)
      peer.send.mockClear()

      handler.message(peer, makeMessage({
        type: 'announce',
        deviceInfo: { id: 'pd', name: 'PD', peerId: 'pp', timestamp: 1 }
        // No platform
      }))

      const calls = peer.send.mock.calls.map((c: [string]) => JSON.parse(c[0]))
      const joinMsg = calls.find((c: any) => c.type === 'peer-joined')
      expect(joinMsg?.deviceInfo.platform).toBe('Unknown')
    })
  })

  // ---------------------------------------------------------------------------
  // message — signal
  // ---------------------------------------------------------------------------
  describe('message: signal', () => {
    it('forwards signal to target peer', () => {
      const p1 = makePeer('sig-1')
      const p2 = makePeer('sig-2')
      handler.open(p1)
      handler.open(p2)

      // p2 announces itself
      handler.message(p2, makeMessage({
        type: 'announce',
        deviceInfo: { id: 'd2', name: 'D2', platform: 'Linux', peerId: 'p-p2', timestamp: 1 }
      }))
      p1.send.mockClear()
      p2.send.mockClear()

      // p1 sends signal to p2
      handler.message(p1, makeMessage({
        type: 'signal',
        targetPeer: 'p-p2',
        signal: { candidate: 'test' }
      }))

      const p2Msgs = p2.send.mock.calls.map((c: [string]) => JSON.parse(c[0]))
      expect(p2Msgs.some((m: any) => m.type === 'signal')).toBe(true)
    })

    it('does not forward signal when targetPeer is unknown', () => {
      const peer = makePeer('sig-unknown')
      handler.open(peer)
      peer.send.mockClear()

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      handler.message(peer, makeMessage({ type: 'signal', targetPeer: 'ghost' }))
      // console.warn is called with two args: message string + targetPeer
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('not found'),
        expect.anything()
      )
      warnSpy.mockRestore()
    })

    it('ignores signal with missing targetPeer', () => {
      const peer = makePeer('no-target')
      handler.open(peer)
      peer.send.mockClear()
      // Should not throw
      handler.message(peer, makeMessage({ type: 'signal' }))
    })
  })

  // ---------------------------------------------------------------------------
  // message — offer / answer / ice-candidate
  // ---------------------------------------------------------------------------
  describe('message: WebRTC relay (offer/answer/ice-candidate)', () => {
    it('broadcasts offer to all peers except sender', () => {
      const p1 = makePeer('rtc-1')
      const p2 = makePeer('rtc-2')
      const p3 = makePeer('rtc-3')
      handler.open(p1)
      handler.open(p2)
      handler.open(p3)
      p1.send.mockClear()
      p2.send.mockClear()
      p3.send.mockClear()

      handler.message(p1, makeMessage({ type: 'offer', signal: {} }))

      expect(p1.send).not.toHaveBeenCalled()
      expect(p2.send).toHaveBeenCalled()
      expect(p3.send).toHaveBeenCalled()
    })

    it('broadcasts answer to all peers except sender', () => {
      const p1 = makePeer('ans-1')
      const p2 = makePeer('ans-2')
      handler.open(p1)
      handler.open(p2)
      p1.send.mockClear()
      p2.send.mockClear()

      handler.message(p1, makeMessage({ type: 'answer', signal: {} }))
      expect(p1.send).not.toHaveBeenCalled()
      expect(p2.send).toHaveBeenCalled()
    })

    it('broadcasts ice-candidate to all peers except sender', () => {
      const p1 = makePeer('ice-1')
      const p2 = makePeer('ice-2')
      handler.open(p1)
      handler.open(p2)
      p1.send.mockClear()
      p2.send.mockClear()

      handler.message(p1, makeMessage({ type: 'ice-candidate', signal: {} }))
      expect(p2.send).toHaveBeenCalled()
      expect(p1.send).not.toHaveBeenCalled()
    })
  })

  // ---------------------------------------------------------------------------
  // close
  // ---------------------------------------------------------------------------
  describe('close', () => {
    it('broadcasts peer-left when an announced peer disconnects', () => {
      const p1 = makePeer('disc-1')
      const p2 = makePeer('disc-2')
      handler.open(p1)
      handler.open(p2)

      handler.message(p1, makeMessage({
        type: 'announce',
        deviceInfo: { id: 'd-disc', name: 'Leaving', platform: 'macOS', peerId: 'p-disc', timestamp: 1 }
      }))
      p2.send.mockClear()

      handler.close(p1)

      const p2Msgs = p2.send.mock.calls.map((c: [string]) => JSON.parse(c[0]))
      expect(p2Msgs.some((m: any) => m.type === 'peer-left' && m.peerId === 'p-disc')).toBe(true)
    })

    it('does not broadcast peer-left for unannnounced peers', () => {
      const p1 = makePeer('silent-1')
      const p2 = makePeer('silent-2')
      handler.open(p1)
      handler.open(p2)
      p2.send.mockClear()

      // p1 never announced — just disconnect
      handler.close(p1)

      const p2Msgs = p2.send.mock.calls.map((c: [string]) => JSON.parse(c[0]))
      expect(p2Msgs.some((m: any) => m.type === 'peer-left')).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // error handling
  // ---------------------------------------------------------------------------
  describe('error / malformed messages', () => {
    it('handles invalid JSON without throwing', () => {
      const peer = makePeer('json-err')
      handler.open(peer)
      expect(() => {
        handler.message(peer, { text: () => '{invalid json' })
      }).not.toThrow()
    })
  })
})
