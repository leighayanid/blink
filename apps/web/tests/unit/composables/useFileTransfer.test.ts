import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockConnection() {
  const handlers: Record<string, Array<(...args: unknown[]) => void>> = {}
  const conn: any = {
    peer: 'remote-peer',
    open: true,
    send: vi.fn(),
    close: vi.fn(),
    on(event: string, handler: (...args: unknown[]) => void) {
      if (!handlers[event]) handlers[event] = []
      handlers[event].push(handler)
      return conn
    },
    _emit(event: string, ...args: unknown[]) {
      handlers[event]?.forEach(h => h(...args))
    },
  }
  return conn
}

function makeFile(content = 'hello world', name = 'test.txt', type = 'text/plain') {
  return new File([content], name, { type })
}

// ---------------------------------------------------------------------------
// Stub browser download APIs
// ---------------------------------------------------------------------------
const mockAnchor = {
  href: '',
  download: '',
  click: vi.fn(),
  style: {},
}

vi.stubGlobal('URL', {
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn(),
})

vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
  if (tag === 'a') return mockAnchor as unknown as HTMLElement
  return document.createElement(tag)
})

vi.spyOn(document.body, 'appendChild').mockImplementation((el) => el)
vi.spyOn(document.body, 'removeChild').mockImplementation((el) => el)

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useFileTransfer', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockAnchor.click.mockClear()
    ;(URL.createObjectURL as ReturnType<typeof vi.fn>).mockClear()
    ;(URL.revokeObjectURL as ReturnType<typeof vi.fn>).mockClear()
  })

  // ---------------------------------------------------------------------------
  // sendFile
  // ---------------------------------------------------------------------------
  describe('sendFile', () => {
    it('creates a transfer entry with status "sending"', async () => {
      const { useFileTransfer } = await import('../../../app/composables/useFileTransfer')
      const { sendFile, transfers } = useFileTransfer()
      const conn = createMockConnection()
      const file = makeFile('data', 'file.txt')

      const promise = sendFile(file, conn)
      // The transfer is created synchronously before any chunks are sent
      expect(transfers.value.some(t => t.fileName === 'file.txt' && t.status === 'sending')).toBe(true)
      await promise
    })

    it('sends file-meta message first', async () => {
      const { useFileTransfer } = await import('../../../app/composables/useFileTransfer')
      const { sendFile } = useFileTransfer()
      const conn = createMockConnection()
      const file = makeFile('data', 'photo.png', 'image/png')

      await sendFile(file, conn)
      const firstCall = JSON.parse(conn.send.mock.calls[0][0])
      expect(firstCall.type).toBe('file-meta')
      expect(firstCall.metadata.name).toBe('photo.png')
      expect(firstCall.metadata.type).toBe('image/png')
    })

    it('sends a file-complete message at the end', async () => {
      const { useFileTransfer } = await import('../../../app/composables/useFileTransfer')
      const { sendFile } = useFileTransfer()
      const conn = createMockConnection()
      await sendFile(makeFile('abc'), conn)
      const calls = conn.send.mock.calls.map((c: unknown[]) => {
        try { return JSON.parse(c[0] as string) } catch { return c[0] }
      })
      expect(calls.some((c: any) => c.type === 'file-complete')).toBe(true)
    })

    it('sends file-chunk JSON descriptor before each binary chunk', async () => {
      const { useFileTransfer } = await import('../../../app/composables/useFileTransfer')
      const { sendFile } = useFileTransfer()
      const conn = createMockConnection()
      await sendFile(makeFile('abcdef'), conn)
      const jsonCalls = conn.send.mock.calls
        .filter((c: unknown[]) => typeof c[0] === 'string')
        .map((c: unknown[]) => JSON.parse(c[0] as string))
      expect(jsonCalls.some((c: any) => c.type === 'file-chunk')).toBe(true)
    })

    it('marks transfer as "completed" after sending', async () => {
      const { useFileTransfer } = await import('../../../app/composables/useFileTransfer')
      const { sendFile, transfers } = useFileTransfer()
      const conn = createMockConnection()
      await sendFile(makeFile('content'), conn)
      const completed = [...transfers.value].find(t => t.status === 'completed')
      expect(completed).toBeDefined()
    })

    it('marks transfer as "failed" and rethrows on send error', async () => {
      const { useFileTransfer } = await import('../../../app/composables/useFileTransfer')
      const { sendFile, transfers } = useFileTransfer()
      const conn = createMockConnection()
      conn.send.mockImplementationOnce(() => { throw new Error('send-fail') })
      await expect(sendFile(makeFile('x'), conn)).rejects.toThrow('send-fail')
      const failed = [...transfers.value].find(t => t.status === 'failed')
      expect(failed).toBeDefined()
    })

    it('returns the transferId', async () => {
      const { useFileTransfer } = await import('../../../app/composables/useFileTransfer')
      const { sendFile } = useFileTransfer()
      const conn = createMockConnection()
      const id = await sendFile(makeFile('x'), conn)
      expect(typeof id).toBe('string')
      expect(id).toMatch(/^transfer-/)
    })
  })

  // ---------------------------------------------------------------------------
  // receiveFile
  // ---------------------------------------------------------------------------
  describe('receiveFile', () => {
    it('registers a transfer on file-meta', async () => {
      const { useFileTransfer } = await import('../../../app/composables/useFileTransfer')
      const { receiveFile, transfers } = useFileTransfer()
      const conn = createMockConnection()
      receiveFile(conn)

      conn._emit('data', JSON.stringify({
        type: 'file-meta',
        transferId: 'rx-1',
        metadata: { name: 'recv.txt', size: 1024, type: 'text/plain', lastModified: Date.now() }
      }))

      expect(transfers.value.some((t: any) => t.fileName === 'recv.txt' && t.status === 'receiving')).toBe(true)
    })

    it('tracks totalChunks from file-chunk descriptor', async () => {
      const { useFileTransfer } = await import('../../../app/composables/useFileTransfer')
      const { receiveFile } = useFileTransfer()
      const conn = createMockConnection()
      receiveFile(conn)

      conn._emit('data', JSON.stringify({
        type: 'file-meta',
        transferId: 'rx-2',
        metadata: { name: 'f.bin', size: 2048, type: 'application/octet-stream', lastModified: 0 }
      }))
      conn._emit('data', JSON.stringify({
        type: 'file-chunk',
        transferId: 'rx-2',
        chunkIndex: 0,
        totalChunks: 4
      }))
      // No throws expected
    })

    it('downloads file and marks completed on file-complete', async () => {
      const { useFileTransfer } = await import('../../../app/composables/useFileTransfer')
      const { receiveFile, transfers } = useFileTransfer()
      const conn = createMockConnection()
      receiveFile(conn)

      const tid = 'rx-3'
      conn._emit('data', JSON.stringify({
        type: 'file-meta',
        transferId: tid,
        metadata: { name: 'done.txt', size: 5, type: 'text/plain', lastModified: 0 }
      }))
      conn._emit('data', JSON.stringify({
        type: 'file-chunk', transferId: tid, chunkIndex: 0, totalChunks: 1
      }))
      // Send binary chunk
      conn._emit('data', new TextEncoder().encode('hello').buffer)

      // Allow microtasks to settle
      await new Promise(r => setTimeout(r, 0))

      conn._emit('data', JSON.stringify({ type: 'file-complete', transferId: tid }))
      await new Promise(r => setTimeout(r, 0))

      expect(URL.createObjectURL).toHaveBeenCalled()
      expect(mockAnchor.click).toHaveBeenCalled()
      expect(mockAnchor.download).toBe('done.txt')

      const completed = [...transfers.value].find((t: any) => t.id === tid)
      expect(completed?.status).toBe('completed')
    })

    it('handles ArrayBuffer binary data', async () => {
      const { useFileTransfer } = await import('../../../app/composables/useFileTransfer')
      const { receiveFile } = useFileTransfer()
      const conn = createMockConnection()
      receiveFile(conn)

      conn._emit('data', JSON.stringify({
        type: 'file-meta',
        transferId: 'buf-1',
        metadata: { name: 'buf.bin', size: 3, type: 'application/octet-stream', lastModified: 0 }
      }))
      conn._emit('data', JSON.stringify({
        type: 'file-chunk', transferId: 'buf-1', chunkIndex: 0, totalChunks: 1
      }))
      const buf = new ArrayBuffer(3)
      conn._emit('data', buf)
      // Should not throw
    })

    it('handles Uint8Array (ArrayBufferView) binary data', async () => {
      const { useFileTransfer } = await import('../../../app/composables/useFileTransfer')
      const { receiveFile } = useFileTransfer()
      const conn = createMockConnection()
      receiveFile(conn)

      conn._emit('data', JSON.stringify({
        type: 'file-meta',
        transferId: 'view-1',
        metadata: { name: 'view.bin', size: 3, type: 'application/octet-stream', lastModified: 0 }
      }))
      conn._emit('data', JSON.stringify({
        type: 'file-chunk', transferId: 'view-1', chunkIndex: 0, totalChunks: 1
      }))
      conn._emit('data', new Uint8Array([1, 2, 3]))
      // Should not throw
    })
  })

  // ---------------------------------------------------------------------------
  // downloadFile — dangerous extension warning
  // ---------------------------------------------------------------------------
  describe('downloadFile (via receiveFile + file-complete)', () => {
    it('warns for dangerous file extensions', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { useFileTransfer } = await import('../../../app/composables/useFileTransfer')
      const { receiveFile } = useFileTransfer()
      const conn = createMockConnection()
      receiveFile(conn)

      const tid = 'danger-1'
      conn._emit('data', JSON.stringify({
        type: 'file-meta',
        transferId: tid,
        metadata: { name: 'evil.exe', size: 0, type: 'application/x-msdownload', lastModified: 0 }
      }))
      conn._emit('data', JSON.stringify({ type: 'file-complete', transferId: tid }))
      await new Promise(r => setTimeout(r, 0))

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('.exe'))
      consoleSpy.mockRestore()
    })
  })

  // ---------------------------------------------------------------------------
  // clearTransfer / clearCompleted
  // ---------------------------------------------------------------------------
  describe('clearTransfer / clearCompleted', () => {
    it('clearTransfer removes a transfer', async () => {
      const { useFileTransfer } = await import('../../../app/composables/useFileTransfer')
      const { sendFile, clearTransfer, transfers } = useFileTransfer()
      const conn = createMockConnection()
      const id = await sendFile(makeFile('x'), conn)
      clearTransfer(id)
      expect(transfers.value.find((t: any) => t.id === id)).toBeUndefined()
    })

    it('clearCompleted removes all completed transfers', async () => {
      const { useFileTransfer } = await import('../../../app/composables/useFileTransfer')
      const { sendFile, clearCompleted, transfers } = useFileTransfer()
      const conn = createMockConnection()
      await sendFile(makeFile('x'), conn)
      clearCompleted()
      const completed = transfers.value.filter((t: any) => t.status === 'completed')
      expect(completed).toHaveLength(0)
    })
  })
})
