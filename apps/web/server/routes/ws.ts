import type { SignalingMessage, Device } from '@blink/types'

// Store announced devices. Key is ideally the PeerJS peerId, value includes wsId
const announcedDevices = new Map<string, any>()

// Store active WebSocket connections for manual broadcasting
const connectedPeers = new Map<string, any>()

export default defineWebSocketHandler({
  open(peer) {
    console.log('[WebSocket] Client connected:', peer.id)
    connectedPeers.set(peer.id, peer)
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

          // Manual broadcast to all connected peers
          for (const targetPeer of connectedPeers.values()) {
            try {
              targetPeer.send(peerJoinedMsg)
            } catch (err) {
              console.error('[WebSocket] Failed to send to peer:', err)
            }
          }
          
          // Also try standard publish (backup)
          peer.publish('discovery', peerJoinedMsg)
          break

        case 'signal':
          // Forward WebRTC signaling messages to specific peer
          if (parsed.targetPeer) {
            // Find target peer by looking up their WS ID from announcedDevices
            // We need to find the WS ID associated with the target PeerJS ID
            let targetWsId = null
            
            // Direct lookup if key is PeerID
            if (announcedDevices.has(parsed.targetPeer)) {
                targetWsId = announcedDevices.get(parsed.targetPeer).wsId
            }
            
            if (targetWsId && connectedPeers.has(targetWsId)) {
                const targetSocket = connectedPeers.get(targetWsId)
                targetSocket.send(JSON.stringify({
                    type: 'signal',
                    signal: parsed.signal,
                    fromPeer: peer.id
                }))
            } else {
                // Fallback to publish if manual lookup fails
                 peer.send(JSON.stringify({
                  type: 'signal',
                  signal: parsed.signal,
                  fromPeer: peer.id
                }))
            }
          }
          break

        case 'offer':
        case 'answer':
        case 'ice-candidate':
          // Forward WebRTC signaling
          const signalMsg = JSON.stringify(parsed)
          // Manual broadcast
          for (const targetPeer of connectedPeers.values()) {
             if (targetPeer.id !== peer.id) { // Don't send back to self for these
                try { targetPeer.send(signalMsg) } catch(e) {}
             }
          }
          peer.publish('discovery', signalMsg)
          break
      }
    } catch (error) {
      console.error('[WebSocket] Error handling message:', error)
    }
  },

  close(peer, event) {
    console.log('[WebSocket] Client disconnected:', peer.id)
    connectedPeers.delete(peer.id)
    
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
      const leftMsg = JSON.stringify({
        type: 'peer-left',
        peerId: removedPeerJsId
      })
      
      // Manual broadcast
      for (const targetPeer of connectedPeers.values()) {
        try { targetPeer.send(leftMsg) } catch(e) {}
      }
      
      peer.publish('discovery', leftMsg)
    }
  },

  error(peer, error) {
    console.error('[WebSocket] Error:', error)
  }
})
