import { ref } from 'vue'
import Peer, { type DataConnection } from 'peerjs'

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error'

// ---------------------------------------------------------------------------
// Module-level singleton state — shared across all calls to useWebRTC
// ---------------------------------------------------------------------------
const peer = ref<Peer | null>(null)
const connections = ref<Map<string, DataConnection>>(new Map())
const connectionStates = ref<Map<string, ConnectionState>>(new Map())
const localPeerId = ref<string>('')
const peerError = ref<string | null>(null)
const shouldReconnect = ref(true)

const PEER_INIT_MAX_ATTEMPTS = 3
const PEER_INIT_RETRY_DELAY_MS = 1500

type PeerJsError = Error & { type?: string }

// PeerJS conditions that a fresh attempt can plausibly recover from. Anything
// else (including a plain Error with no `type`) is treated as terminal so we
// surface it instead of retrying forever.
const RETRYABLE_PEER_ERRORS = new Set([
  'unavailable-id',
  'network',
  'server-error',
  'socket-error',
  'socket-closed'
])

let initRetryTimer: ReturnType<typeof setTimeout> | null = null

// The `peer` ref hands back a reactive proxy, so it cannot be identity-compared
// against the instance a handler closed over. Track the raw current instance
// here so superseded peers can tell they are no longer in charge.
let currentPeerInstance: Peer | null = null

// Callbacks fired synchronously whenever a new DataConnection is established
// (both outgoing-opened and incoming). Register via onConnection().
const connectionCallbacks: Array<(conn: DataConnection) => void> = []

// Callbacks fired every time the peer opens against the broker — including
// after a retry or a reconnect, when the broker may hand us a different ID.
// Register via onPeerOpen().
const peerOpenCallbacks: Array<(peerId: string) => void> = []

const setConnectionState = (peerId: string, state: ConnectionState): void => {
  connectionStates.value.set(peerId, state)
  console.log('[WebRTC] Connection state changed:', peerId, '->', state)
}

const getConnectionState = (peerId: string): ConnectionState | undefined => {
  return connectionStates.value.get(peerId)
}

const handleConnection = (conn: DataConnection) => {
  connections.value.set(conn.peer, conn)
  setConnectionState(conn.peer, 'connected')

  // Fire all registered callbacks immediately so handlers (e.g. receiveFile)
  // are wired before any buffered data events fire.
  connectionCallbacks.forEach(cb => cb(conn))

  conn.on('close', () => {
    console.log('[WebRTC] Connection closed with', conn.peer)
    connections.value.delete(conn.peer)
    setConnectionState(conn.peer, 'disconnected')
  })

  conn.on('error', (error: unknown) => {
    console.error('[WebRTC] Connection error with', conn.peer, error)
    connections.value.delete(conn.peer)
    setConnectionState(conn.peer, 'error')
  })
}

const clearInitRetry = () => {
  if (!initRetryTimer) return
  clearTimeout(initRetryTimer)
  initRetryTimer = null
}

const attemptPeerInit = (deviceId: string | undefined, attempt: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Once the broker has opened the peer, `error` events describe a single
    // failed operation (typically 'peer-unavailable' from a dial), not a
    // failed initialization. They must never settle this promise.
    let isOpen = false

    const fail = (error: PeerJsError) => {
      peerError.value = error.message || `Peer error: ${error.type ?? 'unknown'}`
      reject(error)
    }

    const retry = (error: PeerJsError, nextDeviceId: string | undefined) => {
      // Tear the half-open peer down so the broker releases the ID before we
      // ask for it again.
      try {
        peer.value?.destroy()
      } catch {}
      peer.value = null
      currentPeerInstance = null

      if (attempt >= PEER_INIT_MAX_ATTEMPTS) {
        fail(error)
        return
      }

      console.warn(`[WebRTC] Peer init failed (${error.type ?? 'unknown'}), retrying attempt ${attempt + 1}/${PEER_INIT_MAX_ATTEMPTS}`)
      clearInitRetry()
      initRetryTimer = setTimeout(() => {
        initRetryTimer = null
        if (!shouldReconnect.value) {
          reject(error)
          return
        }
        attemptPeerInit(nextDeviceId, attempt + 1).then(resolve, reject)
      }, PEER_INIT_RETRY_DELAY_MS)
    }

    try {
      const instance = new Peer(deviceId as string, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        },
        debug: 2
      })
      peer.value = instance
      currentPeerInstance = instance

      instance.on('open', (id) => {
        console.log('[WebRTC] Peer initialized with ID:', id)
        isOpen = true
        localPeerId.value = id
        peerError.value = null
        // Fires on reconnects too, so discovery can re-announce the ID.
        peerOpenCallbacks.forEach(cb => cb(id))
        resolve(id)
      })

      instance.on('connection', (conn: DataConnection) => {
        console.log('[WebRTC] Incoming connection from:', conn.peer)
        setConnectionState(conn.peer, 'connecting')
        // Wait for the connection to open before registering handlers
        conn.on('open', () => {
          handleConnection(conn)
        })
      })

      instance.on('error', (error: PeerJsError) => {
        console.error('[WebRTC] Peer error:', error)

        if (isOpen) {
          // e.g. 'peer-unavailable' when dialling a device that has gone away.
          // connectToPeer() surfaces that on its own connection promise.
          return
        }

        if (error.type === 'unavailable-id') {
          // The broker still holds the ID we persisted in a previous session
          // (refresh, second tab, or a mobile tab whose socket was not reaped
          // yet). Retry with the same ID first — it is usually released within
          // seconds — then fall back to a broker-generated ID on the last
          // attempt so this device is never permanently undiscoverable.
          const isLastRetry = attempt + 1 >= PEER_INIT_MAX_ATTEMPTS
          retry(error, isLastRetry ? undefined : deviceId)
          return
        }

        if (error.type && RETRYABLE_PEER_ERRORS.has(error.type)) {
          retry(error, deviceId)
          return
        }

        fail(error)
      })

      instance.on('disconnected', () => {
        console.log('[WebRTC] Peer disconnected')
        // A retry may have already replaced this instance; only the current
        // one should try to come back.
        if (shouldReconnect.value && currentPeerInstance === instance) {
          console.log('[WebRTC] Attempting to reconnect peer...')
          instance.reconnect()
        } else {
          console.log('[WebRTC] Reconnect disabled, staying disconnected')
        }
      })
    } catch (error) {
      console.error('[WebRTC] Failed to initialize peer:', error)
      fail(error as PeerJsError)
    }
  })
}

const initPeer = (deviceId?: string): Promise<string> => {
  shouldReconnect.value = true
  peerError.value = null
  clearInitRetry()
  return attemptPeerInit(deviceId, 1)
}

const onPeerOpen = (callback: (peerId: string) => void) => {
  peerOpenCallbacks.push(callback)
}

const connectToPeer = (peerId: string): Promise<DataConnection> => {
  return new Promise((resolve, reject) => {
    if (!peer.value) {
      reject(new Error('Peer not initialized'))
      return
    }

    console.log('[WebRTC] Connecting to peer:', peerId, '(local:', peer.value.id, ')')
    setConnectionState(peerId, 'connecting')

    try {
      const conn = peer.value.connect(peerId, {
        reliable: true,
        serialization: 'binary'
      })

      const timeout = setTimeout(() => {
        console.error('[WebRTC] Connection timeout after 10 seconds')
        setConnectionState(peerId, 'error')
        reject(new Error('Connection timeout — peer may be offline or unreachable'))
      }, 10000)

      conn.on('open', () => {
        clearTimeout(timeout)
        console.log('[WebRTC] Connection OPENED with peer:', conn.peer)
        handleConnection(conn)
        resolve(conn)
      })

      conn.on('error', (error: unknown) => {
        clearTimeout(timeout)
        console.error('[WebRTC] Connection error:', error)
        setConnectionState(peerId, 'error')
        reject(error)
      })

      conn.on('close', () => {
        clearTimeout(timeout)
        console.log('[WebRTC] Connection closed before it opened')
        setConnectionState(peerId, 'disconnected')
      })
    } catch (error) {
      console.error('[WebRTC] Error creating connection:', error)
      setConnectionState(peerId, 'error')
      reject(error)
    }
  })
}

const sendData = (peerId: string, data: unknown): boolean => {
  const conn = connections.value.get(peerId)
  if (conn && conn.open) {
    conn.send(data as Parameters<DataConnection['send']>[0])
    return true
  }
  console.warn('[WebRTC] No open connection to', peerId)
  return false
}

const closeConnection = (peerId: string) => {
  const conn = connections.value.get(peerId)
  if (conn) {
    conn.close()
    connections.value.delete(peerId)
    setConnectionState(peerId, 'disconnected')
  }
}

const onConnection = (callback: (conn: DataConnection) => void) => {
  connectionCallbacks.push(callback)
}

const destroy = () => {
  console.log('[WebRTC] Destroying peer - disabling reconnect')
  shouldReconnect.value = false
  clearInitRetry()

  connections.value.forEach(conn => conn.close())
  connections.value.clear()
  connectionStates.value.clear()
  peer.value?.destroy()
  peer.value = null
  currentPeerInstance = null
  localPeerId.value = ''
  peerError.value = null
  // Clear callbacks so they don't accumulate across re-mounts
  connectionCallbacks.length = 0
  peerOpenCallbacks.length = 0
}

export const useWebRTC = () => {
  return {
    peer,
    connections,
    connectionStates,
    localPeerId,
    peerError,
    initPeer,
    connectToPeer,
    sendData,
    closeConnection,
    getConnectionState,
    onConnection,
    onPeerOpen,
    destroy
  }
}
