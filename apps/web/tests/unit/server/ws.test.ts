import { describe, it, expect, beforeEach, vi } from 'vitest'

// ---------------------------------------------------------------------------
// MockPeer — stands in for Nitro's `peer` object in WebSocket handler tests
// ---------------------------------------------------------------------------
function makePeer(id: string) {
  return {
    id,
    send: vi.fn(),
    close: vi.fn(),
    request: {
      url: 'ws://localhost/ws?room=local',
      headers: {
        'x-forwarded-for': '127.0.0.1'
      }
    }
  }
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
      expect(peer.send).toHaveBeenCalledWith(
        expect.stringContaining('"roomId":"local"')
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

    it('retires the previous peerId when a socket re-announces under a new one', () => {
      const p1 = makePeer('rekey-1')
      const p2 = makePeer('rekey-2')
      handler.open(p1)
      handler.open(p2)

      handler.message(p1, makeMessage({
        type: 'announce',
        deviceInfo: { id: 'dev-rekey', name: 'Rekey', platform: 'Linux', peerId: 'old-peer', timestamp: 1 }
      }))
      p2.send.mockClear()

      // Same socket, new broker id (init retry fell back to a generated id)
      handler.message(p1, makeMessage({
        type: 'announce',
        deviceInfo: { id: 'dev-rekey', name: 'Rekey', platform: 'Linux', peerId: 'new-peer', timestamp: 2 }
      }))

      const p2Msgs = p2.send.mock.calls.map((c: [string]) => JSON.parse(c[0]))
      expect(p2Msgs.some((m: any) => m.type === 'peer-left' && m.peerId === 'old-peer')).toBe(true)
      expect(p2Msgs.some((m: any) => m.type === 'peer-joined' && m.deviceInfo.peerId === 'new-peer')).toBe(true)

      // The stale id must no longer be routable
      p2.send.mockClear()
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      handler.message(p2, makeMessage({ type: 'signal', targetPeer: 'old-peer' }))
      expect(p1.send).not.toHaveBeenCalledWith(expect.stringContaining('"type":"signal"'))
      warnSpy.mockRestore()
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
    it('routes offer only to the target peer', () => {
      const p1 = makePeer('rtc-1')
      const p2 = makePeer('rtc-2')
      const p3 = makePeer('rtc-3')
      handler.open(p1)
      handler.open(p2)
      handler.open(p3)
      handler.message(p2, makeMessage({
        type: 'announce',
        deviceInfo: { id: 'rtc-d2', name: 'RTC 2', platform: 'Linux', peerId: 'rtc-peer-2', timestamp: 1 }
      }))
      p1.send.mockClear()
      p2.send.mockClear()
      p3.send.mockClear()

      handler.message(p1, makeMessage({ type: 'offer', targetPeer: 'rtc-peer-2', signal: {} }))

      expect(p1.send).not.toHaveBeenCalled()
      expect(p2.send).toHaveBeenCalled()
      expect(p3.send).not.toHaveBeenCalled()
    })

    it('routes answer only to the target peer', () => {
      const p1 = makePeer('ans-1')
      const p2 = makePeer('ans-2')
      handler.open(p1)
      handler.open(p2)
      handler.message(p2, makeMessage({
        type: 'announce',
        deviceInfo: { id: 'ans-d2', name: 'Answer 2', platform: 'Linux', peerId: 'ans-peer-2', timestamp: 1 }
      }))
      p1.send.mockClear()
      p2.send.mockClear()

      handler.message(p1, makeMessage({ type: 'answer', targetPeer: 'ans-peer-2', signal: {} }))
      expect(p1.send).not.toHaveBeenCalled()
      expect(p2.send).toHaveBeenCalled()
    })

    it('routes ice-candidate only to the target peer', () => {
      const p1 = makePeer('ice-1')
      const p2 = makePeer('ice-2')
      handler.open(p1)
      handler.open(p2)
      handler.message(p2, makeMessage({
        type: 'announce',
        deviceInfo: { id: 'ice-d2', name: 'ICE 2', platform: 'Linux', peerId: 'ice-peer-2', timestamp: 1 }
      }))
      p1.send.mockClear()
      p2.send.mockClear()

      handler.message(p1, makeMessage({ type: 'ice-candidate', targetPeer: 'ice-peer-2', signal: {} }))
      expect(p2.send).toHaveBeenCalled()
      expect(p1.send).not.toHaveBeenCalled()
    })
  })

  // ---------------------------------------------------------------------------
  // abuse controls
  // ---------------------------------------------------------------------------
  describe('abuse controls', () => {
    it('rejects oversized messages', () => {
      const peer = makePeer('too-large')
      handler.open(peer)
      peer.send.mockClear()

      handler.message(peer, { text: () => 'x'.repeat(20 * 1024) })
      expect(peer.close).not.toHaveBeenCalled()

      handler.message(peer, { text: () => 'x'.repeat(20 * 1024) })
      handler.message(peer, { text: () => 'x'.repeat(20 * 1024) })
      expect(peer.close).toHaveBeenCalled()
    })

    it('isolates announcements by room', () => {
      const roomA = makePeer('room-a')
      const roomB = makePeer('room-b')
      roomB.request.url = 'ws://localhost/ws?room=other'

      handler.open(roomA)
      handler.open(roomB)
      roomA.send.mockClear()
      roomB.send.mockClear()

      handler.message(roomA, makeMessage({
        type: 'announce',
        deviceInfo: { id: 'room-device', name: 'Room Device', platform: 'Linux', peerId: 'room-peer', timestamp: 1 }
      }))

      expect(roomA.send).toHaveBeenCalled()
      expect(roomB.send).not.toHaveBeenCalled()
    })
  })

  // ---------------------------------------------------------------------------
  // hardening — each of these reproduces a bypass that previously worked
  // ---------------------------------------------------------------------------
  describe('peerId ownership', () => {
    const sent = (peer: ReturnType<typeof makePeer>) =>
      peer.send.mock.calls.map((c: [string]) => JSON.parse(c[0]))

    it('refuses a peerId that another live socket already announced', () => {
      const victim = makePeer('own-victim')
      const attacker = makePeer('own-attacker')
      const bystander = makePeer('own-bystander')
      handler.open(victim)
      handler.open(attacker)
      handler.open(bystander)

      handler.message(victim, makeMessage({
        type: 'announce',
        deviceInfo: { id: 'v', name: 'Victim', platform: 'macOS', peerId: 'victim-peer', timestamp: 1 }
      }))

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      handler.message(attacker, makeMessage({
        type: 'announce',
        deviceInfo: { id: 'a', name: 'Victim', platform: 'macOS', peerId: 'victim-peer', timestamp: 2 }
      }))
      warnSpy.mockRestore()

      victim.send.mockClear()
      attacker.send.mockClear()
      handler.message(bystander, makeMessage({
        type: 'signal',
        targetPeer: 'victim-peer',
        signal: { sdp: 'secret' }
      }))

      // The signal must still reach its rightful owner
      expect(sent(victim).some((m: any) => m.type === 'signal')).toBe(true)
      expect(sent(attacker).some((m: any) => m.type === 'signal')).toBe(false)
    })

    it('allows reclaiming a peerId whose previous owner has disconnected', () => {
      const first = makePeer('reclaim-first')
      const second = makePeer('reclaim-second')
      handler.open(first)
      handler.open(second)

      handler.message(first, makeMessage({
        type: 'announce',
        deviceInfo: { id: 'd', name: 'Device', platform: 'Linux', peerId: 'shared-peer', timestamp: 1 }
      }))
      handler.close(first)

      second.send.mockClear()
      handler.message(second, makeMessage({
        type: 'announce',
        deviceInfo: { id: 'd', name: 'Device', platform: 'Linux', peerId: 'shared-peer', timestamp: 2 }
      }))

      expect(sent(second).some((m: any) => m.type === 'peer-joined' && m.deviceInfo.peerId === 'shared-peer')).toBe(true)
      expect(sent(second).some((m: any) => m.type === 'error')).toBe(false)
    })
  })

  describe('rate limiting', () => {
    it('does not let reconnecting refill the per-IP message budget', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      let blockedOnConnect = false

      for (let socket = 0; socket < 10; socket++) {
        const peer = makePeer(`flood-${socket}`)
        handler.open(peer)

        const messages = peer.send.mock.calls.map((c: [string]) => JSON.parse(c[0]))
        if (!messages.some((m: any) => m.type === 'init')) {
          blockedOnConnect = messages.some(
            (m: any) => m.type === 'error' && m.reason === 'Temporarily blocked for abuse'
          )
          break
        }

        // Burn this socket's whole allowance, then throw it away and reconnect —
        // the bypass that made the old per-socket limiter decorative.
        for (let i = 0; i < 130; i++) {
          handler.message(peer, makeMessage({ type: 'heartbeat' }))
        }
        handler.close(peer)
      }

      warnSpy.mockRestore()
      expect(blockedOnConnect).toBe(true)
    })

    it('throttles announce separately from ordinary messages', () => {
      const peer = makePeer('announce-flood')
      handler.open(peer)
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      let broadcasts = 0
      for (let i = 0; i < 20; i++) {
        peer.send.mockClear()
        handler.message(peer, makeMessage({
          type: 'announce',
          deviceInfo: { id: 'a', name: 'A', platform: 'Linux', peerId: `peer-${i}`, timestamp: 1 }
        }))
        if (peer.send.mock.calls.some((c: [string]) => JSON.parse(c[0]).type === 'peer-joined')) broadcasts++
      }

      warnSpy.mockRestore()
      // Far below the 120/min general message budget
      expect(broadcasts).toBeLessThanOrEqual(5)
    })

    it('measures the message size cap in UTF-8 bytes, not UTF-16 units', () => {
      const peer = makePeer('size-peer')
      handler.open(peer)
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // 15096 UTF-16 units but 30096 UTF-8 bytes — under a naive length check,
      // comfortably over the 16 KB cap.
      const payload = JSON.stringify({
        type: 'announce',
        deviceInfo: { id: 'x', name: 'A', platform: 'é'.repeat(15000), peerId: 'px', timestamp: 1 }
      })
      expect(payload.length).toBeLessThan(16 * 1024)

      handler.message(peer, { text: () => payload })
      handler.message(peer, { text: () => payload })
      handler.message(peer, { text: () => payload })

      warnSpy.mockRestore()
      expect(peer.close).toHaveBeenCalled()
    })
  })

  describe('client IP resolution', () => {
    it('ignores the client-supplied end of X-Forwarded-For', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      let accepted = 0

      for (let i = 0; i < 60; i++) {
        const peer = makePeer(`xff-${i}`)
        // Attacker picks the leftmost entry; the real proxy appends its view.
        peer.request.headers['x-forwarded-for'] = `9.9.9.${i}, 203.0.113.7`
        handler.open(peer)
        if (peer.send.mock.calls.some((c: [string]) => JSON.parse(c[0]).type === 'init')) accepted++
      }

      warnSpy.mockRestore()
      // All 60 resolve to the same real client, so the per-IP caps apply
      expect(accepted).toBeLessThanOrEqual(20)
    })
  })

  describe('origin checks', () => {
    const withOrigin = (id: string, origin?: string, host = 'blink.app') => {
      const peer = makePeer(id)
      peer.request.headers = { 'x-forwarded-for': '198.51.100.4', host } as any
      if (origin) (peer.request.headers as any).origin = origin
      return peer
    }

    it('rejects a handshake from a foreign origin', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const peer = withOrigin('origin-bad', 'https://evil.example')
      handler.open(peer)
      warnSpy.mockRestore()

      expect(peer.close).toHaveBeenCalled()
      expect(peer.send).toHaveBeenCalledWith(expect.stringContaining('Origin not allowed'))
    })

    it('accepts a same-origin handshake', () => {
      const peer = withOrigin('origin-good', 'https://blink.app')
      handler.open(peer)
      expect(peer.send).toHaveBeenCalledWith(expect.stringContaining('"type":"init"'))
    })

    it('accepts a non-browser client that sends no Origin', () => {
      const peer = withOrigin('origin-none')
      handler.open(peer)
      expect(peer.send).toHaveBeenCalledWith(expect.stringContaining('"type":"init"'))
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
