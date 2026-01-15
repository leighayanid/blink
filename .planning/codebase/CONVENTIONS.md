# Coding Conventions

**Analysis Date:** 2026-01-15

## Naming Patterns

**Files:**
- PascalCase for Vue components: `DeviceList.vue`, `FileUploader.vue`, `TransferProgress.vue`
- camelCase with `use` prefix for composables: `useDeviceDiscovery.ts`, `useWebRTC.ts`
- camelCase for store files: `devices.ts`, `transfers.ts`
- lowercase for server routes: `ws.ts`
- kebab-case for layouts: `three-column.vue`, `default.vue`

**Functions:**
- camelCase for all functions: `connectToPeer()`, `sendFile()`, `handleDeviceSelect()`
- `use` prefix for composables: `useDeviceDiscovery()`, `useWebRTC()`
- `handle` prefix for event handlers: `handleDeviceConnect()`, `handleDrop()`, `handleFilesSelected()`
- `get` prefix for getters: `getPlatformIcon()`, `getDeviceName()`
- `init` prefix for initialization: `initDevice()`, `initPeer()`

**Variables:**
- camelCase for variables: `localDevice`, `connectedPeers`, `selectedFiles`
- Boolean flags use `is` prefix: `isDark`, `isDragging`, `isConnected`
- UPPER_SNAKE_CASE for constants: `CHUNK_SIZE = 64 * 1024`

**Types:**
- PascalCase for interfaces: `Device`, `Transfer`, `FileMetadata`, `ChunkData`
- PascalCase for type aliases: `SignalingMessage`
- No `I` prefix for interfaces (use `Device`, not `IDevice`)

## Code Style

**Formatting:**
- 2-space indentation throughout
- No semicolons at end of statements
- Single quotes for strings in TypeScript: `'file-meta'`, `'sending'`
- Double quotes in HTML attributes: `:class="[isDark ? 'dark' : '']"`
- No trailing commas

**TypeScript:**
- Strict mode enabled (`tsconfig.json`)
- Explicit return types on public functions
- Type imports: `import type { Device } from '../types'`
- Some `any` types present (see CONCERNS.md for issues)

**Linting:**
- No ESLint configured
- No Prettier configured
- Relies on TypeScript compiler for type checking

## Import Organization

**Order:**
1. Vue/Nuxt imports: `import { ref, watch, onMounted } from 'vue'`
2. Type imports: `import type { Device } from '../types'`
3. Composable imports: `import { useDeviceDiscovery } from '../composables/useDeviceDiscovery'`
4. External libraries: `import Peer from 'peerjs'`

**Grouping:**
- No enforced blank lines between groups (inconsistent)
- No alphabetical sorting enforced

**Path Aliases:**
- `~/*` maps to project root (from `tsconfig.json`)
- Relative imports used within app directory: `../types`, `../composables/`

## Error Handling

**Patterns:**
- Try-catch at operation boundaries
- Console logging for all errors with module prefix
- Promise rejection for async operation failures

**Error Types:**
- Throw on connection failures
- Silent failures for non-critical operations (JSON parse)
- User alerts for critical failures (connection errors)

**Examples:**
```typescript
// Composable error pattern
try {
  await operation()
} catch (error) {
  console.error('[ModuleName] Operation failed:', error)
  throw error
}

// Event handler error pattern
try {
  await handleAction()
} catch (error) {
  console.error('[Page] Action failed:', error)
  alert(`Failed: ${error.message}`)
}
```

## Logging

**Framework:**
- Native console.log/console.error
- No external logging library

**Patterns:**
- Module prefixes in brackets: `[Discovery]`, `[WebRTC]`, `[FileTransfer]`, `[Page]`
- Include relevant context: `console.log('[WebRTC] Connecting to peer:', peerId)`
- Error logging includes error object: `console.error('[Discovery] Error:', error)`

**When:**
- Log connection state changes
- Log incoming/outgoing messages
- Log errors and exceptions
- No production log level filtering

## Comments

**When to Comment:**
- Complex logic explanations (minimal usage currently)
- Debug logging serves as implicit documentation
- JSDoc not consistently used

**JSDoc/TSDoc:**
- Not consistently applied
- Some composables have header comments
- Public APIs lack documentation

**TODO Comments:**
- Not found in codebase (clean of TODOs)

## Function Design

**Size:**
- Most functions under 50 lines
- `receiveFile()` in `useFileTransfer.ts` is longest (~65 lines)

**Parameters:**
- Typically 1-3 parameters
- Options objects not used (could benefit)
- Destructuring used in some cases

**Return Values:**
- Explicit returns for functions with values
- Void returns for event handlers
- Async functions return Promises

## Module Design

**Exports:**
- Named exports for composables: `export function useDeviceDiscovery()`
- Named exports for types: `export interface Device`
- Default exports for Vue components (implicit via SFC)

**Barrel Files:**
- `app/types/index.ts` exports all types
- No barrel files for components or composables

**Vue Component Structure:**
```vue
<template>
  <!-- HTML template -->
</template>

<script setup lang="ts">
// Imports
// Props/Emits definitions
// Composable usage
// Local state
// Computed properties
// Methods
</script>

<style scoped>
/* Component styles */
</style>
```

## CSS Conventions

**Approach:**
- Scoped styles in Vue components: `<style scoped>`
- CSS custom properties for theming
- Tailwind utility classes available but sparingly used

**Naming:**
- BEM-like naming: `.device-card`, `.device-header`, `.file-name`
- State modifiers: `.connected`, `.selected`, `.active`
- Status variants: `.sending`, `.receiving`, `.completed`, `.failed`

**Theme Variables:**
```css
:root {
  --color-primary: #FFA500;
  --bg-primary: #FFFAF0;
  --text-primary: #2C3E50;
}

html.dark {
  --color-primary: #FF9500;
  --bg-primary: #0F1419;
}
```

---

*Convention analysis: 2026-01-15*
*Update when patterns change*
