import { describe, it, expect, beforeEach, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Mock data connection
// ---------------------------------------------------------------------------
function createConnection(peerId = 'remote-peer') {
  const handlers: Record<string, Array<(...args: any[]) => void>> = {}
  const connection = {
    peer: peerId,
    open: true,
    send: vi.fn(),
    on(event: string, handler: (...args: any[]) => void) {
      if (!handlers[event]) handlers[event] = []
      handlers[event].push(handler)
      return connection
    },
    emit(event: string, ...args: any[]) {
      handlers[event]?.forEach(handler => handler(...args))
    },
    receive(message: object) {
      connection.emit('data', JSON.stringify(message))
    },
    sent(): any[] {
      return connection.send.mock.calls.map((call: [string]) => JSON.parse(call[0]))
    },
    lastOfType(type: string): any {
      return [...connection.sent()].reverse().find(message => message.type === type)
    }
  }
  return connection
}

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

/** Independent HMAC implementation so the test does not trust the composable. */
const hmacHex = async (secretHex: string, nonce: string): Promise<string> => {
  const pairs = secretHex.match(/.{1,2}/g) ?? []
  const raw = new Uint8Array(pairs.map(byte => parseInt(byte, 16)))
  const key = await crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(nonce))
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('')
}

describe('useTrustedPeers', () => {
  let useTrustedPeers: typeof import('../../../app/composables/useTrustedPeers').useTrustedPeers

  beforeEach(async () => {
    localStorage.clear()
    vi.resetModules()
    const mod = await import('../../../app/composables/useTrustedPeers')
    useTrustedPeers = mod.useTrustedPeers
  })

  // -------------------------------------------------------------------------
  // Pairing
  // -------------------------------------------------------------------------
  describe('pairing', () => {
    it('approves a correct code and stores a shared secret', () => {
      const { attachConnection, localPairCode, isPaired, trustedPeers } = useTrustedPeers()
      localPairCode.value = '123456'

      const connection = createConnection('alice')
      attachConnection(connection)
      connection.receive({ type: 'pair-request', requestId: 'r1', targetCode: '123456', requesterCode: '654321' })

      const approve = connection.lastOfType('pair-approve')
      expect(approve).toBeDefined()
      expect(approve.secret).toMatch(/^[0-9a-f]{64}$/)
      expect(isPaired('alice')).toBe(true)
      expect(trustedPeers.value['alice']?.secret).toBe(approve.secret)
    })

    it('rotates the pair code once it has been used', () => {
      const { attachConnection, localPairCode } = useTrustedPeers()
      localPairCode.value = '123456'

      const connection = createConnection('alice')
      attachConnection(connection)
      connection.receive({ type: 'pair-request', requestId: 'r1', targetCode: '123456', requesterCode: '654321' })

      expect(localPairCode.value).not.toBe('123456')
      expect(localPairCode.value).toMatch(/^\d{6}$/)
    })

    it('rejects a wrong code without pairing', () => {
      const { attachConnection, localPairCode, isPaired } = useTrustedPeers()
      localPairCode.value = '123456'

      const connection = createConnection('mallory')
      attachConnection(connection)
      connection.receive({ type: 'pair-request', requestId: 'r1', targetCode: '000000', requesterCode: '654321' })

      expect(connection.lastOfType('pair-reject')).toBeDefined()
      expect(connection.lastOfType('pair-approve')).toBeUndefined()
      expect(isPaired('mallory')).toBe(false)
    })

    it('locks out a peer that keeps guessing', () => {
      const { attachConnection, localPairCode, isLockedOut, isPaired } = useTrustedPeers()
      localPairCode.value = '123456'

      const connection = createConnection('mallory')
      attachConnection(connection)

      for (let attempt = 0; attempt < 5; attempt++) {
        connection.receive({
          type: 'pair-request',
          requestId: `r${attempt}`,
          targetCode: String(100000 + attempt),
          requesterCode: '654321'
        })
      }

      expect(isLockedOut('mallory')).toBe(true)

      // Even the correct code is refused while locked out
      connection.receive({ type: 'pair-request', requestId: 'r-final', targetCode: '123456', requesterCode: '654321' })
      expect(isPaired('mallory')).toBe(false)
    })

    it('ignores a pair-approve that does not match a request we sent', () => {
      const { attachConnection, isPaired } = useTrustedPeers()
      const connection = createConnection('mallory')
      attachConnection(connection)

      connection.receive({
        type: 'pair-approve',
        requestId: 'never-sent',
        requesterCode: '111111',
        secret: 'a'.repeat(64)
      })

      expect(isPaired('mallory')).toBe(false)
    })

    it('rejects an approval echoing the wrong requester code', () => {
      const { attachConnection, requestPairing, localPairCode, isPaired } = useTrustedPeers()
      localPairCode.value = '111111'

      const connection = createConnection('bob')
      attachConnection(connection)
      requestPairing(connection, '222222')

      const request = connection.lastOfType('pair-request')
      connection.receive({
        type: 'pair-approve',
        requestId: request.requestId,
        requesterCode: '999999',
        secret: 'a'.repeat(64)
      })

      expect(isPaired('bob')).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // Proof of possession
  //
  // The whole point: holding a trusted peerId must not be enough.
  // -------------------------------------------------------------------------
  describe('trust verification', () => {
    const pairAlice = () => {
      const api = useTrustedPeers()
      api.localPairCode.value = '123456'
      const connection = createConnection('alice')
      api.attachConnection(connection)
      connection.receive({ type: 'pair-request', requestId: 'r1', targetCode: '123456', requesterCode: '654321' })
      return { api, secret: api.trustedPeers.value['alice']!.secret }
    }

    it('challenges a known peer when a new connection opens', () => {
      const { api } = pairAlice()
      api.reset()

      const reconnect = createConnection('alice')
      api.attachConnection(reconnect)

      expect(api.isVerified('alice')).toBe(false)
      expect(reconnect.lastOfType('trust-challenge')?.nonce).toMatch(/^[0-9a-f]{32}$/)
    })

    it('does not verify an impostor who cannot answer the challenge', async () => {
      const { api } = pairAlice()
      api.reset()

      const impostor = createConnection('alice')
      api.attachConnection(impostor)
      const challenge = impostor.lastOfType('trust-challenge')

      impostor.receive({ type: 'trust-response', nonce: challenge.nonce, proof: 'f'.repeat(64) })
      await flush()

      expect(api.isPaired('alice')).toBe(true)
      expect(api.isVerified('alice')).toBe(false)
    })

    it('verifies a peer that proves possession of the secret', async () => {
      const { api, secret } = pairAlice()
      api.reset()

      const reconnect = createConnection('alice')
      api.attachConnection(reconnect)
      const challenge = reconnect.lastOfType('trust-challenge')

      reconnect.receive({
        type: 'trust-response',
        nonce: challenge.nonce,
        proof: await hmacHex(secret, challenge.nonce)
      })
      await flush()

      expect(api.isVerified('alice')).toBe(true)
    })

    it('refuses a proof bound to a nonce we never issued', async () => {
      const { api, secret } = pairAlice()
      api.reset()

      const attacker = createConnection('alice')
      api.attachConnection(attacker)

      // Correctly formed for a *different* nonce — a replay from elsewhere.
      const foreignNonce = 'deadbeef'.repeat(4)
      attacker.receive({
        type: 'trust-response',
        nonce: foreignNonce,
        proof: await hmacHex(secret, foreignNonce)
      })
      await flush()

      expect(api.isVerified('alice')).toBe(false)
    })

    it('answers a challenge from a peer it has paired with', async () => {
      const { api, secret } = pairAlice()

      const connection = createConnection('alice')
      api.attachConnection(connection)
      connection.receive({ type: 'trust-challenge', nonce: 'abcdef00' })

      await vi.waitFor(() => expect(connection.lastOfType('trust-response')).toBeDefined())
      expect(connection.lastOfType('trust-response').proof).toBe(await hmacHex(secret, 'abcdef00'))
    })

    it('drops verification when the connection closes', async () => {
      const { api, secret } = pairAlice()
      api.reset()

      const connection = createConnection('alice')
      api.attachConnection(connection)
      const challenge = connection.lastOfType('trust-challenge')
      connection.receive({
        type: 'trust-response',
        nonce: challenge.nonce,
        proof: await hmacHex(secret, challenge.nonce)
      })
      await flush()
      expect(api.isVerified('alice')).toBe(true)

      connection.emit('close')
      expect(api.isVerified('alice')).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // Migration
  // -------------------------------------------------------------------------
  describe('legacy trust data', () => {
    it('discards peerId-only trust records from before secrets existed', async () => {
      localStorage.setItem('blink-trusted-peer-ids', JSON.stringify(['legacy-peer']))
      vi.resetModules()
      const mod = await import('../../../app/composables/useTrustedPeers')

      const { isPaired, isVerified } = mod.useTrustedPeers()

      expect(isPaired('legacy-peer')).toBe(false)
      expect(isVerified('legacy-peer')).toBe(false)
      expect(localStorage.getItem('blink-trusted-peer-ids')).toBeNull()
    })
  })
})
