# Hatid

## What This Is

A local network file sharing app that lets you send files between devices on the same WiFi. Open the app on two devices, they discover each other, connect peer-to-peer, and transfer files directly — no cloud, no accounts, no uploads.

## Core Value

**Open → see devices → connect → send files** works reliably every time.

## Requirements

### Validated

<!-- Existing capabilities from codebase -->

- ✓ WebSocket-based device discovery — existing
- ✓ WebRTC peer-to-peer connections via PeerJS — existing
- ✓ Binary file chunking and transfer protocol (64KB chunks) — existing
- ✓ Dark/light mode theming — existing
- ✓ Device identity persistence via localStorage — existing
- ✓ Platform detection (Windows, macOS, Linux, Android, iOS) — existing

### Active

<!-- Current scope. Building toward these. -->

- [ ] Bold, vibrant UI refresh — make it look polished and modern while keeping orange theme
- [ ] Verify end-to-end file transfer works reliably
- [ ] Fix bugs discovered during testing
- [ ] Responsive design for desktop and mobile browsers
- [ ] Clear visual feedback for connection states and transfer progress
- [ ] Graceful error handling with user-friendly messages

### Out of Scope

<!-- Explicit boundaries -->

- Internet relay / transfers across different networks — local network only for now
- User accounts / authentication — not needed for local transfers
- End-to-end encryption — WebRTC provides transport encryption, app-level encryption deferred
- Transfer resume on disconnect — would add complexity, defer to future
- Folder transfers — single/multiple files only for now

## Context

**Existing Codebase:**
- Nuxt 4 + Vue 3 (Composition API) + TypeScript
- PeerJS for WebRTC abstraction
- Tailwind CSS with custom orange theme
- Nitro WebSocket server for signaling
- Codebase mapped in `.planning/codebase/`

**Known Issues (from codebase analysis):**
- Pinia stores defined but unused (state in composables instead)
- Duplicate `getPlatformIcon()` function across 3 files
- Uses `alert()` for errors instead of proper notifications
- No tests configured
- Some `any` types in WebRTC handling

**Current State:**
- Core functionality implemented but not thoroughly tested
- UI is functional but visually plain
- Orange warm color palette defined in Tailwind config

## Constraints

- **Platform**: Desktop + mobile browsers (Chrome, Firefox, Safari, Edge)
- **Network**: Same local network / WiFi — no TURN server for relay
- **Stack**: Keep existing Nuxt 4 / Vue 3 / TypeScript / Tailwind stack
- **Dependencies**: Keep PeerJS for WebRTC (avoid raw WebRTC complexity)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Keep orange theme, make it bold | User wants vibrant look, orange already established | — Pending |
| Fix bugs alongside UI work | User wants both equally, not sequential | — Pending |
| Local network only | Simplifies architecture, no TURN server needed | — Pending |

---
*Last updated: 2026-01-15 after initialization*
