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
  status: 'pending' | 'sending' | 'receiving' | 'completed' | 'failed'
  speed?: number
  fromDevice?: string
  toDevice?: string
  startTime?: number
  endTime?: number
}

export interface FileMetadata {
  name: string
  size: number
  type: string
  lastModified: number
}

/** Describes the JSON control frame sent before each binary chunk. */
export interface ChunkDescriptor {
  type: 'file-meta' | 'file-chunk' | 'file-complete'
  transferId: string
  chunkIndex?: number
  totalChunks?: number
  metadata?: FileMetadata
}

export interface SignalingMessage {
  type: 'announce' | 'signal' | 'peer-joined' | 'peer-left' | 'offer' | 'answer' | 'ice-candidate' | 'init'
  deviceInfo?: Device
  peerId?: string
  signal?: unknown
  targetPeer?: string
  fromPeer?: string
}
