# Architecture

**Analysis Date:** 2026-01-15

## Pattern Overview

**Overall:** Nuxt 4 Full-Stack Application with Composable-Based Frontend + WebRTC P2P

**Key Characteristics:**
- Single-page application with WebSocket signaling backend
- Peer-to-peer file transfer via WebRTC DataChannel
- Composable-driven business logic (Vue 3 Composition API)
- Event-driven device discovery

## Layers

**Presentation Layer:**
- Purpose: User interface rendering and interaction
- Contains: Vue components, layouts, pages
- Location: `app/components/`, `app/pages/`, `app/layouts/`
- Depends on: Composables for state and logic
- Used by: Browser rendering

**Composable/Logic Layer:**
- Purpose: Encapsulate stateful business logic
- Contains: Device discovery, WebRTC management, file transfer protocol
- Location: `app/composables/`
- Depends on: Browser APIs, PeerJS library
- Used by: Presentation layer (pages, components)

**State Management Layer:**
- Purpose: Global reactive state (defined but underutilized)
- Contains: Pinia stores for devices and transfers
- Location: `app/stores/`
- Depends on: Vue reactivity
- Used by: Currently unused - composables handle state directly

**Type Definition Layer:**
- Purpose: TypeScript interfaces and types
- Contains: Device, Transfer, FileMetadata, ChunkData, SignalingMessage
- Location: `app/types/index.ts`
- Depends on: Nothing
- Used by: All TypeScript files

**Server/Signaling Layer:**
- Purpose: WebSocket signaling for device discovery
- Contains: WebSocket route handler
- Location: `server/routes/ws.ts`
- Depends on: Nitro WebSocket, H3 framework
- Used by: Frontend WebSocket connections

## Data Flow

**Device Discovery Flow:**

1. Browser loads → `app.vue` mounts
2. `initDevice()` generates/retrieves device ID from localStorage
3. `useDeviceDiscovery.connect()` opens WebSocket to signaling server
4. Server sends `init` message with peer ID assignment
5. Client sends `announce` message with device info
6. Server broadcasts `peer-joined` to all other connected clients
7. Other devices receive announcement, update device list
8. On disconnect: Server broadcasts `peer-left`, devices remove from list

**File Transfer Flow:**

1. User selects target device in `DeviceList.vue`
2. User drags/selects files in `FileUploader.vue`
3. `useWebRTC.connectToPeer(peerId)` initiates WebRTC connection via PeerJS
4. Connection opens → `useFileTransfer.sendFile()` begins
5. Sender transmits: `file-meta` → multiple `file-chunk` (64KB each) → `file-complete`
6. Receiver: `receiveFile()` reassembles chunks into Blob
7. On complete: Auto-download via `downloadFile()` helper

**State Management:**
- In-memory: Reactive refs in composables (devices, connections, transfers)
- Persistent: localStorage for device ID/name only
- No database or session state

## Key Abstractions

**Composables:**
- Purpose: Encapsulate related state and methods
- Examples: `useDeviceDiscovery`, `useWebRTC`, `useFileTransfer`, `useTheme`
- Pattern: Vue 3 Composition API (exported refs and functions)

**Connection Map:**
- Purpose: Track active WebRTC peer connections
- Location: `app/composables/useWebRTC.ts`
- Pattern: `Map<peerId, DataConnection>` for connection pooling

**Transfer Protocol:**
- Purpose: Structure file transfer over DataChannel
- Pattern: Message-based with JSON control + binary payload
- Types: `file-meta`, `file-chunk`, `file-complete`

**Device Registry:**
- Purpose: Track discovered devices on network
- Location: `server/routes/ws.ts` (server) + `app/composables/useDeviceDiscovery.ts` (client)
- Pattern: In-memory Map with pub/sub broadcasting

## Entry Points

**Frontend Entry:**
- Location: `app.vue`
- Triggers: Browser navigation to root URL
- Responsibilities: Initialize theme, render layout and page

**Main Page:**
- Location: `app/pages/index.vue`
- Triggers: Root route match
- Responsibilities: Initialize composables, orchestrate UI sections, handle user actions

**Server Entry:**
- Location: `server/routes/ws.ts`
- Triggers: WebSocket connection to `/ws` or `/_ws`
- Responsibilities: Manage device registry, broadcast discovery messages

## Error Handling

**Strategy:** Try-catch at operation boundaries, console logging for debugging

**Patterns:**
- WebSocket errors: Log and attempt reconnection after 5s delay
- WebRTC errors: Log and reject connection promise with error
- File transfer errors: Log silently, transfer marked as failed
- JSON parse errors: Catch and log, continue processing

**Gaps:**
- No user-facing error notifications (uses alert() only)
- No retry mechanism for failed transfers
- No maximum reconnection attempts

## Cross-Cutting Concerns

**Logging:**
- Console logging with module prefixes: `[Discovery]`, `[WebRTC]`, `[FileTransfer]`, `[Page]`
- Debug-level logging throughout, no production logger

**Validation:**
- TypeScript compile-time type checking
- No runtime input validation on WebSocket messages
- No file type/size validation on upload

**Theming:**
- CSS custom properties for colors (`--color-primary`, `--bg-primary`, etc.)
- Dark/light mode via `@nuxtjs/color-mode` and `html.dark` class
- Tailwind config extends theme colors

---

*Architecture analysis: 2026-01-15*
*Update when major patterns change*
