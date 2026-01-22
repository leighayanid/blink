import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import type { Transfer, FileMetadata } from '../types'
import { useTransfersStore } from '../stores/transfers'

export const useFileTransfer = () => {
  const store = useTransfersStore()
  const { activeTransfers, completedTransfers, failedTransfers } = storeToRefs(store)

  const transfers = computed(() => [
    ...activeTransfers.value,
    ...completedTransfers.value,
    ...failedTransfers.value
  ])

  const CHUNK_SIZE = 64 * 1024 // 64KB chunks

  const generateTransferId = (): string => {
    return `transfer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  const sendFile = async (file: File, connection: any): Promise<string> => {
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

      // Wait a bit for metadata to be processed
      await new Promise(resolve => setTimeout(resolve, 100))

      // Calculate total chunks
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
      let chunkIndex = 0

      // Send file in chunks
      for (let offset = 0; offset < file.size; offset += CHUNK_SIZE) {
        const chunk = file.slice(offset, offset + CHUNK_SIZE)
        const arrayBuffer = await chunk.arrayBuffer()

        // Send chunk with metadata
        connection.send(JSON.stringify({
          type: 'file-chunk',
          transferId,
          chunkIndex,
          totalChunks
        }))

        // Send actual chunk data
        connection.send(arrayBuffer)

        chunkIndex++

        // Update progress
        const progress = ((offset + CHUNK_SIZE) / file.size) * 100
        store.updateTransfer(transferId, {
          progress: Math.min(progress, 100)
        })

        // Small delay to prevent overwhelming the connection
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      // Send completion message
      connection.send(JSON.stringify({
        type: 'file-complete',
        transferId
      }))

      // Update transfer status
      store.updateTransfer(transferId, {
        status: 'completed',
        endTime: Date.now(),
        progress: 100
      })

      console.log(`[FileTransfer] File sent successfully: ${file.name}`)

      return transferId
    } catch (error) {
      console.error('[FileTransfer] Error sending file:', error)
      // Update failed status
      store.updateTransfer(transferId, {
        status: 'failed'
      })
      throw error
    }
  }

  const receiveFile = (connection: any) => {
    let currentTransfer: {
      id: string
      chunks: ArrayBuffer[]
      metadata: FileMetadata | null
      receivedChunks: number
      totalChunks: number
    } | null = null

    connection.on('data', async (data: any) => {
      try {
        // Control messages are sent as JSON strings
        if (typeof data === 'string') {
          const message = JSON.parse(data)

          if (message.type === 'file-meta') {
            currentTransfer = {
              id: message.transferId,
              chunks: [],
              metadata: message.metadata,
              receivedChunks: 0,
              totalChunks: 0
            }

            const transfer: Transfer = {
              id: message.transferId,
              fileName: message.metadata.name,
              fileSize: message.metadata.size,
              progress: 0,
              status: 'receiving',
              startTime: Date.now()
            }

            store.addTransfer(transfer)
            console.log(`[FileTransfer] Receiving file: ${message.metadata.name}`)
          }

          if (message.type === 'file-chunk' && currentTransfer) {
            // Keep totalChunks for progress calculation
            currentTransfer.totalChunks = message.totalChunks
          }

          if (message.type === 'file-complete' && currentTransfer) {
            // Assemble and download file
            const blob = new Blob(currentTransfer.chunks, {
              type: currentTransfer.metadata?.type || 'application/octet-stream'
            })

            downloadFile(blob, currentTransfer.metadata?.name || 'download')

            store.updateTransfer(message.transferId, {
              status: 'completed',
              progress: 100,
              endTime: Date.now()
            })

            console.log(`[FileTransfer] File received successfully: ${currentTransfer.metadata?.name}`)
            currentTransfer = null
          }

          return
        }

        // Binary data can arrive as ArrayBuffer, Blob, or typed arrays
        const pushChunk = async (chunkData: ArrayBuffer) => {
          if (!currentTransfer) return
          currentTransfer.chunks.push(chunkData)
          currentTransfer.receivedChunks++

          // Update progress
          let progress = 0
          if (currentTransfer.totalChunks && currentTransfer.totalChunks > 0) {
            progress = (currentTransfer.receivedChunks / currentTransfer.totalChunks) * 100
          } else if (currentTransfer.metadata?.size) {
            // Approximate progress by bytes received
            const receivedBytes = currentTransfer.chunks.reduce((acc, c) => acc + c.byteLength, 0)
            progress = Math.min(100, (receivedBytes / currentTransfer.metadata.size) * 100)
          }

          store.updateTransfer(currentTransfer.id, {
            progress
          })
        }

        if (data instanceof ArrayBuffer) {
          await pushChunk(data)
        } else if (ArrayBuffer.isView(data)) {
          // TypedArray (Uint8Array, etc.)
          await pushChunk(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength))
        } else if (data instanceof Blob) {
          const ab = await data.arrayBuffer()
          await pushChunk(ab)
        } else if (data && data.buffer && ArrayBuffer.isView(data.buffer)) {
          // Some libraries may deliver objects with a buffer property
          await pushChunk(data.buffer)
        } else {
          // Unknown binary shape - try to coerce
          try {
            const coerced = await Promise.resolve(data)
            if (coerced instanceof ArrayBuffer) {
              await pushChunk(coerced)
            }
          } catch (e) {
            console.warn('[FileTransfer] Received unknown data type for chunk', data)
          }
        }
      } catch (error) {
        console.error('[FileTransfer] Error receiving data:', error)
      }
    })
  }

  const downloadFile = (blob: Blob, fileName: string) => {
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
