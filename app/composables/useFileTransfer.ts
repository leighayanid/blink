import { ref } from 'vue'
import type { Transfer, FileMetadata } from '../types'

export const useFileTransfer = () => {
  const transfers = ref<Transfer[]>([])
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

    transfers.value.push(transfer)

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
        transfer.progress = (offset / file.size) * 100

        // Small delay to prevent overwhelming the connection
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      // Send completion message
      connection.send(JSON.stringify({
        type: 'file-complete',
        transferId
      }))

      transfer.status = 'completed'
      transfer.endTime = Date.now()
      transfer.progress = 100

      console.log(`[FileTransfer] File sent successfully: ${file.name}`)

      return transferId
    } catch (error) {
      console.error('[FileTransfer] Error sending file:', error)
      transfer.status = 'failed'
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
        // Try to parse as JSON (metadata/control messages)
        if (typeof data === 'string') {
          const message = JSON.parse(data)

          if (message.type === 'file-meta') {
            // Initialize new transfer
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

            transfers.value.push(transfer)
            console.log(`[FileTransfer] Receiving file: ${message.metadata.name}`)
          }

          if (message.type === 'file-chunk' && currentTransfer) {
            currentTransfer.totalChunks = message.totalChunks
          }

          if (message.type === 'file-complete' && currentTransfer) {
            // Assemble and download file
            const blob = new Blob(currentTransfer.chunks, {
              type: currentTransfer.metadata?.type || 'application/octet-stream'
            })

            downloadFile(blob, currentTransfer.metadata?.name || 'download')

            // Update transfer status
            const transfer = transfers.value.find(t => t.id === message.transferId)
            if (transfer) {
              transfer.status = 'completed'
              transfer.progress = 100
              transfer.endTime = Date.now()
            }

            console.log(`[FileTransfer] File received successfully: ${currentTransfer.metadata?.name}`)
            currentTransfer = null
          }
        } else if (data instanceof ArrayBuffer && currentTransfer) {
          currentTransfer.chunks.push(data)
          currentTransfer.receivedChunks++

          // Update progress
          const transfer = transfers.value.find(t => t.id === currentTransfer?.id)
          if (transfer && currentTransfer.totalChunks > 0) {
            transfer.progress = (currentTransfer.receivedChunks / currentTransfer.totalChunks) * 100
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
    transfers.value = transfers.value.filter(t => t.id !== transferId)
  }

  const clearCompleted = () => {
    transfers.value = transfers.value.filter(t => t.status !== 'completed')
  }

  return {
    transfers,
    sendFile,
    receiveFile,
    clearTransfer,
    clearCompleted
  }
}
