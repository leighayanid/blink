# Flutter App — Pending Issues

All issues below are isolated to `apps/mobile/` (the Flutter application).
The web app has been fixed separately. Address these before shipping the mobile app.

---

## P0 — Critical (app is non-functional)

### 1. `FileTransferService._saveFile` uses browser-only APIs
**File:** `lib/data/services/file_transfer_service.dart`, lines 306–321

The file-save path uses `html.Blob` and `html.AnchorElement` from `universal_html`.
These crash at runtime on Android and iOS. Fix:
- Use `dart:io` + `path_provider` for native saves
- Use conditional imports (`dart:html` for web, `dart:io` for native)

### 2. WebRTC offer is created but never sent through signaling
**File:** `lib/core/network/webrtc_manager.dart`, lines 116–123

`connectToPeer` creates an SDP offer and sets the local description, then has a
comment `// In a real implementation, you would send this offer...`. It never sends
it. ICE candidates are also captured but never emitted (line 175). The app cannot
establish any WebRTC connection with any peer.

Fix: Wire `peerConnection.onIceCandidate` and the SDP offer into `SignalingClient`
and emit them to the signaling server.

### 3. `SignalingClient` uses Socket.io; web server uses raw WebSocket
**File:** `lib/core/network/signaling_client.dart`, lines 57–65

The app connects via `socket_io_client` (Socket.io protocol). The web server
(`apps/web/server/routes/ws.ts`) is a raw WebSocket handler. These protocols are
incompatible — the app cannot connect at all.

Fix: Either replace `socket_io_client` with a raw WebSocket client in Flutter,
or add a Socket.io adapter on the server.

---

## P1 — High Priority

### 4. `_updateTransfer` causes O(n) rebuilds on every chunk
**File:** `lib/data/services/file_transfer_service.dart`, lines 330–343

For every chunk received, `_updateTransfer` removes and re-inserts the transfer
from the list and calls `_notifyListeners`. For a 1 GB file (~16 000 chunks),
this causes 16 000 list rebuilds. Fix with in-place mutation or a throttled update.

### 5. `_handleBinaryChunk` uses a linear scan to assign chunks to transfers
**File:** `lib/data/services/file_transfer_service.dart`, lines 222–247

The `awaitingChunk` boolean flag breaks when receiving from multiple peers
simultaneously. Fix: include `transferId` in the preceding JSON frame and use
a Map lookup instead.

---

## P2 — Architecture

### 6. `PlatformDetector` always returns `'Web'` regardless of actual platform
**File:** `lib/core/utils/platform_detector.dart`

`getPlatform()` returns `'Web'` hardcoded. `getDeviceId()` regenerates a new ID
every app launch. Fix: use `Platform.isAndroid`, `Platform.isIOS`, etc. from
`dart:io`, and persist the device ID to `SharedPreferences`.

### 7. `DeviceNotifier._init()` is unawaited in constructor
**File:** `lib/presentation/providers/device_provider.dart`, lines 43–44

`_init()` is async but unawaited. Errors are silently swallowed and
`localDevice` is never set. Fix: Use `addPostFrameCallback` or override
`build` + `ref.listen` to schedule init safely.

### 8. `_MainScreenState._initializeApp` reads provider state before it settles
**File:** `lib/presentation/screens/main_screen.dart`, lines 36–48

`ref.read(deviceProvider)` is called immediately after `connect()` returns,
but `localDevice` is set asynchronously in `DeviceNotifier._init()`. The device
is almost certainly null at this point, so WebRTC never initializes. Fix: await
the device state becoming non-null before calling WebRTC init.

### 9. No cancel, pause, or resume for in-progress transfers
Neither `FileTransferService` nor `WebRTCManager` implements cancellation,
pause, or resume. A connection drop mid-transfer silently discards the partial
file and leaves the transfer entry in `_receiveOperations` as a leak.

---

## P3 — Security

### 10. `platform_permissions.dart` always returns `true`
**File:** `lib/core/utils/platform_permissions.dart`

All permission checks return `true` without checking real OS permissions.
On Android 13+, `READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO` etc. require explicit
user grants. Fix: use `permission_handler` to request and check actual permissions.

---

## References to Cross-Cutting Issues (already fixed in web app)

- Device ID persistence (same bug as web — fixed in `useDeviceDiscovery.ts`)
- Platform detection order (Android vs Linux — fixed in web)
- Signaling protocol decision: web server now uses raw WebSocket only;
  Flutter must switch to a plain WebSocket client.
