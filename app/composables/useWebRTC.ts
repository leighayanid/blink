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
        reject(new Error('Peer not initialized'))
        return
      }

      console.log('[WebRTC] Connecting to peer:', peerId)

      const conn = peer.value.connect(peerId, {
        reliable: true,
        serialization: 'binary'
      })

      conn.on('open', () => {
        console.log('[WebRTC] Connection opened with', conn.peer)
        handleConnection(conn)
        resolve(conn)
      })

      conn.on('error', (error) => {
        console.error('[WebRTC] Connection error:', error)
        reject(error)
      })
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
