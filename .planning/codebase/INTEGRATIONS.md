# External Integrations

**Analysis Date:** 2026-01-15

## APIs & External Services

**Payment Processing:**
- Not detected

**Email/SMS:**
- Not detected

**External APIs:**
- Not detected (fully self-contained application)

## Data Storage

**Databases:**
- Not detected (no persistent database)

**File Storage:**
- Browser localStorage - Device ID and name persistence (`app/composables/useDeviceDiscovery.ts`)
  - Keys: `deviceId`, `deviceName`
  - Purpose: Maintain device identity across sessions

**Caching:**
- In-memory only via Vue reactive state and Pinia stores
- No Redis or external cache

## Communication Infrastructure

**WebSocket Signaling:**
- Custom implementation using Nitro WebSocket handler (`server/routes/ws.ts`)
  - Handles: `announce`, `init`, `peer-joined`, `peer-left`, `signal`, `offer`, `answer`, `ice-candidate`
  - Broadcasting via pub/sub to 'discovery' channel
  - Connection: Dynamic URL from window location or `WS_URL` env var

**WebRTC (P2P):**
- PeerJS library (`app/composables/useWebRTC.ts`)
  - STUN servers: `stun.l.google.com:19302`, `stun1.l.google.com:19302`
  - Serialization: Binary mode for data transfer
  - Connection timeout: 10 seconds
  - Auto-reconnection: On disconnect

**File Transfer Protocol:**
- Custom binary chunking protocol (`app/composables/useFileTransfer.ts`)
  - Chunk size: 64KB (`CHUNK_SIZE = 64 * 1024`)
  - Message types: `file-meta`, `file-chunk`, `file-complete`
  - Format: JSON metadata + ArrayBuffer binary data

## Authentication & Identity

**Auth Provider:**
- Not detected (no authentication system)

**OAuth Integrations:**
- Not detected

**Device Identity:**
- Client-generated UUID stored in localStorage (`app/composables/useDeviceDiscovery.ts`)
- No server-side identity management

## Monitoring & Observability

**Error Tracking:**
- Not detected (console.log only)

**Analytics:**
- Not detected

**Logs:**
- Console logging with prefixes: `[Discovery]`, `[WebRTC]`, `[FileTransfer]`, `[Page]`
- No structured logging or external log service

## CI/CD & Deployment

**Hosting:**
- Not configured
- Suitable for: Vercel, Netlify, self-hosted Node.js

**CI Pipeline:**
- Not configured (no GitHub Actions or similar)

## Environment Configuration

**Development:**
- Required env vars: None (all have defaults)
- Optional: `WS_URL`, `SIGNALING_SERVER`
- Mock/stub services: Not needed (all local)

**Staging:**
- Not configured

**Production:**
- HTTPS required for WebRTC to work properly
- Environment variables via deployment platform

## Webhooks & Callbacks

**Incoming:**
- Not detected

**Outgoing:**
- Not detected

## Third-Party Services

**Google STUN Servers:**
- Public STUN servers for NAT traversal
  - `stun.l.google.com:19302`
  - `stun1.l.google.com:19302`
- No authentication required
- Free public service

## Browser APIs Used

**WebSocket:**
- Native browser WebSocket for signaling (`app/composables/useDeviceDiscovery.ts`)

**WebRTC:**
- Via PeerJS abstraction (`app/composables/useWebRTC.ts`)
- DataChannel for binary file transfer

**File API:**
- FileReader for chunking files
- Blob API for file reassembly
- URL.createObjectURL for downloads

**localStorage:**
- Device identity persistence

**Navigator:**
- User agent detection for platform identification

---

*Integration audit: 2026-01-15*
*Update when adding/removing external services*
