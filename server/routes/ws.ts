import type { SignalingMessage, Device } from '../app/types'

// Store announced devices by peerId to notify new connections
const announcedDevices = new Map<string, any>()

export default defineWebSocketHandler({
  open(peer) {
    console.log('[WebSocket] Client connected:', peer.id)
    peer.subscribe('discovery')

    // Send existing peers to new peer
    peer.send(JSON.stringify({
      type: 'init',
      peerId: peer.id
    }))

    // Send all previously announced devices to the new peer
    for (const [peerId, deviceInfo] of announcedDevices.entries()) {
      peer.send(JSON.stringify({
        type: 'peer-joined',
        deviceInfo
      }))
    }
  },

  message(peer, message) {
    try {
      const data = message.text()
      const parsed: SignalingMessage = JSON.parse(data)

      console.log('[WebSocket] Message received:', parsed.type)

      switch (parsed.type) {
        case 'announce':
          console.log('[WebSocket] Device announced:', parsed.deviceInfo.name, 'with peerId:', parsed.deviceInfo.peerId)
          // Store the announced device - use the peerId from the client (PeerJS ID)
          // Also store the WebSocket peer.id for tracking disconnections
          const deviceWithWsId = {
            ...parsed.deviceInfo,
            wsId: peer.id  // Track WebSocket connection separately
          }
          announcedDevices.set(peer.id, deviceWithWsId)

          // Broadcast new device to ALL peers including this one
          // The peerId is the PeerJS ID which is what other peers need to connect
          const peerJoinedMsg = JSON.stringify({
            type: 'peer-joined',
            deviceInfo: parsed.deviceInfo  // Use the original deviceInfo with PeerJS peerId
          })
          // Send to this peer
          peer.send(peerJoinedMsg)
          // Also broadcast to all other connected peers
          peer.publish('discovery', peerJoinedMsg)
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

    // Get the device info before removing (we need the PeerJS peerId)
    const deviceInfo = announcedDevices.get(peer.id)
    const peerJsPeerId = deviceInfo?.peerId

    // Remove from announced devices
    announcedDevices.delete(peer.id)

    // Notify other peers with the PeerJS peerId (not WebSocket peer.id)
    if (peerJsPeerId) {
      peer.publish('discovery', JSON.stringify({
        type: 'peer-left',
        peerId: peerJsPeerId
      }))
    }
  },

  error(peer, error) {
    console.error('[WebSocket] Error:', error)
  }
})
