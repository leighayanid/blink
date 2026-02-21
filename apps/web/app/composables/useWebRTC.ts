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
const shouldReconnect = ref(true)

// Callbacks fired synchronously whenever a new DataConnection is established
// (both outgoing-opened and incoming). Register via onConnection().
const connectionCallbacks: Array<(conn: DataConnection) => void> = []

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

const initPeer = (deviceId?: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    shouldReconnect.value = true

    try {
      peer.value = new Peer(deviceId as string, {
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        },
        debug: 2
      })

      peer.value.on('open', (id) => {
        console.log('[WebRTC] Peer initialized with ID:', id)
        localPeerId.value = id
        resolve(id)
      })

      peer.value.on('connection', (conn: DataConnection) => {
        console.log('[WebRTC] Incoming connection from:', conn.peer)
        setConnectionState(conn.peer, 'connecting')
        // Wait for the connection to open before registering handlers
        conn.on('open', () => {
          handleConnection(conn)
        })
      })

      peer.value.on('error', (error) => {
        console.error('[WebRTC] Peer error:', error)
        reject(error)
      })

      peer.value.on('disconnected', () => {
        console.log('[WebRTC] Peer disconnected')
        if (shouldReconnect.value) {
          console.log('[WebRTC] Attempting to reconnect peer...')
          peer.value?.reconnect()
        } else {
          console.log('[WebRTC] Reconnect disabled, staying disconnected')
        }
      })
    } catch (error) {
      console.error('[WebRTC] Failed to initialize peer:', error)
      reject(error)
    }
  })
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

  connections.value.forEach(conn => conn.close())
  connections.value.clear()
  connectionStates.value.clear()
  peer.value?.destroy()
  peer.value = null
  localPeerId.value = ''
  // Clear callbacks so they don't accumulate across re-mounts
  connectionCallbacks.length = 0
}

export const useWebRTC = () => {
  return {
    peer,
    connections,
    connectionStates,
    localPeerId,
    initPeer,
    connectToPeer,
    sendData,
    closeConnection,
    getConnectionState,
    onConnection,
    destroy
  }
}
