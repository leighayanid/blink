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

export interface ChunkData {
  type: 'file-meta' | 'file-chunk' | 'file-complete'
  transferId?: string
  data?: ArrayBuffer
  metadata?: FileMetadata
  chunkIndex?: number
  totalChunks?: number
}

export interface SignalingMessage {
  type: 'announce' | 'signal' | 'peer-joined' | 'peer-left' | 'offer' | 'answer' | 'ice-candidate' | 'init'
  deviceInfo?: Device
  peerId?: string
  signal?: any
  targetPeer?: string
  fromPeer?: string
}
