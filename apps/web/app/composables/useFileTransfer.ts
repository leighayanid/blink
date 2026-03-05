import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import type { Transfer, FileMetadata } from '@blink/types'
import { useTransfersStore } from '../stores/transfers'

// File extensions that browsers may auto-execute or prompt to open dangerously.
const DANGEROUS_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'com', 'msi', 'ps1', 'vbs', 'js', 'jse',
  'wsf', 'wsh', 'reg', 'scr', 'pif', 'hta', 'jar', 'sh', 'bash',
  'zsh', 'fish', 'csh', 'ksh', 'html', 'htm', 'xhtml', 'svg', 'xml',
  'php', 'py', 'rb', 'pl', 'lua', 'app', 'deb', 'rpm', 'dmg', 'pkg',
  'apk', 'ipa'
])

interface ReceiveOperation {
  id: string
  chunks: ArrayBuffer[]
  metadata: FileMetadata | null
  receivedChunks: number
  totalChunks: number
  /** transferId of the metadata frame we're waiting for a binary chunk for */
  pendingBinaryTransferId: string | null
}

type TransferConnection = {
  peer: string
  send: (...args: any[]) => unknown
  on: (...args: any[]) => unknown
}

export interface IncomingFilePrompt {
  transferId: string
  metadata: FileMetadata
  connection: TransferConnection
}

interface ReceiveFileOptions {
  onIncomingFile?: (incoming: IncomingFilePrompt) => boolean | Promise<boolean>
}

type DecisionWaiter = {
  resolve: () => void
  reject: (error: Error) => void
  timeoutId: ReturnType<typeof setTimeout>
}

const DECISION_TIMEOUT_MS = 30000
const decisionListeners = new WeakSet<TransferConnection>()
const pendingDecisions = new WeakMap<TransferConnection, Map<string, DecisionWaiter>>()

export const useFileTransfer = () => {
  const store = useTransfersStore()
  const { activeTransfers, completedTransfers, failedTransfers } = storeToRefs(store)

  const transfers = computed(() => [
    ...activeTransfers.value,
    ...completedTransfers.value,
    ...failedTransfers.value
  ])

  const CHUNK_SIZE = 64 * 1024 // 64 KB

  const generateTransferId = (): string => {
    return `transfer-${crypto.randomUUID()}`
  }

  const getDecisionMap = (connection: TransferConnection) => {
    const existing = pendingDecisions.get(connection)
    if (existing) return existing

    const created = new Map<string, DecisionWaiter>()
    pendingDecisions.set(connection, created)
    return created
  }

  const clearPendingDecisionsForConnection = (connection: TransferConnection, reason: string) => {
    const map = pendingDecisions.get(connection)
    if (!map) return

    for (const [transferId, waiter] of map.entries()) {
      clearTimeout(waiter.timeoutId)
      waiter.reject(new Error(`${reason} (${transferId})`))
    }
    map.clear()
  }

  const ensureDecisionListener = (connection: TransferConnection) => {
    if (decisionListeners.has(connection)) return
    decisionListeners.add(connection)

    connection.on('data', (data: unknown) => {
      if (typeof data !== 'string') return

      let message: { type?: string; transferId?: string; reason?: string }
      try {
        message = JSON.parse(data)
      } catch {
        return
      }

      if ((message.type !== 'file-accept' && message.type !== 'file-reject') || typeof message.transferId !== 'string') {
        return
      }

      const map = pendingDecisions.get(connection)
      const waiter = map?.get(message.transferId)
      if (!waiter) return

      clearTimeout(waiter.timeoutId)
      map?.delete(message.transferId)

      if (message.type === 'file-accept') {
        waiter.resolve()
        return
      }

      const reason = typeof message.reason === 'string' && message.reason.length > 0
        ? message.reason
        : 'Receiver declined the file'
      waiter.reject(new Error(reason))
    })

    connection.on('close', () => {
      clearPendingDecisionsForConnection(connection, 'Connection closed before transfer decision')
    })
  }

  const waitForReceiverDecision = (connection: TransferConnection, transferId: string) => {
    ensureDecisionListener(connection)

    const map = getDecisionMap(connection)

    return new Promise<void>((resolve, reject) => {
      if (map.has(transferId)) {
        reject(new Error(`Duplicate transfer decision waiter: ${transferId}`))
        return
      }

      const timeoutId = setTimeout(() => {
        map.delete(transferId)
        reject(new Error('Receiver confirmation timed out'))
      }, DECISION_TIMEOUT_MS)

      map.set(transferId, { resolve, reject, timeoutId })
    })
  }

  const sendFile = async (file: File, connection: TransferConnection): Promise<string> => {
    const transferId = generateTransferId()

    const transfer: Transfer = {
      id: transferId,
      fileName: file.name,
      fileSize: file.size,
      progress: 0,
      status: 'sending',
      startTime: Date.now()
    }

    store.addTransfer(transfer)

    try {
      // Send file metadata
      connection.send(JSON.stringify({
        type: 'file-meta',
        transferId,
        metadata: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }
      }))

      // Wait for explicit receiver confirmation before streaming binary chunks.
      await waitForReceiverDecision(connection, transferId)

      const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
      let chunkIndex = 0

      for (let offset = 0; offset < file.size; offset += CHUNK_SIZE) {
        const chunk = file.slice(offset, offset + CHUNK_SIZE)
        const arrayBuffer = await chunk.arrayBuffer()

        // Send chunk descriptor, then the binary payload immediately after.
        // The receiver correlates binary data to the preceding descriptor
        // within the same ordered, reliable DataChannel.
        connection.send(JSON.stringify({
          type: 'file-chunk',
          transferId,
          chunkIndex,
          totalChunks
        }))

        connection.send(arrayBuffer)

        chunkIndex++

        const progress = Math.min(((offset + CHUNK_SIZE) / file.size) * 100, 100)
        store.updateTransfer(transferId, { progress })
      }

      // Signal end of file
      connection.send(JSON.stringify({
        type: 'file-complete',
        transferId
      }))

      store.updateTransfer(transferId, {
        status: 'completed',
        endTime: Date.now(),
        progress: 100
      })

      console.log(`[FileTransfer] File sent successfully: ${file.name}`)
      return transferId
    } catch (error) {
      console.error('[FileTransfer] Error sending file:', error)
      store.updateTransfer(transferId, { status: 'failed' })
      throw error
    }
  }

  /**
   * Registers a data handler on `connection` for incoming files.
   * Must be called immediately when a connection is established.
   * Supports multiple concurrent files from the same peer because each JSON
   * file-chunk frame identifies the transferId for the binary that follows.
   */
  const receiveFile = (connection: TransferConnection, options?: ReceiveFileOptions) => {
    // Map from transferId → receive state for this connection
    const receiveMap = new Map<string, ReceiveOperation>()
    // transferId of the most recent 'file-chunk' descriptor — next binary belongs to it
    let pendingTransferId: string | null = null

    const pushChunk = async (chunkData: ArrayBuffer) => {
      const id = pendingTransferId
      if (!id) return
      pendingTransferId = null

      const op = receiveMap.get(id)
      if (!op) return

      op.chunks.push(chunkData)
      op.receivedChunks++

      let progress = 0
      if (op.totalChunks > 0) {
        progress = (op.receivedChunks / op.totalChunks) * 100
      } else if (op.metadata?.size) {
        const receivedBytes = op.chunks.reduce((acc, c) => acc + c.byteLength, 0)
        progress = Math.min(100, (receivedBytes / op.metadata.size) * 100)
      }

      store.updateTransfer(id, { progress })
    }

    const ensureArrayBuffer = (buffer: ArrayBufferLike): ArrayBuffer => {
      if (buffer instanceof ArrayBuffer) return buffer
      return new Uint8Array(buffer).slice().buffer
    }

    connection.on('data', async (data: unknown) => {
      try {
        if (typeof data === 'string') {
          const message = JSON.parse(data)

          if (message.type === 'file-meta') {
            if (
              typeof message.transferId !== 'string'
              || typeof message.metadata?.name !== 'string'
              || typeof message.metadata?.size !== 'number'
            ) {
              return
            }

            const metadata: FileMetadata = {
              name: message.metadata.name,
              size: message.metadata.size,
              type: typeof message.metadata.type === 'string' ? message.metadata.type : 'application/octet-stream',
              lastModified: typeof message.metadata.lastModified === 'number' ? message.metadata.lastModified : Date.now()
            }

            let accepted = true
            if (options?.onIncomingFile) {
              try {
                accepted = await options.onIncomingFile({
                  transferId: message.transferId,
                  metadata,
                  connection
                })
              } catch (error) {
                console.error('[FileTransfer] Incoming file prompt failed:', error)
                accepted = false
              }
            }

            if (!accepted) {
              connection.send(JSON.stringify({
                type: 'file-reject',
                transferId: message.transferId,
                reason: 'Transfer declined by receiver'
              }))
              console.log(`[FileTransfer] Transfer declined: ${metadata.name}`)
              return
            }

            connection.send(JSON.stringify({
              type: 'file-accept',
              transferId: message.transferId
            }))

            const op: ReceiveOperation = {
              id: message.transferId,
              chunks: [],
              metadata,
              receivedChunks: 0,
              totalChunks: 0,
              pendingBinaryTransferId: null
            }
            receiveMap.set(message.transferId, op)

            store.addTransfer({
              id: message.transferId,
              fileName: metadata.name,
              fileSize: metadata.size,
              progress: 0,
              status: 'receiving',
              startTime: Date.now()
            })
            console.log(`[FileTransfer] Receiving file: ${metadata.name}`)
          }

          if (message.type === 'file-chunk') {
            if (typeof message.transferId !== 'string' || typeof message.totalChunks !== 'number') return
            const op = receiveMap.get(message.transferId)
            if (op) {
              op.totalChunks = message.totalChunks
              // Mark which transfer the next binary belongs to
              pendingTransferId = message.transferId
            }
          }

          if (message.type === 'file-complete') {
            if (typeof message.transferId !== 'string') return
            const op = receiveMap.get(message.transferId)
            if (!op) return

            const blob = new Blob(op.chunks, {
              type: op.metadata?.type || 'application/octet-stream'
            })

            downloadFile(blob, op.metadata?.name || 'download')

            store.updateTransfer(message.transferId, {
              status: 'completed',
              progress: 100,
              endTime: Date.now()
            })

            console.log(`[FileTransfer] File received: ${op.metadata?.name}`)
            receiveMap.delete(message.transferId)
          }

          return
        }

        // Binary chunk — normalise to ArrayBuffer
        if (data instanceof ArrayBuffer) {
          await pushChunk(data)
        } else if (ArrayBuffer.isView(data)) {
          const sliced = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
          await pushChunk(ensureArrayBuffer(sliced))
        } else if (data instanceof Blob) {
          await pushChunk(await data.arrayBuffer())
        }
      } catch (error) {
        console.error('[FileTransfer] Error receiving data:', error)
      }
    })
  }

  const downloadFile = (blob: Blob, fileName: string) => {
    // Warn for potentially dangerous file types instead of blocking outright,
    // as the OS file-open dialog is the last line of defence.
    const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
    if (DANGEROUS_EXTENSIONS.has(ext)) {
      console.warn(`[FileTransfer] Received file with potentially dangerous extension: .${ext}`)
    }

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearTransfer = (transferId: string) => {
    store.removeTransfer(transferId)
  }

  const clearCompleted = () => {
    store.clearCompleted()
  }

  return {
    transfers,
    sendFile,
    receiveFile,
    clearTransfer,
    clearCompleted
  }
}
