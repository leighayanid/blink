import { ref, computed, type Ref } from 'vue'
import { useStorage } from '@vueuse/core'

/**
 * Trust between devices.
 *
 * A peerId is an address, not a credential: it is broadcast to everyone in the
 * signaling room on every announce, and anyone can register it with the PeerJS
 * broker once its owner is offline. Trusting a bare peerId therefore lets a
 * stranger inherit a trusted device's privileges — including silent file
 * acceptance.
 *
 * So pairing exchanges a shared secret over the (DTLS-encrypted) data channel,
 * and every later reconnection must prove possession of that secret before the
 * peer counts as trusted.
 */

export type TrustedPeer = {
  secret: string
  name?: string
  pairedAt: number
}

export type TrustEvent =
  | { type: 'paired'; peerId: string }
  | { type: 'verified'; peerId: string }
  | { type: 'pair-failed'; peerId: string; reason: string }
  | { type: 'locked-out'; peerId: string }

const PAIR_REQUEST_TIMEOUT_MS = 30_000
const MAX_PAIR_FAILURES = 5
const PAIR_FAILURE_WINDOW_MS = 10 * 60_000
const PAIR_LOCKOUT_MS = 15 * 60_000
const MIN_PAIR_REQUEST_INTERVAL_MS = 1_000

/**
 * Structural shape of a PeerJS DataConnection — loose enough to accept the real
 * one (whose `on` is generic over event names) and a plain test double.
 */
type PeerConnection = {
  peer: string
  open?: boolean
  send: (...args: any[]) => any
  on: (...args: any[]) => any
}

type FailureRecord = {
  count: number
  windowStartedAt: number
  lockedUntil: number
  lastAttemptAt: number
}

// ---------------------------------------------------------------------------
// Crypto helpers
// ---------------------------------------------------------------------------
const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')

const fromHex = (hex: string): ArrayBuffer => {
  const pairs = hex.match(/.{1,2}/g) ?? []
  const buffer = new ArrayBuffer(pairs.length)
  const view = new Uint8Array(buffer)
  pairs.forEach((byte, index) => {
    view[index] = parseInt(byte, 16)
  })
  return buffer
}

const randomHex = (byteLength: number): string =>
  toHex(crypto.getRandomValues(new Uint8Array(byteLength)))

export const generatePairCode = (): string => {
  // Rejection-sampled so every code is equally likely.
  const max = 900000
  const limit = Math.floor(0xffffffff / max) * max
  let value = 0
  do {
    value = crypto.getRandomValues(new Uint32Array(1))[0]!
  } while (value >= limit)
  return (100000 + (value % max)).toString()
}

export const normalizePairCode = (value: string): string =>
  value.replace(/\D/g, '').slice(0, 6)

const computeProof = async (secretHex: string, nonce: string): Promise<string> => {
  const key = await crypto.subtle.importKey(
    'raw',
    fromHex(secretHex),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(nonce))
  return toHex(new Uint8Array(signature))
}

/** Comparison whose timing does not depend on where the first difference is. */
const constantTimeEquals = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false
  let difference = 0
  for (let i = 0; i < a.length; i++) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return difference === 0
}

// ---------------------------------------------------------------------------
// Module-level singleton state
// ---------------------------------------------------------------------------
let trustedPeers: Ref<Record<string, TrustedPeer>> | null = null
let localPairCode: Ref<string> | null = null

const verifiedPeers = ref<Set<string>>(new Set())
const pairingPeers = ref<Set<string>>(new Set())
const failures = new Map<string, FailureRecord>()
const pendingRequests = new Map<string, { peerId: string; timeoutId: ReturnType<typeof setTimeout> }>()
const attachedConnections = new WeakSet<PeerConnection>()
const outstandingChallenges = new WeakMap<PeerConnection, string>()
const eventHandlers: Array<(event: TrustEvent) => void> = []

const ensureState = () => {
  if (!trustedPeers) {
    trustedPeers = useStorage<Record<string, TrustedPeer>>('blink-trusted-peers', {})
    // Entries from before secrets existed carry no proof material, so they
    // cannot be verified. Drop them rather than honouring a bare peerId.
    if (typeof localStorage !== 'undefined') localStorage.removeItem('blink-trusted-peer-ids')
  }
  if (!localPairCode) {
    localPairCode = useStorage<string>('blink-local-pair-code', generatePairCode())
    if (!/^\d{6}$/.test(localPairCode.value)) localPairCode.value = generatePairCode()
  }
  return { trustedPeers: trustedPeers!, localPairCode: localPairCode! }
}

const emit = (event: TrustEvent) => {
  eventHandlers.forEach(handler => handler(event))
}

const setPending = (peerId: string, pending: boolean) => {
  const next = new Set(pairingPeers.value)
  if (pending) next.add(peerId)
  else next.delete(peerId)
  pairingPeers.value = next
}

const setVerified = (peerId: string, verified: boolean) => {
  const next = new Set(verifiedPeers.value)
  if (verified) next.add(peerId)
  else next.delete(peerId)
  verifiedPeers.value = next
}

const getFailureRecord = (peerId: string): FailureRecord => {
  const existing = failures.get(peerId)
  if (existing) return existing

  const created: FailureRecord = {
    count: 0,
    windowStartedAt: Date.now(),
    lockedUntil: 0,
    lastAttemptAt: 0
  }
  failures.set(peerId, created)
  return created
}

const isLockedOut = (peerId: string): boolean => getFailureRecord(peerId).lockedUntil > Date.now()

/**
 * Throttle and lock out guesses. A six-digit code is only 10^6 wide, which a
 * data channel can exhaust in minutes if every attempt is free.
 */
const registerFailure = (peerId: string) => {
  const record = getFailureRecord(peerId)
  const currentTime = Date.now()

  if (currentTime - record.windowStartedAt > PAIR_FAILURE_WINDOW_MS) {
    record.windowStartedAt = currentTime
    record.count = 0
  }

  record.count++
  if (record.count >= MAX_PAIR_FAILURES) {
    record.lockedUntil = currentTime + PAIR_LOCKOUT_MS
    record.count = 0
    record.windowStartedAt = currentTime
    emit({ type: 'locked-out', peerId })
  }
}

const clearPendingRequest = (requestId: string) => {
  const pending = pendingRequests.get(requestId)
  if (!pending) return
  clearTimeout(pending.timeoutId)
  setPending(pending.peerId, false)
  pendingRequests.delete(requestId)
}

export const useTrustedPeers = () => {
  const { trustedPeers: peers, localPairCode: pairCode } = ensureState()

  const isPaired = (peerId?: string | null): boolean => !!peerId && !!peers.value[peerId]

  /** Paired *and* proved possession of the shared secret on this connection. */
  const isVerified = (peerId?: string | null): boolean =>
    !!peerId && verifiedPeers.value.has(peerId) && isPaired(peerId)

  const isPairing = (peerId?: string | null): boolean => !!peerId && pairingPeers.value.has(peerId)

  const rememberPeer = (peerId: string, secret: string, name?: string) => {
    peers.value = { ...peers.value, [peerId]: { secret, name, pairedAt: Date.now() } }
    setVerified(peerId, true)
    emit({ type: 'paired', peerId })
  }

  const forgetPeer = (peerId: string) => {
    const next = { ...peers.value }
    delete next[peerId]
    peers.value = next
    setVerified(peerId, false)
  }

  const regeneratePairCode = () => {
    pairCode.value = generatePairCode()
  }

  const sendChallenge = (connection: PeerConnection) => {
    if (!isPaired(connection.peer)) return
    const nonce = randomHex(16)
    outstandingChallenges.set(connection, nonce)
    try {
      connection.send(JSON.stringify({ type: 'trust-challenge', nonce }))
    } catch {}
  }

  /** Initiator side: ask `connection` to pair using the code shown on that device. */
  const requestPairing = (connection: PeerConnection, code: string): boolean => {
    const peerId = connection.peer

    if (isPaired(peerId)) {
      emit({ type: 'pair-failed', peerId, reason: 'Already paired' })
      return false
    }
    if (normalizePairCode(code).length !== 6) {
      emit({ type: 'pair-failed', peerId, reason: 'Enter the 6-digit code from the other device' })
      return false
    }
    if (isLockedOut(peerId)) {
      emit({ type: 'locked-out', peerId })
      return false
    }

    const requestId = `pair-${crypto.randomUUID()}`
    const timeoutId = setTimeout(() => {
      clearPendingRequest(requestId)
      emit({ type: 'pair-failed', peerId, reason: 'Pairing timed out' })
    }, PAIR_REQUEST_TIMEOUT_MS)

    pendingRequests.set(requestId, { peerId, timeoutId })
    setPending(peerId, true)

    connection.send(JSON.stringify({
      type: 'pair-request',
      requestId,
      targetCode: normalizePairCode(code),
      requesterCode: pairCode.value
    }))
    return true
  }

  const handlePairRequest = (connection: PeerConnection, message: Record<string, unknown>) => {
    const peerId = connection.peer
    const requestId = typeof message.requestId === 'string' ? message.requestId : ''
    const targetCode = typeof message.targetCode === 'string' ? normalizePairCode(message.targetCode) : ''
    const requesterCode = typeof message.requesterCode === 'string' ? normalizePairCode(message.requesterCode) : ''
    if (!requestId || requesterCode.length !== 6) return

    const record = getFailureRecord(peerId)
    const currentTime = Date.now()

    if (record.lockedUntil > currentTime) {
      connection.send(JSON.stringify({ type: 'pair-reject', requestId, reason: 'Too many attempts' }))
      return
    }

    // Rate-limit even well-formed attempts so a channel cannot be driven flat out.
    if (currentTime - record.lastAttemptAt < MIN_PAIR_REQUEST_INTERVAL_MS) {
      registerFailure(peerId)
      connection.send(JSON.stringify({ type: 'pair-reject', requestId, reason: 'Too many attempts' }))
      return
    }
    record.lastAttemptAt = currentTime

    if (!constantTimeEquals(targetCode, pairCode.value)) {
      registerFailure(peerId)
      connection.send(JSON.stringify({ type: 'pair-reject', requestId, reason: 'Invalid pairing code' }))
      return
    }

    const secret = randomHex(32)
    rememberPeer(peerId, secret)
    failures.delete(peerId)

    connection.send(JSON.stringify({
      type: 'pair-approve',
      requestId,
      requesterCode,
      secret
    }))

    // The code has served its purpose; a fresh one limits replay of a code the
    // user may have shown on screen or read aloud.
    regeneratePairCode()
  }

  const handlePairApprove = (connection: PeerConnection, message: Record<string, unknown>) => {
    const requestId = typeof message.requestId === 'string' ? message.requestId : ''
    const requesterCode = typeof message.requesterCode === 'string' ? normalizePairCode(message.requesterCode) : ''
    const secret = typeof message.secret === 'string' ? message.secret : ''

    const pending = pendingRequests.get(requestId)
    if (!requestId || !pending || pending.peerId !== connection.peer) return

    clearPendingRequest(requestId)

    if (!constantTimeEquals(requesterCode, pairCode.value) || !/^[0-9a-f]{64}$/.test(secret)) {
      emit({ type: 'pair-failed', peerId: connection.peer, reason: 'Could not verify the other device' })
      return
    }

    rememberPeer(connection.peer, secret)
  }

  const handlePairReject = (connection: PeerConnection, message: Record<string, unknown>) => {
    const requestId = typeof message.requestId === 'string' ? message.requestId : ''
    const reason = typeof message.reason === 'string' ? message.reason : 'Pairing was rejected'
    const pending = pendingRequests.get(requestId)
    if (!requestId || !pending || pending.peerId !== connection.peer) return

    clearPendingRequest(requestId)
    emit({ type: 'pair-failed', peerId: connection.peer, reason })
  }

  const handleChallenge = async (connection: PeerConnection, message: Record<string, unknown>) => {
    const nonce = typeof message.nonce === 'string' ? message.nonce : ''
    const entry = peers.value[connection.peer]
    if (!nonce || !entry) return

    const proof = await computeProof(entry.secret, nonce)
    try {
      connection.send(JSON.stringify({ type: 'trust-response', nonce, proof }))
    } catch {}
  }

  const handleChallengeResponse = async (connection: PeerConnection, message: Record<string, unknown>) => {
    const nonce = typeof message.nonce === 'string' ? message.nonce : ''
    const proof = typeof message.proof === 'string' ? message.proof : ''
    const entry = peers.value[connection.peer]
    if (!nonce || !proof || !entry) return

    // Only answer the challenge we actually issued, once. Otherwise a proof
    // captured elsewhere could be replayed with its own nonce.
    const expectedNonce = outstandingChallenges.get(connection)
    if (!expectedNonce || !constantTimeEquals(expectedNonce, nonce)) return
    outstandingChallenges.delete(connection)

    const expected = await computeProof(entry.secret, nonce)
    if (!constantTimeEquals(expected, proof)) {
      // Someone holds the address but not the secret.
      setVerified(connection.peer, false)
      emit({ type: 'pair-failed', peerId: connection.peer, reason: 'Device failed trust verification' })
      return
    }

    if (!verifiedPeers.value.has(connection.peer)) {
      setVerified(connection.peer, true)
      emit({ type: 'verified', peerId: connection.peer })
    }
  }

  /** Wire trust handling onto a data connection and challenge it if we know it. */
  const attachConnection = (connection: PeerConnection) => {
    if (attachedConnections.has(connection)) return
    attachedConnections.add(connection)

    setVerified(connection.peer, false)

    connection.on('data', (data: unknown) => {
      if (typeof data !== 'string') return

      let message: Record<string, unknown>
      try {
        message = JSON.parse(data)
      } catch {
        return
      }

      switch (message.type) {
        case 'pair-request': return handlePairRequest(connection, message)
        case 'pair-approve': return handlePairApprove(connection, message)
        case 'pair-reject': return handlePairReject(connection, message)
        case 'trust-challenge': return void handleChallenge(connection, message)
        case 'trust-response': return void handleChallengeResponse(connection, message)
      }
    })

    connection.on('close', () => {
      setVerified(connection.peer, false)
      for (const [requestId, pending] of pendingRequests.entries()) {
        if (pending.peerId === connection.peer) clearPendingRequest(requestId)
      }
    })

    sendChallenge(connection)
  }

  const onTrustEvent = (handler: (event: TrustEvent) => void) => {
    eventHandlers.push(handler)
  }

  const reset = () => {
    for (const requestId of Array.from(pendingRequests.keys())) clearPendingRequest(requestId)
    verifiedPeers.value = new Set()
    pairingPeers.value = new Set()
    failures.clear()
    eventHandlers.length = 0
  }

  return {
    trustedPeers: peers,
    localPairCode: pairCode,
    verifiedPeerIds: computed(() => verifiedPeers.value),
    isPaired,
    isVerified,
    isPairing,
    isLockedOut,
    rememberPeer,
    forgetPeer,
    regeneratePairCode,
    requestPairing,
    attachConnection,
    onTrustEvent,
    reset
  }
}
