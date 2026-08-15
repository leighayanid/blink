import type { SignalingMessage, Device } from '@blink/types'

type WebSocketPeer = {
  id: string
  send: (message: string) => void
  close?: (code?: number, reason?: string) => void
  request?: {
    url?: string
    headers?: Headers | Record<string, string | string[] | undefined>
    socket?: {
      remoteAddress?: string
    }
  }
}

type AnnouncedDevice = Device & {
  peerId: string
  wsId: string
  roomId: string
  lastSeen: number
}

/**
 * Token bucket. Unlike a fixed window it cannot be gamed by straddling the
 * window boundary, so the effective ceiling is the configured rate rather than
 * twice it.
 */
type TokenBucket = {
  tokens: number
  lastRefill: number
}

type PeerMeta = {
  ip: string
  roomId: string
  connectedAt: number
  lastSeen: number
  strikes: number
  messageBucket: TokenBucket
  announceBucket: TokenBucket
}

/**
 * Per-IP state. This deliberately outlives the socket: limits keyed only to a
 * connection are reset by reconnecting, which makes them decorative.
 */
type IpState = {
  connections: number
  messageBucket: TokenBucket
  connectionBucket: TokenBucket
  blockedUntil: number
  lastSeen: number
}

const DEFAULT_ROOM_ID = 'local'
const MAX_CONNECTIONS = Number(process.env.SIGNALING_MAX_CONNECTIONS ?? 200)
const MAX_CONNECTIONS_PER_IP = Number(process.env.SIGNALING_MAX_CONNECTIONS_PER_IP ?? 20)
const MAX_MESSAGES_PER_WINDOW = Number(process.env.SIGNALING_MAX_MESSAGES_PER_WINDOW ?? 120)
const MESSAGE_WINDOW_MS = Number(process.env.SIGNALING_MESSAGE_WINDOW_MS ?? 60_000)
const MAX_MESSAGE_BYTES = Number(process.env.SIGNALING_MAX_MESSAGE_BYTES ?? 16 * 1024)
const MAX_ANNOUNCED_DEVICES = Number(process.env.SIGNALING_MAX_ANNOUNCED_DEVICES ?? 500)
const DEVICE_TTL_MS = Number(process.env.SIGNALING_DEVICE_TTL_MS ?? 2 * 60_000)
const HEARTBEAT_TIMEOUT_MS = Number(process.env.SIGNALING_HEARTBEAT_TIMEOUT_MS ?? 90_000)
const CLEANUP_INTERVAL_MS = Number(process.env.SIGNALING_CLEANUP_INTERVAL_MS ?? 30_000)
const REQUIRED_ACCESS_TOKEN = process.env.SIGNALING_ACCESS_TOKEN || ''

// Budget shared by every socket from one IP, so reconnecting does not refill it.
// Higher than the per-socket budget because a NATed household shares one IP.
const MAX_MESSAGES_PER_WINDOW_PER_IP = Number(process.env.SIGNALING_MAX_MESSAGES_PER_WINDOW_PER_IP ?? 600)
const MAX_CONNECTIONS_PER_WINDOW_PER_IP = Number(process.env.SIGNALING_MAX_CONNECTIONS_PER_WINDOW_PER_IP ?? 30)
const IP_BLOCK_MS = Number(process.env.SIGNALING_IP_BLOCK_MS ?? 60_000)
const IP_STATE_TTL_MS = Number(process.env.SIGNALING_IP_STATE_TTL_MS ?? 10 * 60_000)
const MAX_ANNOUNCES_PER_WINDOW = Number(process.env.SIGNALING_MAX_ANNOUNCES_PER_WINDOW ?? 5)

/**
 * How many proxies sit in front of this process. X-Forwarded-For is appended to
 * by each hop, so only the rightmost `n` entries are trustworthy — the leftmost
 * is whatever the client sent. Must be 0 when exposed directly.
 */
const TRUSTED_PROXY_HOPS = Number(process.env.SIGNALING_TRUSTED_PROXY_HOPS ?? 1)

// Explicit allowlist for browser origins. When empty, same-origin is required.
const ALLOWED_ORIGINS = (process.env.SIGNALING_ALLOWED_ORIGINS || '')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean)

// Store announced devices. Key is PeerJS peerId.
const announcedDevices = new Map<string, AnnouncedDevice>()

// Store active WebSocket connections for broadcasting.
const connectedPeers = new Map<string, WebSocketPeer>()
const peerMeta = new Map<string, PeerMeta>()
const ipStates = new Map<string, IpState>()

let cleanupInterval: ReturnType<typeof setInterval> | null = null

const now = () => Date.now()

const createBucket = (capacity: number, currentTime = now()): TokenBucket => ({
  tokens: capacity,
  lastRefill: currentTime
})

/** Refill by elapsed time and spend one token. Returns false when empty. */
const takeToken = (
  bucket: TokenBucket,
  capacity: number,
  windowMs: number,
  currentTime = now()
): boolean => {
  const refillPerMs = capacity / windowMs
  const elapsed = Math.max(0, currentTime - bucket.lastRefill)
  bucket.tokens = Math.min(capacity, bucket.tokens + elapsed * refillPerMs)
  bucket.lastRefill = currentTime

  if (bucket.tokens < 1) return false
  bucket.tokens -= 1
  return true
}

const getHeader = (peer: WebSocketPeer, headerName: string): string | undefined => {
  const headers = peer.request?.headers
  if (!headers) return undefined

  if (typeof (headers as Headers).get === 'function') {
    return (headers as Headers).get(headerName) ?? undefined
  }

  const lowerHeaderName = headerName.toLowerCase()
  const value = Object.entries(headers).find(([key]) => key.toLowerCase() === lowerHeaderName)?.[1]
  if (Array.isArray(value)) return value[0]
  return value
}

/**
 * Resolve the client IP from the rightmost trusted hop. Reading the leftmost
 * entry instead lets a client pick its own identity and walk straight past
 * every per-IP limit.
 */
const getPeerIp = (peer: WebSocketPeer): string => {
  const socketAddress = peer.request?.socket?.remoteAddress

  if (TRUSTED_PROXY_HOPS > 0) {
    const forwardedFor = getHeader(peer, 'x-forwarded-for')
    if (forwardedFor) {
      const hops = forwardedFor.split(',').map(value => value.trim()).filter(Boolean)
      // With n trusted proxies the client address is n entries from the right.
      const index = Math.max(0, hops.length - TRUSTED_PROXY_HOPS)
      const resolved = hops[index]
      if (resolved) return resolved
    }

    const realIp = getHeader(peer, 'x-real-ip')
    if (realIp) return realIp
  }

  return socketAddress || 'unknown'
}

/**
 * Reject cross-site WebSocket handshakes. A missing Origin means a non-browser
 * client (the Flutter app, a CLI), which cannot be a cross-site request.
 */
const isOriginAllowed = (peer: WebSocketPeer): boolean => {
  const origin = getHeader(peer, 'origin')
  if (!origin) return true

  if (ALLOWED_ORIGINS.length > 0) return ALLOWED_ORIGINS.includes(origin)

  const host = getHeader(peer, 'host')
  if (!host) return false

  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

const getRequestUrl = (peer: WebSocketPeer): URL | null => {
  try {
    return new URL(peer.request?.url || '/ws', 'ws://localhost')
  } catch {
    return null
  }
}

const normalizeRoomId = (value: unknown): string => {
  if (typeof value !== 'string') return DEFAULT_ROOM_ID
  const normalized = value.trim().slice(0, 64)
  return normalized || DEFAULT_ROOM_ID
}

const getRoomId = (peer: WebSocketPeer): string => {
  const requestUrl = getRequestUrl(peer)
  return normalizeRoomId(requestUrl?.searchParams.get('room') ?? getHeader(peer, 'x-blink-room'))
}

const getAccessToken = (peer: WebSocketPeer): string => {
  const requestUrl = getRequestUrl(peer)
  return requestUrl?.searchParams.get('token')
    || getHeader(peer, 'x-blink-token')
    || ''
}

const getIpState = (ip: string, currentTime = now()): IpState => {
  const existing = ipStates.get(ip)
  if (existing) {
    existing.lastSeen = currentTime
    return existing
  }

  const created: IpState = {
    connections: 0,
    messageBucket: createBucket(MAX_MESSAGES_PER_WINDOW_PER_IP, currentTime),
    connectionBucket: createBucket(MAX_CONNECTIONS_PER_WINDOW_PER_IP, currentTime),
    blockedUntil: 0,
    lastSeen: currentTime
  }
  ipStates.set(ip, created)
  return created
}

const blockIp = (ip: string, reason: string) => {
  const state = getIpState(ip)
  state.blockedUntil = now() + IP_BLOCK_MS
  console.warn('[WebSocket] Blocking IP:', ip, reason)
}

const rejectPeer = (peer: WebSocketPeer, reason: string, code = 1008) => {
  console.warn('[WebSocket] Rejecting peer:', peer.id, reason)
  try {
    peer.send(JSON.stringify({ type: 'error', reason }))
  } catch {}
  peer.close?.(code, reason)
}

const removeConnectionById = (wsId: string) => {
  const meta = peerMeta.get(wsId)
  connectedPeers.delete(wsId)
  peerMeta.delete(wsId)

  if (!meta) return

  const state = ipStates.get(meta.ip)
  if (state) state.connections = Math.max(0, state.connections - 1)
}

const removeConnection = (peer: WebSocketPeer) => {
  removeConnectionById(peer.id)
}

/** Validate and sanitize an incoming deviceInfo object. Returns null if invalid. */
function sanitizeDeviceInfo(raw: unknown): (Device & { peerId: string }) | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const d = raw as Record<string, unknown>

  const id = typeof d.id === 'string' ? d.id.slice(0, 64) : null
  const name = typeof d.name === 'string' ? d.name.slice(0, 128) : null
  const platform = typeof d.platform === 'string' ? d.platform.slice(0, 32) : 'Unknown'
  const peerId = typeof d.peerId === 'string' ? d.peerId.slice(0, 128) : null
  const timestamp = typeof d.timestamp === 'number' ? d.timestamp : now()

  if (!id || !name || !peerId) return null

  return { id, name, platform, peerId, timestamp }
}

const deviceIsFresh = (device: AnnouncedDevice, currentTime = now()) =>
  currentTime - device.lastSeen <= DEVICE_TTL_MS

const pruneIpStates = (currentTime: number) => {
  for (const [ip, state] of ipStates.entries()) {
    if (state.connections > 0) continue
    if (state.blockedUntil > currentTime) continue
    if (currentTime - state.lastSeen <= IP_STATE_TTL_MS) continue
    ipStates.delete(ip)
  }
}

const cleanupStaleDevices = () => {
  const currentTime = now()

  for (const [wsId, meta] of peerMeta.entries()) {
    if (currentTime - meta.lastSeen <= HEARTBEAT_TIMEOUT_MS) continue

    const peer = connectedPeers.get(wsId)
    console.warn('[WebSocket] Closing stale peer:', wsId)
    peer?.close?.(1001, 'Heartbeat timeout')
    removeConnectionById(wsId)
    removeAnnouncedDevicesForWs(wsId, meta.roomId)
  }

  for (const [peerId, device] of announcedDevices.entries()) {
    if (!deviceIsFresh(device, currentTime) || !connectedPeers.has(device.wsId)) {
      announcedDevices.delete(peerId)
      broadcastToRoom(device.roomId, JSON.stringify({
        type: 'peer-left',
        peerId
      }), device.wsId)
    }
  }

  pruneIpStates(currentTime)
}

const ensureCleanupInterval = () => {
  if (cleanupInterval) return
  cleanupInterval = setInterval(cleanupStaleDevices, CLEANUP_INTERVAL_MS)
  cleanupInterval.unref?.()
}

const incrementStrike = (peer: WebSocketPeer, reason: string) => {
  const meta = peerMeta.get(peer.id)
  if (!meta) return
  meta.strikes++
  console.warn('[WebSocket] Policy strike:', peer.id, reason)
  if (meta.strikes >= 3) {
    const { ip } = meta
    removeConnection(peer)
    removeAnnouncedDevicesForWs(peer.id, meta.roomId)
    blockIp(ip, 'repeated policy violations')
    rejectPeer(peer, 'Too many invalid messages', 1008)
  }
}

const checkRateLimit = (peer: WebSocketPeer): boolean => {
  const meta = peerMeta.get(peer.id)
  if (!meta) return false

  const currentTime = now()
  meta.lastSeen = currentTime

  const ipState = getIpState(meta.ip, currentTime)

  // Per-IP budget first: it is the one an attacker cannot reset by reconnecting.
  if (!takeToken(ipState.messageBucket, MAX_MESSAGES_PER_WINDOW_PER_IP, MESSAGE_WINDOW_MS, currentTime)) {
    const { ip, roomId } = meta
    removeConnection(peer)
    removeAnnouncedDevicesForWs(peer.id, roomId)
    blockIp(ip, 'message rate limit exceeded')
    rejectPeer(peer, 'Rate limit exceeded', 1008)
    return false
  }

  if (!takeToken(meta.messageBucket, MAX_MESSAGES_PER_WINDOW, MESSAGE_WINDOW_MS, currentTime)) {
    const { roomId } = meta
    removeConnection(peer)
    removeAnnouncedDevicesForWs(peer.id, roomId)
    rejectPeer(peer, 'Rate limit exceeded', 1008)
    return false
  }

  return true
}

const canAddAnnouncedDevice = (deviceInfo: Device & { peerId: string }) => {
  if (announcedDevices.has(deviceInfo.peerId)) return true
  return announcedDevices.size < MAX_ANNOUNCED_DEVICES
}

/** Broadcast a message to all connected peers in a room except an optional exclusion. */
function broadcastToRoom(roomId: string, message: string, excludeWsId?: string) {
  for (const [wsId, peer] of connectedPeers.entries()) {
    const meta = peerMeta.get(wsId)
    if (wsId === excludeWsId || meta?.roomId !== roomId) continue
    try {
      peer.send(message)
    } catch (err) {
      console.error('[WebSocket] Failed to send to peer:', err)
    }
  }
}

const removeAnnouncedDevicesForWs = (wsId: string, roomId: string) => {
  for (const [peerId, deviceInfo] of announcedDevices.entries()) {
    if (deviceInfo.wsId !== wsId) continue

    announcedDevices.delete(peerId)
    broadcastToRoom(roomId, JSON.stringify({
      type: 'peer-left',
      peerId
    }), wsId)
  }
}

const sendExistingDevices = (peer: WebSocketPeer, roomId: string) => {
  const currentTime = now()
  for (const [, deviceInfo] of announcedDevices.entries()) {
    if (deviceInfo.roomId !== roomId || !deviceIsFresh(deviceInfo, currentTime)) continue
    const { wsId: _wsId, roomId: _roomId, lastSeen: _lastSeen, ...publicDeviceInfo } = deviceInfo
    peer.send(JSON.stringify({
      type: 'peer-joined',
      deviceInfo: publicDeviceInfo
    }))
  }
}

const routeToTargetPeer = (
  peer: WebSocketPeer,
  parsed: SignalingMessage,
  messageFactory: (target: AnnouncedDevice) => string
) => {
  if (!parsed.targetPeer || typeof parsed.targetPeer !== 'string') {
    incrementStrike(peer, 'missing targetPeer')
    return
  }

  const senderMeta = peerMeta.get(peer.id)
  const targetEntry = announcedDevices.get(parsed.targetPeer)
  if (!senderMeta || !targetEntry || targetEntry.roomId !== senderMeta.roomId) {
    console.warn('[WebSocket] Signal target not found:', parsed.targetPeer)
    return
  }

  const targetSocket = connectedPeers.get(targetEntry.wsId)
  if (!targetSocket) {
    console.warn('[WebSocket] Target peer socket not connected:', parsed.targetPeer)
    return
  }

  targetSocket.send(messageFactory(targetEntry))
}

/**
 * UTF-8 byte length, not UTF-16 code units. `String.length` undercounts
 * multi-byte text by 2-3x, so a "16 KB" cap would pass a 48 KB payload.
 * The early return keeps us from encoding an oversized string just to measure it.
 */
const exceedsMessageByteLimit = (data: string): boolean => {
  if (data.length > MAX_MESSAGE_BYTES) return true
  return new TextEncoder().encode(data).length > MAX_MESSAGE_BYTES
}

export default defineWebSocketHandler({
  open(peer: WebSocketPeer) {
    ensureCleanupInterval()
    cleanupStaleDevices()

    const currentTime = now()
    const ip = getPeerIp(peer)
    const roomId = getRoomId(peer)
    const token = getAccessToken(peer)
    const ipState = getIpState(ip, currentTime)

    if (!isOriginAllowed(peer)) {
      rejectPeer(peer, 'Origin not allowed')
      return
    }

    if (REQUIRED_ACCESS_TOKEN && token !== REQUIRED_ACCESS_TOKEN) {
      rejectPeer(peer, 'Invalid signaling access token')
      return
    }

    if (ipState.blockedUntil > currentTime) {
      rejectPeer(peer, 'Temporarily blocked for abuse', 1008)
      return
    }

    // Cap the connection *rate*, not just concurrency — otherwise a client can
    // shed a rate-limited socket and immediately open a fresh one.
    if (!takeToken(ipState.connectionBucket, MAX_CONNECTIONS_PER_WINDOW_PER_IP, MESSAGE_WINDOW_MS, currentTime)) {
      blockIp(ip, 'connection rate limit exceeded')
      rejectPeer(peer, 'Too many connection attempts', 1008)
      return
    }

    if (connectedPeers.size >= MAX_CONNECTIONS) {
      rejectPeer(peer, 'Signaling server is at capacity', 1013)
      return
    }

    if (ipState.connections >= MAX_CONNECTIONS_PER_IP) {
      rejectPeer(peer, 'Too many connections from this network', 1008)
      return
    }

    console.log('[WebSocket] Client connected:', peer.id)
    connectedPeers.set(peer.id, peer)
    ipState.connections++
    peerMeta.set(peer.id, {
      ip,
      roomId,
      connectedAt: currentTime,
      lastSeen: currentTime,
      strikes: 0,
      messageBucket: createBucket(MAX_MESSAGES_PER_WINDOW, currentTime),
      announceBucket: createBucket(MAX_ANNOUNCES_PER_WINDOW, currentTime)
    })

    peer.send(JSON.stringify({
      type: 'init',
      peerId: peer.id,
      roomId
    }))

    sendExistingDevices(peer, roomId)
  },

  message(peer: WebSocketPeer, message) {
    try {
      const data = message.text()
      if (typeof data !== 'string') return

      if (exceedsMessageByteLimit(data)) {
        incrementStrike(peer, 'message too large')
        return
      }

      if (!checkRateLimit(peer)) return

      const parsed: SignalingMessage = JSON.parse(data)
      const senderMeta = peerMeta.get(peer.id)
      if (!senderMeta) return

      console.log('[WebSocket] Message received:', parsed.type)

      switch (parsed.type) {
        case 'announce': {
          const deviceInfo = sanitizeDeviceInfo(parsed.deviceInfo)
          if (!deviceInfo) {
            console.warn('[WebSocket] Rejecting malformed announce from', peer.id)
            incrementStrike(peer, 'malformed announce')
            break
          }

          // Announce fans out to the whole room, so it is the cheapest
          // amplification primitive here. Keep it on a tight leash.
          if (!takeToken(senderMeta.announceBucket, MAX_ANNOUNCES_PER_WINDOW, MESSAGE_WINDOW_MS)) {
            console.warn('[WebSocket] Announce rate limit hit:', peer.id)
            incrementStrike(peer, 'announce rate limit')
            break
          }

          // A peerId is an addressing token: whoever holds it receives every
          // signal routed to it. Without this check any client can claim
          // another's id and take over its relay, impersonate it in device
          // lists, and evict it on disconnect.
          const currentOwner = announcedDevices.get(deviceInfo.peerId)
          if (currentOwner && currentOwner.wsId !== peer.id && connectedPeers.has(currentOwner.wsId)) {
            console.warn('[WebSocket] Rejecting peerId claim, already owned:', deviceInfo.peerId)
            incrementStrike(peer, 'peerId already claimed')
            try {
              peer.send(JSON.stringify({ type: 'error', reason: 'Peer ID already in use' }))
            } catch {}
            break
          }

          if (!canAddAnnouncedDevice(deviceInfo)) {
            rejectPeer(peer, 'Too many announced devices', 1013)
            break
          }

          console.log('[WebSocket] Device announced:', deviceInfo.name, 'peerId:', deviceInfo.peerId)

          // A socket only ever has one current peerId. If it re-announces under
          // a different one (its broker ID changed after a retry or reconnect),
          // retire the previous entry — otherwise peers keep seeing a stale
          // device they can never dial.
          for (const [existingPeerId, existing] of announcedDevices.entries()) {
            if (existing.wsId !== peer.id || existingPeerId === deviceInfo.peerId) continue

            announcedDevices.delete(existingPeerId)
            broadcastToRoom(existing.roomId, JSON.stringify({
              type: 'peer-left',
              peerId: existingPeerId
            }))
          }

          announcedDevices.set(deviceInfo.peerId, {
            ...deviceInfo,
            wsId: peer.id,
            roomId: senderMeta.roomId,
            lastSeen: now()
          })

          const peerJoinedMsg = JSON.stringify({
            type: 'peer-joined',
            deviceInfo
          })
          broadcastToRoom(senderMeta.roomId, peerJoinedMsg)
          break
        }

        case 'signal': {
          routeToTargetPeer(peer, parsed, () => JSON.stringify({
            type: 'signal',
            signal: parsed.signal,
            fromPeer: peer.id
          }))
          break
        }

        case 'offer':
        case 'answer':
        case 'ice-candidate': {
          routeToTargetPeer(peer, parsed, () => JSON.stringify({
            ...parsed,
            fromPeer: peer.id
          }))
          break
        }

        case 'heartbeat': {
          const currentTime = now()
          senderMeta.lastSeen = currentTime
          for (const device of announcedDevices.values()) {
            if (device.wsId === peer.id) {
              device.lastSeen = currentTime
            }
          }
          peer.send(JSON.stringify({ type: 'heartbeat-ack', at: currentTime }))
          break
        }
      }
    } catch (error) {
      console.error('[WebSocket] Error handling message:', error)
      incrementStrike(peer, 'invalid json')
    }
  },

  close(peer: WebSocketPeer) {
    console.log('[WebSocket] Client disconnected:', peer.id)
    const meta = peerMeta.get(peer.id)
    removeConnection(peer)
    if (meta) removeAnnouncedDevicesForWs(peer.id, meta.roomId)
  },

  error(peer: WebSocketPeer, error) {
    console.error('[WebSocket] Error:', error)
  }
})
