import type { SignalingMessage, Device } from '../app/types'

export default defineWebSocketHandler({
  open(peer) {
    console.log('[WebSocket] Client connected:', peer.id)
    peer.subscribe('discovery')

    // Send existing peers to new peer
    peer.send(JSON.stringify({
      type: 'init',
      peerId: peer.id
    }))
  },

  message(peer, message) {
    try {
      const data = message.text()
      const parsed: SignalingMessage = JSON.parse(data)

      console.log('[WebSocket] Message received:', parsed.type)

      switch (parsed.type) {
        case 'announce':
          // Broadcast new device to all peers
          peer.publish('discovery', JSON.stringify({
            type: 'peer-joined',
            deviceInfo: {
              ...parsed.deviceInfo,
              peerId: peer.id
            }
          }))
          break

        case 'signal':
          // Forward WebRTC signaling messages to specific peer
          if (parsed.targetPeer) {
            peer.send(JSON.stringify({
              type: 'signal',
              signal: parsed.signal,
              fromPeer: peer.id
            }))
          }
          break

        case 'offer':
        case 'answer':
        case 'ice-candidate':
          // Forward WebRTC signaling
          peer.publish('discovery', JSON.stringify(parsed))
          break
      }
    } catch (error) {
      console.error('[WebSocket] Error handling message:', error)
    }
  },

  close(peer, event) {
    console.log('[WebSocket] Client disconnected:', peer.id)

    // Notify other peers
    peer.publish('discovery', JSON.stringify({
      type: 'peer-left',
      peerId: peer.id
    }))
  },

  error(peer, error) {
    console.error('[WebSocket] Error:', error)
  }
})
