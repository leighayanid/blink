import { ref } from 'vue'
import Peer from 'peerjs'

export const useWebRTC = () => {
  const peer = ref<Peer | null>(null)
  const connections = ref<Map<string, any>>(new Map())
  const localPeerId = ref<string>('')

  const initPeer = (deviceId?: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        peer.value = new Peer(deviceId as string, {
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' }
            ]
          },
          debug: 2 // Enable debug logging
        })

        peer.value.on('open', (id) => {
          console.log('[WebRTC] Peer initialized with ID:', id)
          localPeerId.value = id
          resolve(id)
        })

        peer.value.on('connection', (conn) => {
          console.log('[WebRTC] Incoming connection from:', conn.peer)
          handleConnection(conn)
        })

        peer.value.on('error', (error) => {
          console.error('[WebRTC] Peer error:', error)
          reject(error)
        })

        peer.value.on('disconnected', () => {
          console.log('[WebRTC] Peer disconnected, attempting reconnect...')
          peer.value?.reconnect()
        })
      } catch (error) {
        console.error('[WebRTC] Failed to initialize peer:', error)
        reject(error)
      }
    })
  }

  const connectToPeer = (peerId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!peer.value) {
        console.error('[WebRTC] Peer not initialized')
        reject(new Error('Peer not initialized'))
        return
      }

      console.log('[WebRTC] Attempting to connect to peer:', peerId)
      console.log('[WebRTC] Local peer ID:', peer.value.id)

      try {
        const conn = peer.value.connect(peerId, {
          reliable: true,
          serialization: 'binary'
        })

        console.log('[WebRTC] Connection object created, waiting for open event...')

        // Set timeout for connection
        const timeout = setTimeout(() => {
          console.error('[WebRTC] Connection timeout after 10 seconds')
          reject(new Error('Connection timeout - peer may be offline or unreachable'))
        }, 10000)

        conn.on('open', () => {
          clearTimeout(timeout)
          console.log('[WebRTC] Connection OPENED with peer:', conn.peer)
          handleConnection(conn)
          resolve(conn)
        })

        conn.on('error', (error) => {
          clearTimeout(timeout)
          console.error('[WebRTC] Connection error:', error, typeof error)
          reject(error)
        })

        conn.on('close', () => {
          clearTimeout(timeout)
          console.log('[WebRTC] Connection closed before it opened')
        })
      } catch (error) {
        console.error('[WebRTC] Error creating connection:', error)
        reject(error)
      }
    })
  }

  const handleConnection = (conn: any) => {
    connections.value.set(conn.peer, conn)

    conn.on('data', (data: any) => {
      // This will be handled by useFileTransfer
      console.log('[WebRTC] Data received from', conn.peer)
    })

    conn.on('close', () => {
      console.log('[WebRTC] Connection closed with', conn.peer)
      connections.value.delete(conn.peer)
    })

    conn.on('error', (error: any) => {
      console.error('[WebRTC] Connection error with', conn.peer, error)
      connections.value.delete(conn.peer)
    })
  }

  const sendData = (peerId: string, data: any): boolean => {
    const conn = connections.value.get(peerId)
    if (conn && conn.open) {
      conn.send(data)
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
    }
  }

  const destroy = () => {
    connections.value.forEach(conn => conn.close())
    connections.value.clear()
    peer.value?.destroy()
    peer.value = null
  }

  return {
    peer,
    connections,
    localPeerId,
    initPeer,
    connectToPeer,
    sendData,
    closeConnection,
    destroy
  }
}
