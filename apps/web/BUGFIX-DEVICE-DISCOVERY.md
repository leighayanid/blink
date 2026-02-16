# Bug Fix: Device Discovery State Persistence

## Problem

When navigating from the `/app` page back to the landing page (`/`), the device discovery connections were automatically reconnecting after 5 seconds, even though the user had left the app. This caused:

1. **Unwanted WebSocket reconnections** - The signaling server connection would re-establish automatically
2. **Unwanted PeerJS reconnections** - The peer connection would attempt to reconnect
3. **Stale device list** - Previously discovered devices remained in memory
4. **Resource waste** - Connections persisting when not needed

## Root Cause

The application had **automatic reconnection logic** in both composables:

### 1. WebSocket Reconnection (`useDeviceDiscovery.ts`)
```typescript
socket.value.onclose = () => {
  console.log('[Discovery] Disconnected from signaling server')
  isConnected.value = false

  // ❌ This ALWAYS attempted to reconnect, even if disconnect was intentional
  setTimeout(() => {
    if (!isConnected.value) {
      connect()
    }
  }, 5000)
}
```

### 2. PeerJS Reconnection (`useWebRTC.ts`)
```typescript
peer.value.on('disconnected', () => {
  console.log('[WebRTC] Peer disconnected, attempting reconnect...')
  // ❌ This ALWAYS attempted to reconnect, even if disconnect was intentional
  peer.value?.reconnect()
})
```

**The problem:** These reconnection handlers didn't differentiate between:
- **Unintentional disconnects** (network issues, server restart) → Should reconnect
- **Intentional disconnects** (user navigating away) → Should NOT reconnect

## Solution

Added a `shouldReconnect` flag to both composables to track whether reconnection should happen.

### Changes to `useDeviceDiscovery.ts`

1. **Added reconnection flag:**
```typescript
const shouldReconnect = ref(true) // Flag to control reconnection
```

2. **Modified connect() to enable reconnection:**
```typescript
const connect = () => {
  shouldReconnect.value = true // Re-enable reconnection when connecting
  // ... rest of connect logic
}
```

3. **Modified onclose handler to respect the flag:**
```typescript
socket.value.onclose = () => {
  console.log('[Discovery] Disconnected from signaling server')
  isConnected.value = false

  // ✅ Only reconnect if disconnect was NOT intentional
  if (shouldReconnect.value) {
    console.log('[Discovery] Scheduling reconnect...')
    setTimeout(() => {
      if (!isConnected.value && shouldReconnect.value) {
        connect()
      }
    }, 5000)
  } else {
    console.log('[Discovery] Reconnect disabled, staying disconnected')
  }
}
```

4. **Modified disconnect() to disable reconnection and clear state:**
```typescript
const disconnect = () => {
  console.log('[Discovery] Intentional disconnect - disabling reconnect')
  shouldReconnect.value = false // ✅ Disable reconnection

  if (socket.value) {
    socket.value.close()
    socket.value = null
  }

  isConnected.value = false
  devices.value = [] // ✅ Clear devices list
  localDevice.value = null // ✅ Clear local device
}
```

### Changes to `useWebRTC.ts`

1. **Added reconnection flag:**
```typescript
const shouldReconnect = ref(true) // Flag to control peer reconnection
```

2. **Modified initPeer() to enable reconnection:**
```typescript
const initPeer = (deviceId?: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    shouldReconnect.value = true // Re-enable reconnection when initializing
    // ... rest of init logic
  })
}
```

3. **Modified disconnected handler to respect the flag:**
```typescript
peer.value.on('disconnected', () => {
  console.log('[WebRTC] Peer disconnected')
  if (shouldReconnect.value) {
    console.log('[WebRTC] Attempting to reconnect peer...')
    peer.value?.reconnect()
  } else {
    console.log('[WebRTC] Reconnect disabled, staying disconnected')
  }
})
```

4. **Modified destroy() to disable reconnection and clear state:**
```typescript
const destroy = () => {
  console.log('[WebRTC] Destroying peer - disabling reconnect')
  shouldReconnect.value = false // ✅ Disable reconnection

  connections.value.forEach(conn => conn.close())
  connections.value.clear()
  connectionStates.value.clear()
  peer.value?.destroy()
  peer.value = null
  localPeerId.value = '' // ✅ Clear peer ID
}
```

## Behavior After Fix

### Scenario 1: User navigates to /app
1. ✅ `initDevice()` creates local device
2. ✅ `initPeer()` creates PeerJS connection (sets `shouldReconnect = true`)
3. ✅ `connect()` opens WebSocket (sets `shouldReconnect = true`)
4. ✅ Device announces itself and discovers other devices

### Scenario 2: User navigates back to landing page (/)
1. ✅ `onUnmounted()` calls `disconnect()` (sets `shouldReconnect = false`)
2. ✅ WebSocket closes, **no reconnection scheduled**
3. ✅ `onUnmounted()` calls `destroy()` (sets `shouldReconnect = false`)
4. ✅ PeerJS disconnects, **no reconnection attempt**
5. ✅ Device list cleared
6. ✅ Local device cleared
7. ✅ User stays on landing page with clean state

### Scenario 3: Network issues while on /app (unintentional disconnect)
1. ✅ WebSocket closes unexpectedly
2. ✅ `shouldReconnect = true` (still enabled)
3. ✅ **Automatic reconnection happens after 5 seconds**
4. ✅ PeerJS disconnects
5. ✅ `shouldReconnect = true` (still enabled)
6. ✅ **Automatic peer reconnection happens**

### Scenario 4: User returns to /app
1. ✅ Fresh state initialized
2. ✅ New device ID generated
3. ✅ New PeerJS connection established
4. ✅ New WebSocket connection established
5. ✅ Device announces itself as a new connection

## Testing

To verify the fix works:

1. **Open the app:**
   ```bash
   npm run dev
   ```

2. **Navigate to `/app`:**
   - Open browser console
   - You should see: `[Discovery] Connected to signaling server`
   - You should see: `[WebRTC] Peer initialized with ID: ...`

3. **Navigate back to `/` (landing page):**
   - You should see: `[Discovery] Intentional disconnect - disabling reconnect`
   - You should see: `[Discovery] Disconnected from signaling server`
   - You should see: `[Discovery] Reconnect disabled, staying disconnected`
   - You should see: `[WebRTC] Destroying peer - disabling reconnect`

4. **Wait 10 seconds:**
   - ✅ No reconnection messages should appear
   - ✅ No new WebSocket connections established
   - ✅ No new PeerJS connections established

5. **Navigate back to `/app` again:**
   - ✅ New connections established with fresh state
   - ✅ Device gets a new ID

## Benefits

1. **Proper cleanup** - Resources are freed when user leaves the app
2. **No ghost connections** - Connections don't persist after navigation
3. **Better UX** - Landing page stays lightweight and fast
4. **Resilience maintained** - Automatic reconnection still works for network issues
5. **Clear state** - Each app visit starts fresh

## Files Modified

- `apps/web/app/composables/useDeviceDiscovery.ts`
- `apps/web/app/composables/useWebRTC.ts`

## Related Issues

This fix also prevents:
- Memory leaks from abandoned connections
- Server load from unnecessary reconnections
- Confusion from stale device lists
- Battery drain on mobile devices
