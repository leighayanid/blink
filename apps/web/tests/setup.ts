import { vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Nuxt / Nitro auto-import stubs
// These globals are injected by Nuxt at runtime but don't exist in Vitest.
// ---------------------------------------------------------------------------

vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({
  public: {
    wsUrl: 'ws://localhost:3000/ws',
    signalingServer: 'http://localhost:3000',
  },
})))

// defineWebSocketHandler is a Nitro global. We stub it so that
// `export default defineWebSocketHandler({...})` returns the handler directly,
// making server tests easy to invoke.
vi.stubGlobal('defineWebSocketHandler', vi.fn((handler: unknown) => handler))

// ---------------------------------------------------------------------------
// Global localStorage reset between tests
// ---------------------------------------------------------------------------
beforeEach(() => {
  localStorage.clear()
})
