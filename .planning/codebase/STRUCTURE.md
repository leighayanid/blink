# Codebase Structure

**Analysis Date:** 2026-01-15

## Directory Layout

```
local-share-app/
├── app/                      # Frontend application (Nuxt app directory)
│   ├── components/           # Reusable Vue components
│   ├── composables/          # Vue 3 composition utilities
│   ├── layouts/              # Page layout wrappers
│   ├── pages/                # Nuxt file-based routing
│   ├── stores/               # Pinia state management
│   └── types/                # TypeScript interfaces
├── server/                   # Nitro server handlers
│   └── routes/               # Server route handlers
├── public/                   # Static assets
├── .nuxt/                    # Generated Nuxt files (gitignored)
├── .output/                  # Production build output
├── app.vue                   # Root component
├── nuxt.config.ts            # Nuxt configuration
├── tailwind.config.ts        # Tailwind CSS theme
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project manifest
```

## Directory Purposes

**app/components/**
- Purpose: Reusable Vue single-file components
- Contains: UI blocks for device list, file upload, transfer progress
- Key files:
  - `DeviceList.vue` - Grid display of discoverable devices
  - `FileUploader.vue` - Drag-drop file selector with preview
  - `TransferProgress.vue` - File transfer status visualization
  - `LocalDeviceCard.vue` - Display current device info
- Subdirectories: None (flat structure)

**app/composables/**
- Purpose: Vue 3 composition API utilities (stateful logic)
- Contains: Business logic for discovery, WebRTC, file transfer
- Key files:
  - `useDeviceDiscovery.ts` - WebSocket device discovery
  - `useWebRTC.ts` - PeerJS wrapper for P2P connections
  - `useFileTransfer.ts` - File chunking and reassembly
  - `useTheme.ts` - Dark/light mode management
- Subdirectories: None

**app/layouts/**
- Purpose: Page layout wrappers
- Contains: Layout components for consistent page structure
- Key files:
  - `default.vue` - Simple default layout
  - `three-column.vue` - Multi-column layout (alternative)
- Subdirectories: None

**app/pages/**
- Purpose: Nuxt file-based routing
- Contains: Page components mapped to routes
- Key files:
  - `index.vue` - Main application page (root route `/`)
- Subdirectories: None (single-page app)

**app/stores/**
- Purpose: Pinia global state management (defined but underutilized)
- Contains: State stores for devices and transfers
- Key files:
  - `devices.ts` - Device discovery state
  - `transfers.ts` - File transfer tracking state
- Subdirectories: None

**app/types/**
- Purpose: TypeScript type definitions
- Contains: Core interfaces for the application
- Key files:
  - `index.ts` - All type definitions (Device, Transfer, FileMetadata, etc.)
- Subdirectories: None

**server/routes/**
- Purpose: Nitro server route handlers
- Contains: WebSocket handler for signaling
- Key files:
  - `ws.ts` - WebSocket signaling server for device discovery
- Subdirectories: None

## Key File Locations

**Entry Points:**
- `app.vue` - Root Vue component (app shell, theme setup)
- `app/pages/index.vue` - Main page (composable orchestration, UI)
- `server/routes/ws.ts` - WebSocket server endpoint

**Configuration:**
- `nuxt.config.ts` - Nuxt framework configuration
- `tsconfig.json` - TypeScript compiler options
- `tailwind.config.ts` - Tailwind CSS theme customization
- `package.json` - Dependencies and npm scripts

**Core Logic:**
- `app/composables/useDeviceDiscovery.ts` - Device discovery logic
- `app/composables/useWebRTC.ts` - WebRTC connection management
- `app/composables/useFileTransfer.ts` - File transfer protocol

**Testing:**
- Not configured (no test files present)

**Documentation:**
- `README.md` - User-facing documentation
- `THEME_GUIDE.md` - Theme customization guide
- `local-share-app-guide.md` - Implementation guide

## Naming Conventions

**Files:**
- PascalCase.vue: Vue components (`DeviceList.vue`, `FileUploader.vue`)
- camelCase.ts: TypeScript files (`useWebRTC.ts`, `devices.ts`)
- kebab-case.vue: Layout files (`three-column.vue`)
- lowercase.ts: Server routes (`ws.ts`)

**Directories:**
- lowercase: All directories (`components/`, `composables/`, `stores/`)
- Plural for collections: `components/`, `stores/`, `layouts/`

**Special Patterns:**
- `use` prefix: Composable functions (`useDeviceDiscovery`, `useWebRTC`)
- `index.ts`: Type barrel exports (`app/types/index.ts`)

## Where to Add New Code

**New Feature/Page:**
- Primary code: `app/pages/{feature}.vue`
- Components: `app/components/{FeatureName}.vue`
- Logic: `app/composables/use{Feature}.ts`
- Types: `app/types/index.ts` (add to existing file)

**New Component:**
- Implementation: `app/components/{ComponentName}.vue`
- Types: `app/types/index.ts` (if new interfaces needed)

**New Composable:**
- Implementation: `app/composables/use{Name}.ts`
- Pattern: Export reactive refs and functions

**New Server Route:**
- Implementation: `server/routes/{name}.ts`
- WebSocket: Use `defineWebSocketHandler`
- HTTP: Use `defineEventHandler`

**Utilities:**
- Shared helpers: Create `app/utils/` directory (doesn't exist yet)
- Type definitions: `app/types/index.ts`

## Special Directories

**.nuxt/**
- Purpose: Generated Nuxt build files
- Source: Auto-generated by Nuxt dev/build
- Committed: No (gitignored)

**.output/**
- Purpose: Production build output
- Source: Generated by `npm run build`
- Committed: No (gitignored)

**public/**
- Purpose: Static assets served at root
- Source: Manual
- Committed: Yes

---

*Structure analysis: 2026-01-15*
*Update when directory structure changes*
