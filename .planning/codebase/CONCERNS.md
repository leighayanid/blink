# Codebase Concerns

**Analysis Date:** 2026-01-15

## Tech Debt

**Pinia stores defined but unused:**
- Issue: Stores exist but composables manage state directly instead
- Files: `app/stores/devices.ts`, `app/stores/transfers.ts`
- Why: Likely evolved from store-based to composable-based architecture
- Impact: Confusion about state management approach, dead code
- Fix approach: Either remove stores or migrate state from composables to stores

**Duplicate getPlatformIcon() function:**
- Issue: Same icon mapping function copy-pasted in 3 files
- Files: `app/pages/index.vue`, `app/components/DeviceList.vue`, `app/components/LocalDeviceCard.vue`
- Why: Added to each component independently
- Impact: Maintenance burden, inconsistency risk
- Fix approach: Extract to `app/utils/platform.ts` and import

**Unused dependencies in package.json:**
- Issue: Dependencies installed but not imported
- Files: `package.json`
- Packages: `socket.io-client` (native WebSocket used), `qrcode.vue` (feature not implemented)
- Why: Likely planned features or changed approach
- Impact: Unnecessary bundle size, confusing dependencies
- Fix approach: Remove unused packages or implement planned features

## Known Bugs

**No critical bugs identified during static analysis.**

Potential issues (not confirmed bugs):
- WebSocket reconnection has no maximum retry limit (could loop forever)
- File transfer has no recovery mechanism if connection drops mid-transfer

## Security Considerations

**No file type validation:**
- Risk: Any file type accepted for transfer, including executables
- File: `app/components/FileUploader.vue`
- Current mitigation: None
- Recommendations: Add file type whitelist or warning for executable types

**No file size limits:**
- Risk: Large files could exhaust browser memory
- File: `app/composables/useFileTransfer.ts`
- Current mitigation: None (relies on browser limits)
- Recommendations: Add configurable file size limit with user warning

**Unvalidated WebSocket messages:**
- Risk: Malformed JSON could cause parsing errors or unexpected behavior
- File: `server/routes/ws.ts`
- Current mitigation: Try-catch around JSON.parse (silent failure)
- Recommendations: Add schema validation for incoming messages

**Device names not sanitized:**
- Risk: Potential XSS if device name contains malicious content
- Files: `app/components/DeviceList.vue`, `app/pages/index.vue`
- Current mitigation: Vue's default escaping in templates
- Recommendations: Add explicit sanitization for user-controlled strings

**localStorage values not validated:**
- Risk: Corrupted localStorage could cause runtime errors
- File: `app/composables/useDeviceDiscovery.ts`
- Current mitigation: None
- Recommendations: Add type checking when reading from localStorage

## Performance Bottlenecks

**Fixed delays in file transfer:**
- Problem: Hardcoded setTimeout delays (100ms, 10ms) control message ordering
- File: `app/composables/useFileTransfer.ts`
- Measurement: 10ms delay per chunk = ~10 seconds overhead per 1000 chunks
- Cause: Workaround for message ordering without proper sequencing
- Improvement path: Implement proper message sequencing protocol

**No backpressure handling:**
- Problem: File chunks sent as fast as possible without checking buffer state
- File: `app/composables/useFileTransfer.ts`
- Measurement: Not measured, depends on network speed
- Cause: Simple fire-and-forget sending pattern
- Improvement path: Check DataChannel bufferedAmount before sending

**Inefficient device list filtering:**
- Problem: Filter function runs on every render
- File: `app/pages/index.vue` (line 36)
- Measurement: Negligible for small lists, could matter at scale
- Cause: Inline filter in template
- Improvement path: Use computed property for filtered list

## Fragile Areas

**File transfer protocol:**
- File: `app/composables/useFileTransfer.ts`
- Why fragile: Relies on setTimeout for message ordering, no error recovery
- Common failures: Out-of-order messages, incomplete transfers on disconnect
- Safe modification: Add message sequencing, implement retry logic
- Test coverage: None

**WebSocket reconnection logic:**
- File: `app/composables/useDeviceDiscovery.ts`
- Why fragile: Unbounded reconnection attempts, no exponential backoff
- Common failures: Infinite reconnection loop if server down
- Safe modification: Add max retries, implement backoff strategy
- Test coverage: None

**WebRTC connection handling:**
- File: `app/composables/useWebRTC.ts`
- Why fragile: Uses `any` types, connection state not fully tracked
- Common failures: Stale connections, missed error events
- Safe modification: Add proper typing, implement connection state machine
- Test coverage: None

## Scaling Limits

**In-memory device registry (server):**
- Current capacity: Hundreds of devices
- Limit: Server memory, Map performance
- Symptoms at limit: Slow broadcasts, memory exhaustion
- Scaling path: Use Redis pub/sub for multi-instance deployment

**Browser memory for file transfer:**
- Current capacity: Depends on device, typically 1-2GB
- Limit: Browser tab memory limit
- Symptoms at limit: Tab crash, incomplete transfer
- Scaling path: Implement streaming instead of buffering entire file

## Dependencies at Risk

**PeerJS:**
- Risk: Last npm release in 2021, limited maintenance
- Impact: WebRTC issues may not be fixed upstream
- Migration plan: Consider direct WebRTC implementation or alternative library

**Nuxt 4:**
- Risk: Still relatively new, API may change
- Impact: Breaking changes in minor versions
- Migration plan: Pin version, test upgrades carefully

## Missing Critical Features

**No transfer resume:**
- Problem: Failed transfers must restart from beginning
- Current workaround: Manual retry
- Blocks: Large file transfers over unstable connections
- Implementation complexity: Medium (requires chunk tracking)

**No transfer encryption:**
- Problem: Files sent in plain binary over WebRTC
- Current workaround: WebRTC provides transport encryption
- Blocks: Sensitive file transfer use cases
- Implementation complexity: Medium (add application-layer encryption)

**No file validation:**
- Problem: Received files not verified for integrity
- Current workaround: None
- Blocks: Reliable transfer confirmation
- Implementation complexity: Low (add checksum verification)

## Test Coverage Gaps

**All composables untested:**
- What's not tested: `useDeviceDiscovery`, `useWebRTC`, `useFileTransfer`, `useTheme`
- Risk: Regressions in core functionality
- Priority: High
- Difficulty to test: Medium (need to mock WebSocket, PeerJS)

**All components untested:**
- What's not tested: `DeviceList`, `FileUploader`, `TransferProgress`, `LocalDeviceCard`
- Risk: UI regressions
- Priority: Medium
- Difficulty to test: Low (Vue Test Utils available)

**Server route untested:**
- What's not tested: `server/routes/ws.ts`
- Risk: Signaling server bugs
- Priority: High
- Difficulty to test: Medium (need WebSocket mocking)

## Type Safety Issues

**Excessive use of `any` type:**
- Files with `any`:
  - `app/composables/useWebRTC.ts` - connections Map, function parameters
  - `app/pages/index.vue` - connection.get() returns
- Impact: Loss of compile-time type safety
- Fix approach: Add proper typing for PeerJS DataConnection

---

*Concerns audit: 2026-01-15*
*Update as issues are fixed or new ones discovered*
