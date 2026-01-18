import type { SignalingMessage, Device } from '../app/types'

// Store announced devices. Key is ideally the PeerJS peerId, value includes wsId
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
          // Prefer using the PeerJS peerId as the key so other peers can reference it directly
          const peerJsId = parsed.deviceInfo?.peerId || null
          const key = peerJsId || peer.id

          const deviceWithWsId = {
            ...parsed.deviceInfo,
            wsId: peer.id // Track WebSocket connection separately
          }

          announcedDevices.set(key, deviceWithWsId)

          // Broadcast new device to ALL peers including this one
          const peerJoinedMsg = JSON.stringify({
            type: 'peer-joined',
            deviceInfo: parsed.deviceInfo
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
    // Find the announced device entry that matches this WebSocket id (wsId)
    let removedPeerJsId = null
    for (const [key, deviceInfo] of announcedDevices.entries()) {
      if (deviceInfo?.wsId === peer.id) {
        removedPeerJsId = deviceInfo?.peerId || null
        announcedDevices.delete(key)
        break
      }
    }

    // If we found a PeerJS peerId, notify other peers
    if (removedPeerJsId) {
      peer.publish('discovery', JSON.stringify({
        type: 'peer-left',
        peerId: removedPeerJsId
      }))
    }
  },

  error(peer, error) {
    console.error('[WebSocket] Error:', error)
  }
})
