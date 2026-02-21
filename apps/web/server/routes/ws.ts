import type { SignalingMessage, Device } from '@blink/types'

// Store announced devices. Key is the PeerJS peerId, value includes wsId
const announcedDevices = new Map<string, Device & { wsId: string }>()

// Store active WebSocket connections for broadcasting
const connectedPeers = new Map<string, any>()

/** Validate and sanitize an incoming deviceInfo object. Returns null if invalid. */
function sanitizeDeviceInfo(raw: unknown): (Device & { peerId: string }) | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const d = raw as Record<string, unknown>

  const id = typeof d.id === 'string' ? d.id.slice(0, 64) : null
  const name = typeof d.name === 'string' ? d.name.slice(0, 128) : null
  const platform = typeof d.platform === 'string' ? d.platform.slice(0, 32) : 'Unknown'
  const peerId = typeof d.peerId === 'string' ? d.peerId.slice(0, 128) : null
  const timestamp = typeof d.timestamp === 'number' ? d.timestamp : Date.now()

  if (!id || !name || !peerId) return null

  return { id, name, platform, peerId, timestamp }
}

/** Broadcast a message to all connected peers except an optional exclusion */
function broadcast(message: string, excludeWsId?: string) {
  for (const [wsId, peer] of connectedPeers.entries()) {
    if (wsId === excludeWsId) continue
    try {
      peer.send(message)
    } catch (err) {
      console.error('[WebSocket] Failed to send to peer:', err)
    }
  }
}

export default defineWebSocketHandler({
  open(peer) {
    console.log('[WebSocket] Client connected:', peer.id)
    connectedPeers.set(peer.id, peer)

    // Send the new peer its assigned WebSocket ID
    peer.send(JSON.stringify({
      type: 'init',
      peerId: peer.id
    }))

    // Send all previously announced devices to the new peer
    for (const [, deviceInfo] of announcedDevices.entries()) {
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
        case 'announce': {
          const deviceInfo = sanitizeDeviceInfo(parsed.deviceInfo)
          if (!deviceInfo) {
            console.warn('[WebSocket] Rejecting malformed announce from', peer.id)
            break
          }

          console.log('[WebSocket] Device announced:', deviceInfo.name, 'peerId:', deviceInfo.peerId)

          announcedDevices.set(deviceInfo.peerId, { ...deviceInfo, wsId: peer.id })

          // Broadcast new device to all peers (including the announcer so it
          // sees itself reflected back, which is useful for multi-tab debugging)
          const peerJoinedMsg = JSON.stringify({
            type: 'peer-joined',
            deviceInfo
          })
          broadcast(peerJoinedMsg)
          break
        }

        case 'signal': {
          // Forward WebRTC signaling message to a specific target peer
          if (!parsed.targetPeer || typeof parsed.targetPeer !== 'string') break

          const targetEntry = announcedDevices.get(parsed.targetPeer)
          if (!targetEntry) {
            console.warn('[WebSocket] Signal target not found:', parsed.targetPeer)
            break
          }

          const targetSocket = connectedPeers.get(targetEntry.wsId)
          if (!targetSocket) {
            console.warn('[WebSocket] Target peer socket not connected:', parsed.targetPeer)
            break
          }

          targetSocket.send(JSON.stringify({
            type: 'signal',
            signal: parsed.signal,
            fromPeer: peer.id
          }))
          break
        }

        case 'offer':
        case 'answer':
        case 'ice-candidate': {
          // Forward WebRTC signaling to all peers except sender
          const signalMsg = JSON.stringify(parsed)
          broadcast(signalMsg, peer.id)
          break
        }
      }
    } catch (error) {
      console.error('[WebSocket] Error handling message:', error)
    }
  },

  close(peer) {
    console.log('[WebSocket] Client disconnected:', peer.id)
    connectedPeers.delete(peer.id)

    // Find the announced device entry that matches this WebSocket connection
    let removedPeerId: string | null = null
    for (const [peerId, deviceInfo] of announcedDevices.entries()) {
      if (deviceInfo.wsId === peer.id) {
        removedPeerId = deviceInfo.peerId || null
        announcedDevices.delete(peerId)
        break
      }
    }

    if (removedPeerId) {
      const leftMsg = JSON.stringify({
        type: 'peer-left',
        peerId: removedPeerId
      })
      broadcast(leftMsg)
    }
  },

  error(peer, error) {
    console.error('[WebSocket] Error:', error)
  }
})
