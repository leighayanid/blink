export interface Device {
  id: string
  name: string
  platform: string
  ip?: string
  timestamp: number
  peerId?: string
}

export interface Transfer {
  id: string
  fileName: string
  fileSize: number
  progress: number
  status: 'queued' | 'pending' | 'sending' | 'receiving' | 'completed' | 'failed'
  speed?: number
  fromDevice?: string
  toDevice?: string
  startTime?: number
  endTime?: number
  batchId?: string
  batchIndex?: number
  batchCount?: number
  batchTotalSize?: number
}

export interface FileMetadata {
  name: string
  size: number
  type: string
  lastModified: number
}

/** Describes the JSON control frame sent before each binary chunk. */
export interface ChunkData {
  type: 'file-meta' | 'file-chunk' | 'file-complete'
  transferId: string
  chunkIndex?: number
  totalChunks?: number
  metadata?: FileMetadata
  data?: Uint8Array | ArrayBuffer | string
}

export interface SignalingMessage {
  type: 'announce' | 'signal' | 'peer-joined' | 'peer-left' | 'offer' | 'answer' | 'ice-candidate' | 'init' | 'error' | 'heartbeat' | 'heartbeat-ack'
  deviceInfo?: Device
  peerId?: string
  roomId?: string
  reason?: string
  at?: number
  signal?: unknown
  targetPeer?: string
  fromPeer?: string
}
