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

/** Chunks are buffered in memory until the file completes, so these are RAM budgets. */
const MAX_FILE_BYTES = 2 * 1024 * 1024 * 1024
const MAX_BUFFERED_BYTES_PER_CONNECTION = 2 * 1024 * 1024 * 1024
const MAX_CONCURRENT_RECEIVES = 16

export const getFileExtension = (fileName: string): string =>
  fileName.split('.').pop()?.toLowerCase() ?? ''

/**
 * Whether a name has an extension the OS may execute or a browser may render
 * with script. Advisory only — the receiver still decides.
 */
export const isDangerousFileName = (fileName: string): boolean =>
  DANGEROUS_EXTENSIONS.has(getFileExtension(fileName))

interface ReceiveOperation {
  id: string
  chunks: ArrayBuffer[]
  metadata: FileMetadata | null
  batch?: FileTransferBatchInfo
  receivedChunks: number
  receivedBytes: number
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
  batch?: FileTransferBatchInfo
}

interface ReceiveFileOptions {
  onIncomingFile?: (incoming: IncomingFilePrompt) => boolean | Promise<boolean>
  onFileReceived?: (incoming: IncomingFilePrompt) => void
}

export interface FileTransferBatchInfo {
  id: string
  index: number
  count: number
  totalSize: number
  files?: FileTransferBatchFile[]
}

interface SendFileOptions {
  transferId?: string
  batch?: FileTransferBatchInfo
}

export interface FileTransferBatchFile {
  transferId: string
  name: string
  size: number
  type: string
  lastModified: number
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

  const sendFile = async (file: File, connection: TransferConnection, options?: SendFileOptions): Promise<string> => {
    const transferId = options?.transferId ?? generateTransferId()

    const transfer: Transfer = {
      id: transferId,
      fileName: file.name,
      fileSize: file.size,
      progress: 0,
      status: 'sending',
      startTime: Date.now(),
      batchId: options?.batch?.id,
      batchIndex: options?.batch?.index,
      batchCount: options?.batch?.count,
      batchTotalSize: options?.batch?.totalSize
    }

    store.addTransfer(transfer)

    try {
      // Send file metadata
      connection.send(JSON.stringify({
        type: 'file-meta',
        transferId,
        batch: options?.batch,
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
    let bufferedBytes = 0

    const abortReceive = (op: ReceiveOperation, reason: string) => {
      console.warn(`[FileTransfer] Aborting ${op.id}: ${reason}`)
      bufferedBytes -= op.receivedBytes
      op.chunks.length = 0
      receiveMap.delete(op.id)
      store.updateTransfer(op.id, { status: 'failed', endTime: Date.now() })

      try {
        connection.send(JSON.stringify({
          type: 'file-reject',
          transferId: op.id,
          reason
        }))
      } catch {}
    }

    const pushChunk = async (chunkData: ArrayBuffer) => {
      const id = pendingTransferId
      if (!id) return
      pendingTransferId = null

      const op = receiveMap.get(id)
      if (!op) return

      // The sender declared a size up front; it does not get to exceed it.
      // Without this a peer can announce 1 KB and stream until the tab dies.
      const declaredSize = op.metadata?.size ?? 0
      if (op.receivedBytes + chunkData.byteLength > declaredSize) {
        abortReceive(op, 'Sender exceeded the declared file size')
        return
      }

      if (bufferedBytes + chunkData.byteLength > MAX_BUFFERED_BYTES_PER_CONNECTION) {
        abortReceive(op, 'Too much unfinished data buffered from this peer')
        return
      }

      op.chunks.push(chunkData)
      op.receivedChunks++
      op.receivedBytes += chunkData.byteLength
      bufferedBytes += chunkData.byteLength

      let progress = 0
      if (op.totalChunks > 0) {
        progress = (op.receivedChunks / op.totalChunks) * 100
      } else if (declaredSize > 0) {
        progress = Math.min(100, (op.receivedBytes / declaredSize) * 100)
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

            if (
              !Number.isFinite(message.metadata.size)
              || message.metadata.size < 0
              || message.metadata.size > MAX_FILE_BYTES
            ) {
              console.warn('[FileTransfer] Rejecting file with implausible size:', message.metadata.size)
              connection.send(JSON.stringify({
                type: 'file-reject',
                transferId: message.transferId,
                reason: 'File too large'
              }))
              return
            }

            // Bound how many prompts/buffers one peer can open at once.
            if (!receiveMap.has(message.transferId) && receiveMap.size >= MAX_CONCURRENT_RECEIVES) {
              console.warn('[FileTransfer] Too many concurrent transfers from', connection.peer)
              connection.send(JSON.stringify({
                type: 'file-reject',
                transferId: message.transferId,
                reason: 'Too many concurrent transfers'
              }))
              return
            }

            const metadata: FileMetadata = {
              name: message.metadata.name,
              size: message.metadata.size,
              type: typeof message.metadata.type === 'string' ? message.metadata.type : 'application/octet-stream',
              lastModified: typeof message.metadata.lastModified === 'number' ? message.metadata.lastModified : Date.now()
            }
            const batch = (
              typeof message.batch?.id === 'string'
              && typeof message.batch?.index === 'number'
              && typeof message.batch?.count === 'number'
              && typeof message.batch?.totalSize === 'number'
            )
              ? {
                  id: message.batch.id,
                  index: message.batch.index,
                  count: message.batch.count,
                  totalSize: message.batch.totalSize,
                  files: Array.isArray(message.batch.files)
                    ? message.batch.files
                        .filter((file: Record<string, unknown>) =>
                          typeof file.transferId === 'string'
                          && typeof file.name === 'string'
                          && typeof file.size === 'number'
                          && typeof file.type === 'string'
                          && typeof file.lastModified === 'number'
                        )
                        .map((file: Record<string, unknown>) => ({
                          transferId: file.transferId as string,
                          name: file.name as string,
                          size: file.size as number,
                          type: file.type as string,
                          lastModified: file.lastModified as number
                        }))
                    : undefined
                }
              : undefined

            let accepted = true
            if (options?.onIncomingFile) {
              try {
                accepted = await options.onIncomingFile({
                  transferId: message.transferId,
                  metadata,
                  connection,
                  batch
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
              batch,
              receivedChunks: 0,
              receivedBytes: 0,
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
              startTime: Date.now(),
              batchId: batch?.id,
              batchIndex: batch?.index,
              batchCount: batch?.count,
              batchTotalSize: batch?.totalSize
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

            bufferedBytes -= op.receivedBytes

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
            if (op.metadata) {
              options?.onFileReceived?.({
                transferId: message.transferId,
                metadata: op.metadata,
                connection,
                batch: op.batch
              })
            }
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
    // as the OS file-open dialog is the last line of defence. The receiver is
    // also warned in the accept prompt, before any bytes are transferred.
    if (isDangerousFileName(fileName)) {
      console.warn(`[FileTransfer] Received file with potentially dangerous extension: .${getFileExtension(fileName)}`)
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
