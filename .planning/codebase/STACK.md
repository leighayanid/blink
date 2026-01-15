# Technology Stack

**Analysis Date:** 2026-01-15

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code (`package.json`)

**Secondary:**
- Vue 3 SFC templates - Component markup (`app/**/*.vue`)
- CSS/PostCSS - Styling via Tailwind (`tailwind.config.ts`)

## Runtime

**Environment:**
- Node.js (LTS recommended, no specific version locked)
- Browser runtime (WebRTC, WebSocket APIs)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Nuxt 4.2.0 - Full-stack Vue framework (`nuxt.config.ts`, `package.json`)
- Vue 3 (Composition API) - UI framework (bundled with Nuxt)

**State Management:**
- Pinia 3.0.3 - State management (`app/stores/devices.ts`, `app/stores/transfers.ts`)
- @pinia/nuxt 0.11.2 - Nuxt integration

**Styling:**
- Tailwind CSS 6.14.0 - Utility-first CSS (`tailwind.config.ts`)
- @nuxtjs/color-mode 3.5.2 - Dark/light mode support (`app.vue`)

**Testing:**
- Not configured - placeholder script in `package.json`

**Build/Dev:**
- Vite - Bundler (configured via Nuxt)
- vue-tsc 3.1.2 - Vue TypeScript type checker
- TypeScript 5.9.3 - Type checking and compilation

## Key Dependencies

**Critical:**
- PeerJS 1.5.5 - WebRTC peer-to-peer connections (`app/composables/useWebRTC.ts`)
- @vueuse/core 14.0.0 - Vue composition utilities
- @vueuse/nuxt 14.0.0 - Nuxt integration for VueUse

**Infrastructure:**
- Native WebSocket API - Signaling server communication (`app/composables/useDeviceDiscovery.ts`)
- Nitro - Server runtime (bundled with Nuxt, `server/routes/ws.ts`)

**Unused (in package.json but not imported):**
- socket.io-client 4.8.1 - Not used, native WebSocket preferred
- qrcode.vue 3.6.0 - Not used, planned feature

## Configuration

**Environment:**
- Runtime config via `nuxt.config.ts`:
  - `WS_URL` - WebSocket signaling server URL (default: `ws://localhost:3000`)
  - `SIGNALING_SERVER` - Signaling server endpoint (default: `http://localhost:3000`)
- No `.env.example` file provided

**Build:**
- `nuxt.config.ts` - Nuxt configuration (modules, vite server, Nitro WebSocket)
- `tsconfig.json` - TypeScript configuration (strict mode enabled)
- `tailwind.config.ts` - Custom theme colors (orange primary with light/dark variants)

## Platform Requirements

**Development:**
- Any platform with Node.js 18+ (macOS/Linux/Windows)
- No Docker required
- No external services required (self-contained signaling)

**Production:**
- Node.js server for Nitro runtime
- HTTPS recommended for WebRTC in production
- Browser support: Chrome 60+, Firefox 55+, Safari 11+, Edge 60+

---

*Stack analysis: 2026-01-15*
*Update after major dependency changes*
