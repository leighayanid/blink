# Testing Patterns

**Analysis Date:** 2026-01-15

## Test Framework

**Runner:**
- Not configured
- `package.json` shows placeholder: `"test": "echo \"Error: no test specified\" && exit 1"`

**Assertion Library:**
- Not installed

**Run Commands:**
```bash
npm test                    # Placeholder - exits with error
```

## Test File Organization

**Location:**
- No test files present in codebase

**Naming:**
- Not established (no tests exist)

**Structure:**
- Not established

**Recommended Structure (for future):**
```
app/
├── composables/
│   ├── useDeviceDiscovery.ts
│   └── __tests__/
│       └── useDeviceDiscovery.spec.ts
├── components/
│   ├── FileUploader.vue
│   └── __tests__/
│       └── FileUploader.spec.ts
└── stores/
    ├── devices.ts
    └── __tests__/
        └── devices.spec.ts
```

## Test Structure

**Suite Organization:**
- Not established

**Patterns:**
- Not established

**Recommended Pattern:**
```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('ModuleName', () => {
  describe('functionName', () => {
    beforeEach(() => {
      // Reset state
    })

    it('should handle success case', () => {
      // arrange
      // act
      // assert
    })

    it('should handle error case', () => {
      // test code
    })
  })
})
```

## Mocking

**Framework:**
- Not configured

**Patterns:**
- Not established

**Would Need to Mock:**
- WebSocket API for device discovery tests
- PeerJS library for WebRTC tests
- FileReader API for file transfer tests
- localStorage for persistence tests

## Fixtures and Factories

**Test Data:**
- Not established

**Recommended Factories:**
```typescript
// Device factory
function createTestDevice(overrides?: Partial<Device>): Device {
  return {
    id: 'test-device-id',
    name: 'Test Device',
    platform: 'macOS',
    timestamp: Date.now(),
    ...overrides
  }
}

// Transfer factory
function createTestTransfer(overrides?: Partial<Transfer>): Transfer {
  return {
    id: 'test-transfer-id',
    fileName: 'test.txt',
    fileSize: 1024,
    progress: 0,
    status: 'pending',
    ...overrides
  }
}
```

## Coverage

**Requirements:**
- No coverage requirements defined
- No coverage tooling configured

**Configuration:**
- Not configured

**View Coverage:**
- Not available

## Test Types

**Unit Tests:**
- Not implemented
- Priority targets:
  - `useFileTransfer.ts` - File chunking logic
  - `useDeviceDiscovery.ts` - Message parsing
  - Type validation utilities

**Integration Tests:**
- Not implemented
- Priority targets:
  - WebSocket connection lifecycle
  - WebRTC connection establishment
  - Full file transfer flow

**E2E Tests:**
- Not implemented
- Would require: Playwright or Cypress
- Priority targets:
  - Device discovery across tabs
  - File transfer between peers
  - Error recovery scenarios

## Common Patterns

**Async Testing:**
- Not established

**Error Testing:**
- Not established

**Snapshot Testing:**
- Not used

## Recommended Testing Setup

**Suggested Tech Stack:**
1. **Test Runner**: Vitest (Vite-native, fast, Nuxt-compatible)
2. **Component Testing**: @vue/test-utils + @nuxt/test-utils
3. **Assertion Library**: Vitest built-in expect
4. **Mocking**: Vitest vi.mock()
5. **E2E Testing**: Playwright
6. **Coverage**: Vitest c8 built-in

**Installation Commands:**
```bash
npm install -D vitest @vue/test-utils @nuxt/test-utils happy-dom
```

**Config File (vitest.config.ts):**
```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', '.nuxt/']
    }
  }
})
```

## Critical Test Gaps

**High Priority (must test):**
1. File transfer chunking and reassembly logic
2. WebSocket message parsing and handling
3. WebRTC connection state management
4. Error handling in all composables

**Medium Priority (should test):**
1. Device list component rendering
2. File uploader drag-drop behavior
3. Transfer progress calculations
4. Pinia store mutations (if used)

**Low Priority (nice to have):**
1. Theme switching
2. Platform icon mapping
3. File size formatting

## Manual Testing Documented

From `README.md`:
```
### Testing Checklist
- [ ] Devices are discovered on the same network
- [ ] Can establish WebRTC connections
- [ ] Can send single and multiple files
- [ ] Progress updates correctly
- [ ] Large files transfer successfully
- [ ] App handles connection drops gracefully
- [ ] Works across different platforms
```

---

*Testing analysis: 2026-01-15*
*Update when test patterns change*
