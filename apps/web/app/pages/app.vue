<template>
  <div class="flex min-h-screen flex-col overflow-x-hidden bg-app-bg font-app text-app-text selection:bg-app-primary selection:text-white dark:bg-app-bg-dark dark:text-app-text-dark">
    <header class="border-b border-app-border bg-app-surface/95 backdrop-blur dark:border-app-border-dark dark:bg-app-surface-dark/95">
      <div class="mx-auto flex w-full max-w-6xl flex-col md:flex-row md:items-center md:justify-between">
        <NuxtLink to="/" class="flex min-h-16 items-center px-5 text-lg font-semibold text-app-text no-underline dark:text-app-text-dark sm:px-8">
          Blink
        </NuxtLink>

        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-x-5 gap-y-2 border-t border-app-border px-5 py-3 dark:border-app-border-dark sm:px-8 md:border-t-0">
          <div class="flex items-center gap-2">
            <span class="size-2.5 rounded-full bg-app-success" />
            <span class="text-sm font-medium text-app-text dark:text-app-text-dark">This device</span>
          </div>
          <span class="hidden h-5 w-px bg-app-border dark:bg-app-border-dark sm:block" />
          <div class="text-sm text-app-muted dark:text-app-muted-dark">
            Connected devices:
            <span class="font-medium text-app-text dark:text-app-text-dark">{{ connectedPeers.size }}</span>
          </div>
        </div>

        <div class="flex items-center border-t border-app-border px-5 py-3 dark:border-app-border-dark sm:px-8 md:border-t-0">
          <UButton
            color="neutral"
            variant="ghost"
            icon="i-lucide-sun-moon"
            class="rounded-md px-3 py-2 text-sm font-medium text-app-muted hover:bg-app-surface-muted hover:text-app-text dark:text-app-muted-dark dark:hover:bg-app-surface-muted-dark dark:hover:text-app-text-dark"
            @click="toggleTheme"
          >
            Theme
          </UButton>
        </div>
      </div>
    </header>

    <main class="flex min-h-0 flex-1 flex-col">
      <div class="mx-auto flex w-full max-w-6xl flex-1 flex-col bg-app-bg dark:bg-app-bg-dark xl:flex-row">
        <aside class="min-h-0 w-full shrink-0 flex-col border-b border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark xl:w-80 xl:border-b-0 xl:border-r" :class="activeMobileTab !== 'discover' ? 'hidden xl:flex' : 'flex'">
          <div class="border-b border-app-border p-5 dark:border-app-border-dark sm:p-6">
            <h2 class="text-base font-semibold text-app-text dark:text-app-text-dark">Nearby devices</h2>
            <p class="mt-1 text-sm text-app-muted dark:text-app-muted-dark">Choose a device before sending files.</p>
          </div>

          <div class="border-b border-app-border bg-app-bg p-4 dark:border-app-border-dark dark:bg-app-bg-dark sm:p-6">
            <div v-if="localDevice" class="rounded-app border border-app-border bg-app-surface p-4 dark:border-app-border-dark dark:bg-app-surface-dark">
              <span class="block text-sm font-medium text-app-muted dark:text-app-muted-dark">Your device</span>
              <p class="mt-1 break-words text-lg font-semibold text-app-text dark:text-app-text-dark">{{ localDevice.name }}</p>
              <p class="mt-1 text-sm text-app-muted dark:text-app-muted-dark">{{ localDevice.platform }}</p>

              <div class="mt-5 flex flex-col gap-3 border-t border-app-border pt-4 dark:border-app-border-dark sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span class="block text-sm text-app-muted dark:text-app-muted-dark">Pair code</span>
                  <span class="font-mono text-3xl font-semibold tracking-[0.12em] text-app-text dark:text-app-text-dark">{{ localPairCode }}</span>
                </div>
                <UButton
                  variant="ghost"
                  size="xs"
                  icon="i-lucide-refresh-cw"
                  class="self-start rounded-md px-2 text-app-primary hover:bg-app-primary-soft dark:hover:bg-app-primary-soft-dark sm:self-auto"
                  @click="regeneratePairCode"
                >
                  New code
                </UButton>
              </div>

              <div class="mt-4 flex items-center justify-between gap-3 border-t border-app-border pt-4 dark:border-app-border-dark">
                <div class="min-w-0">
                  <span class="block text-sm font-medium text-app-text dark:text-app-text-dark">Auto-accept</span>
                  <span class="block text-xs text-app-muted dark:text-app-muted-dark">Trusted devices only</span>
                </div>
                <UButton
                  color="neutral"
                  variant="outline"
                  size="xs"
                  class="shrink-0 rounded-full border-app-border px-3 py-1.5 text-xs font-medium text-app-text hover:bg-app-surface-muted dark:border-app-border-dark dark:text-app-text-dark dark:hover:bg-app-surface-muted-dark"
                  @click="autoAcceptTrustedFiles = !autoAcceptTrustedFiles"
                >
                  {{ autoAcceptTrustedFiles ? 'On' : 'Off' }}
                </UButton>
              </div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-4">
            <DeviceList
              :devices="devices"
              :selected-device="selectedDevice"
              :connected-peers="connectedPeers"
              :connection-states="connectionStates"
              @select="handleDeviceSelect"
              @connect="handleDeviceConnect"
            />
          </div>
        </aside>

        <section class="min-h-0 flex-1 flex-col" :class="activeMobileTab !== 'transfer' ? 'hidden xl:flex' : 'flex'">
          <div class="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 p-5 sm:p-8">
            <div class="text-center">
              <h1 class="text-2xl font-semibold text-app-text dark:text-app-text-dark sm:text-3xl">Send files</h1>
              <p class="mt-2 text-sm text-app-muted dark:text-app-muted-dark">Connect a nearby device, then choose files to send.</p>
              <div class="mt-4 inline-flex max-w-full items-center gap-2 rounded-app border border-app-border bg-app-surface px-4 py-2 dark:border-app-border-dark dark:bg-app-surface-dark">
                <span class="text-xs font-medium text-app-muted dark:text-app-muted-dark">Send to</span>
                <span class="truncate text-sm font-semibold" :class="targetPeerForSend ? 'text-app-primary' : 'text-app-muted dark:text-app-muted-dark'">
                  {{ targetPeerForSend ? getDeviceNameByPeerId(targetPeerForSend) : 'Choose a device' }}
                </span>
              </div>
            </div>

            <FileUploader
              :disabled="connectedPeers.size === 0"
              :connected-count="connectedPeers.size"
              @files-selected="handleFilesSelected"
            />

            <div class="flex min-h-0 flex-1 flex-col">
              <div class="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 class="text-base font-semibold text-app-text dark:text-app-text-dark">Transfers</h3>
                  <p class="text-sm text-app-muted dark:text-app-muted-dark">Active and past transfers appear here.</p>
                </div>
                <span class="rounded-full bg-app-surface-muted px-2.5 py-1 text-xs font-medium text-app-muted dark:bg-app-surface-muted-dark dark:text-app-muted-dark">{{ transfers.length }}</span>
              </div>
              <TransferProgress :embedded="true" class="min-h-0 flex-1" />
            </div>
          </div>
        </section>
      </div>
    </main>

    <nav class="sticky bottom-0 z-20 flex h-16 items-stretch border-t border-app-border bg-app-surface/95 backdrop-blur-sm dark:border-app-border-dark dark:bg-app-surface-dark/95 xl:hidden">
      <button
        v-for="tab in mobileTabs"
        :key="tab.value"
        class="flex flex-1 flex-col items-center justify-center gap-1 px-2 text-xs font-medium transition-colors"
        :class="activeMobileTab === tab.value ? 'text-app-primary' : 'text-app-muted dark:text-app-muted-dark'"
        @click="activeMobileTab = tab.value"
      >
        <UIcon :name="tab.icon" class="size-5" />
        {{ tab.label }}
      </button>
    </nav>

    <UModal
      :open="isIncomingFileModalOpen"
      :close="false"
      :prevent-close="true"
      :ui="{
        content: 'rounded-app border border-app-border dark:border-app-border-dark',
        container: 'flex min-h-full items-center justify-center p-4 text-center'
      }"
    >
      <template #content>
        <div class="w-full max-w-lg bg-app-surface p-6 text-left text-app-text dark:bg-app-surface-dark dark:text-app-text-dark sm:p-8">
          <h2 class="text-2xl font-semibold text-app-text dark:text-app-text-dark">{{ hasMultipleIncomingFiles ? 'Incoming files' : 'Incoming file' }}</h2>
          <div v-if="currentIncomingFile" class="my-6 border-y border-app-border py-6 dark:border-app-border-dark">
            <p class="mb-4 text-sm text-app-muted dark:text-app-muted-dark">
              <span class="font-medium text-app-text dark:text-app-text-dark">{{ getDeviceNameByPeerId(currentIncomingFile.peerId) }}</span>
              wants to send you {{ incomingFileRequestLabel }}.
            </p>
            <div class="rounded-app border border-app-border bg-app-bg p-4 dark:border-app-border-dark dark:bg-app-bg-dark">
              <p v-if="hasMultipleIncomingFiles" class="mb-2 text-xs font-medium text-app-muted dark:text-app-muted-dark">
                File {{ (currentIncomingFile.batch?.index ?? 0) + 1 }} of {{ currentIncomingFile.batch?.count }}
              </p>
              <p class="break-all text-lg font-semibold text-app-text dark:text-app-text-dark">{{ currentIncomingFile.metadata.name }}</p>
              <p class="mt-2 text-sm text-app-muted dark:text-app-muted-dark">{{ formatBytes(currentIncomingFile.metadata.size) }}</p>
            </div>
          </div>
          <div class="flex flex-col gap-3 sm:flex-row">
            <UButton
              v-if="hasMultipleIncomingFiles"
              class="flex-1 rounded-app bg-app-primary py-3 font-medium text-white hover:bg-blue-700"
              icon="i-lucide-check-check"
              @click="acceptIncomingBatch"
            >
              Accept all
            </UButton>
            <UButton
              class="flex-1 rounded-app py-3 font-medium"
              :class="hasMultipleIncomingFiles ? 'border border-app-border bg-app-surface text-app-text hover:bg-app-surface-muted dark:border-app-border-dark dark:bg-app-surface-dark dark:text-app-text-dark dark:hover:bg-app-surface-muted-dark' : 'bg-app-primary text-white hover:bg-blue-700'"
              icon="i-lucide-check"
              @click="acceptIncomingFile"
            >
              Accept file
            </UButton>
            <UButton variant="outline" class="flex-1 rounded-app border-app-border py-3 font-medium text-app-text hover:bg-app-surface-muted dark:border-app-border-dark dark:text-app-text-dark dark:hover:bg-app-surface-muted-dark" @click="declineIncomingFile">
              Decline
            </UButton>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStorage } from '@vueuse/core'
import type { Device, FileMetadata } from '@blink/types'
import type { DataConnection } from 'peerjs'
import { useDeviceDiscovery } from '../composables/useDeviceDiscovery'
import { useWebRTC } from '../composables/useWebRTC'
import { useFileTransfer, type FileTransferBatchFile, type FileTransferBatchInfo, type IncomingFilePrompt } from '../composables/useFileTransfer'
import { useTheme } from '../composables/useTheme'
import { useTransfersStore } from '../stores/transfers'

const { devices, localDevice, connect, disconnect, initDevice, setLocalPeerId } = useDeviceDiscovery()
const { initPeer, connectToPeer, connections, connectionStates, onConnection, onPeerOpen, destroy } = useWebRTC()
const { transfers, sendFile, receiveFile } = useFileTransfer()
const transfersStore = useTransfersStore()
const { toggleTheme } = useTheme()
const toast = useToast()

const selectedDevice = ref<Device | null>(null)
const connectedPeers = ref<Set<string>>(new Set())
const targetPeerForSend = ref<string | null>(null)
const activeMobileTab = ref<'discover' | 'transfer'>('transfer')
const trustedPeerIds = useStorage<string[]>('blink-trusted-peer-ids', [])
const autoAcceptTrustedFiles = useStorage<boolean>('blink-auto-accept-trusted-files', false)
const localPairCode = useStorage<string>('blink-local-pair-code', generatePairCode())
const pairCodeInputs = ref<Record<string, string>>({})
const pairingPeers = ref<Set<string>>(new Set())

if (!/^\d{6}$/.test(localPairCode.value)) {
  localPairCode.value = generatePairCode()
}

type IncomingFileQueueItem = {
  transferId: string
  metadata: FileMetadata
  peerId: string
  batch?: FileTransferBatchInfo
}

const incomingFileQueue = ref<IncomingFileQueueItem[]>([])
const incomingFileResolvers = new Map<string, (accepted: boolean) => void>()
const acceptedIncomingBatches = new Map<string, ReturnType<typeof setTimeout>>()
const completedIncomingBatchFiles = new Map<string, Set<string>>()
const pendingPairRequests = new Map<string, { peerId: string; timeoutId: ReturnType<typeof setTimeout> }>()
const pairingMessageListeners = new WeakSet<DataConnection>()
const PAIR_REQUEST_TIMEOUT_MS = 30000
const ACCEPTED_BATCH_WINDOW_MS = 15 * 60 * 1000

const currentIncomingFile = computed(() => incomingFileQueue.value[0] ?? null)
const isIncomingFileModalOpen = computed(() => currentIncomingFile.value !== null)
const trustedPeerSet = computed(() => new Set(trustedPeerIds.value))
const hasMultipleIncomingFiles = computed(() => (currentIncomingFile.value?.batch?.count ?? 1) > 1)
const incomingFileRequestLabel = computed(() => {
  const batch = currentIncomingFile.value?.batch
  if (!batch || batch.count <= 1) return 'a file'

  return `${batch.count} files (${formatBytes(batch.totalSize)})`
})

const mobileTabs = [
  { value: 'discover', label: 'Devices', icon: 'i-lucide-monitor-smartphone' },
  { value: 'transfer', label: 'Send', icon: 'i-lucide-send' }
] as const

const connectingDevices = computed(() =>
  devices.value.filter(device => {
    if (!device.peerId) return false
    const state = connectionStates.value.get(device.peerId)
    return state === 'connecting' && !connectedPeers.value.has(device.peerId)
  })
)

const hasConnectingDevices = computed(() => connectingDevices.value.length > 0)

function generatePairCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

const normalizePairCode = (value: string): string => value.replace(/\D/g, '').slice(0, 6)

const formatBytes = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** exponent
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

const getDeviceNameByPeerId = (peerId: string): string => {
  const device = devices.value.find(d => d.peerId === peerId)
  return device?.name || peerId
}

const isTrustedPeer = (peerId?: string | null): boolean => {
  return !!peerId && trustedPeerSet.value.has(peerId)
}

const addTrustedPeer = (peerId: string) => {
  if (trustedPeerSet.value.has(peerId)) return
  trustedPeerIds.value = [...trustedPeerIds.value, peerId]
}

const untrustPeer = (peerId: string) => {
  if (!trustedPeerSet.value.has(peerId)) return

  trustedPeerIds.value = trustedPeerIds.value.filter(id => id !== peerId)
  toast.add({
    title: `Untrusted ${getDeviceNameByPeerId(peerId)}`,
    color: 'warning'
  })
}

const setPairingPeerPending = (peerId: string, pending: boolean) => {
  const next = new Set(pairingPeers.value)
  if (pending) next.add(peerId)
  else next.delete(peerId)
  pairingPeers.value = next
}

const isPairingPeer = (peerId?: string | null): boolean => {
  return !!peerId && pairingPeers.value.has(peerId)
}

const updatePairCodeInput = (peerId: string, value: string) => {
  pairCodeInputs.value[peerId] = normalizePairCode(value)
}

const regeneratePairCode = () => {
  localPairCode.value = generatePairCode()
}

const getIncomingBatchKey = (peerId: string, batch?: FileTransferBatchInfo): string | null => {
  return batch ? `${peerId}:${batch.id}` : null
}

const rememberAcceptedIncomingBatch = (peerId: string, batch?: FileTransferBatchInfo) => {
  const key = getIncomingBatchKey(peerId, batch)
  if (!key) return

  const existing = acceptedIncomingBatches.get(key)
  if (existing) clearTimeout(existing)

  const timeoutId = setTimeout(() => {
    acceptedIncomingBatches.delete(key)
  }, ACCEPTED_BATCH_WINDOW_MS)
  acceptedIncomingBatches.set(key, timeoutId)
}

const forgetAcceptedIncomingBatch = (peerId: string, batch?: FileTransferBatchInfo) => {
  const key = getIncomingBatchKey(peerId, batch)
  if (!key) return

  const timeoutId = acceptedIncomingBatches.get(key)
  if (timeoutId) clearTimeout(timeoutId)
  acceptedIncomingBatches.delete(key)
}

const clearAcceptedIncomingBatches = () => {
  for (const timeoutId of acceptedIncomingBatches.values()) {
    clearTimeout(timeoutId)
  }
  acceptedIncomingBatches.clear()
  completedIncomingBatchFiles.clear()
}

const isAcceptedIncomingBatch = (peerId: string, batch?: FileTransferBatchInfo): boolean => {
  const key = getIncomingBatchKey(peerId, batch)
  return !!key && acceptedIncomingBatches.has(key)
}

const queueRemainingBatchFiles = (peerId: string, batch?: FileTransferBatchInfo) => {
  if (!batch?.files?.length) return

  for (const file of batch.files) {
    if (file.transferId === currentIncomingFile.value?.transferId) continue

    transfersStore.addTransfer({
      id: file.transferId,
      fileName: file.name,
      fileSize: file.size,
      progress: 0,
      status: 'queued',
      fromDevice: getDeviceNameByPeerId(peerId),
      batchId: batch.id,
      batchIndex: batch.files.findIndex(candidate => candidate.transferId === file.transferId),
      batchCount: batch.count,
      batchTotalSize: batch.totalSize
    })
  }
}

const enqueueIncomingFilePrompt = ({ transferId, metadata, connection, batch }: IncomingFilePrompt): Promise<boolean> => {
  return new Promise((resolve) => {
    incomingFileQueue.value.push({
      transferId,
      metadata,
      peerId: connection.peer,
      batch
    })
    incomingFileResolvers.set(transferId, resolve)
  })
}

const handleIncomingFilePrompt = (incoming: IncomingFilePrompt): Promise<boolean> | boolean => {
  if (autoAcceptTrustedFiles.value && isTrustedPeer(incoming.connection.peer)) {
    toast.add({
      title: `Auto-accepted ${incoming.metadata.name}`,
      description: `Trusted device: ${getDeviceNameByPeerId(incoming.connection.peer)}`,
      color: 'success'
    })
    return true
  }

  if (isAcceptedIncomingBatch(incoming.connection.peer, incoming.batch)) {
    if (incoming.batch && incoming.batch.index >= incoming.batch.count - 1) {
      forgetAcceptedIncomingBatch(incoming.connection.peer, incoming.batch)
    }
    return true
  }

  return enqueueIncomingFilePrompt(incoming)
}

const handleFileReceived = (incoming: IncomingFilePrompt) => {
  const key = getIncomingBatchKey(incoming.connection.peer, incoming.batch)
  if (!key || !incoming.batch || incoming.batch.count <= 1) return

  const completed = completedIncomingBatchFiles.get(key) ?? new Set<string>()
  completed.add(incoming.transferId)
  completedIncomingBatchFiles.set(key, completed)

  if (completed.size >= incoming.batch.count) {
    completedIncomingBatchFiles.delete(key)
    forgetAcceptedIncomingBatch(incoming.connection.peer, incoming.batch)
    toast.add({
      title: `Received ${incoming.batch.count} files`,
      description: getDeviceNameByPeerId(incoming.connection.peer),
      color: 'success'
    })
  }
}

const resolveIncomingFilePrompt = (accepted: boolean) => {
  const current = incomingFileQueue.value.shift()
  if (!current) return

  const resolve = incomingFileResolvers.get(current.transferId)
  incomingFileResolvers.delete(current.transferId)
  resolve?.(accepted)

  if (!accepted) {
    toast.add({
      title: `You declined ${current.metadata.name}`,
      color: 'warning'
    })
  }
}

const acceptIncomingFile = () => resolveIncomingFilePrompt(true)
const declineIncomingFile = () => resolveIncomingFilePrompt(false)

const acceptIncomingBatch = () => {
  const current = currentIncomingFile.value
  if (!current) return

  const batchKey = getIncomingBatchKey(current.peerId, current.batch)
  if (!batchKey) {
    acceptIncomingFile()
    return
  }

  rememberAcceptedIncomingBatch(current.peerId, current.batch)
  queueRemainingBatchFiles(current.peerId, current.batch)

  const remainingQueue: IncomingFileQueueItem[] = []
  for (const request of incomingFileQueue.value) {
    if (getIncomingBatchKey(request.peerId, request.batch) !== batchKey) {
      remainingQueue.push(request)
      continue
    }

    const resolve = incomingFileResolvers.get(request.transferId)
    incomingFileResolvers.delete(request.transferId)
    resolve?.(true)
  }

  incomingFileQueue.value = remainingQueue

  toast.add({
    title: `Receiving ${current.batch?.count ?? 1} files`,
    description: getDeviceNameByPeerId(current.peerId),
    color: 'success'
  })
}

const rejectAllIncomingPrompts = () => {
  for (const request of incomingFileQueue.value) {
    incomingFileResolvers.get(request.transferId)?.(false)
  }
  incomingFileQueue.value = []
  incomingFileResolvers.clear()
}

const clearPendingPairRequest = (requestId: string) => {
  const pending = pendingPairRequests.get(requestId)
  if (!pending) return

  clearTimeout(pending.timeoutId)
  setPairingPeerPending(pending.peerId, false)
  pendingPairRequests.delete(requestId)
}

const clearAllPendingPairRequests = () => {
  for (const [requestId, pending] of pendingPairRequests.entries()) {
    clearTimeout(pending.timeoutId)
    setPairingPeerPending(pending.peerId, false)
    pendingPairRequests.delete(requestId)
  }
}

const pairWithPeer = (peerId: string) => {
  if (isTrustedPeer(peerId)) {
    toast.add({ title: `${getDeviceNameByPeerId(peerId)} is already verified`, color: 'info' })
    return
  }

  const connection = connections.value.get(peerId)
  if (!connection || !connection.open) {
    toast.add({ title: 'Connect the device first', color: 'error' })
    return
  }

  const targetCode = normalizePairCode(pairCodeInputs.value[peerId] || '')
  if (targetCode.length !== 6) {
    toast.add({ title: 'Enter the 6-digit code from the other device', color: 'warning' })
    return
  }

  const requestId = `pair-${crypto.randomUUID()}`
  const timeoutId = setTimeout(() => {
    clearPendingPairRequest(requestId)
    toast.add({
      title: `Pairing timed out for ${getDeviceNameByPeerId(peerId)}`,
      color: 'warning'
    })
  }, PAIR_REQUEST_TIMEOUT_MS)

  pendingPairRequests.set(requestId, { peerId, timeoutId })
  setPairingPeerPending(peerId, true)

  connection.send(JSON.stringify({
    type: 'pair-request',
    requestId,
    targetCode,
    requesterCode: localPairCode.value
  }))

  toast.add({
    title: `Sent a pairing request to ${getDeviceNameByPeerId(peerId)}`,
    color: 'info'
  })
}

const setupPairingHandlers = (connection: DataConnection) => {
  if (pairingMessageListeners.has(connection)) return
  pairingMessageListeners.add(connection)

  connection.on('data', (data: unknown) => {
    if (typeof data !== 'string') return

    let message: Record<string, unknown>
    try {
      message = JSON.parse(data)
    } catch {
      return
    }

    if (message.type === 'pair-request') {
      const requestId = typeof message.requestId === 'string' ? message.requestId : ''
      const targetCode = typeof message.targetCode === 'string' ? normalizePairCode(message.targetCode) : ''
      const requesterCode = typeof message.requesterCode === 'string' ? normalizePairCode(message.requesterCode) : ''
      if (!requestId || requesterCode.length !== 6) return

      if (targetCode !== localPairCode.value) {
        connection.send(JSON.stringify({
          type: 'pair-reject',
          requestId,
          reason: 'Invalid pairing code'
        }))
        return
      }

      addTrustedPeer(connection.peer)
      connection.send(JSON.stringify({
        type: 'pair-approve',
        requestId,
        requesterCode
      }))

      toast.add({
        title: `${getDeviceNameByPeerId(connection.peer)} is verified`,
        color: 'success'
      })
      return
    }

    if (message.type === 'pair-approve') {
      const requestId = typeof message.requestId === 'string' ? message.requestId : ''
      const requesterCode = typeof message.requesterCode === 'string' ? normalizePairCode(message.requesterCode) : ''
      const pending = pendingPairRequests.get(requestId)
      if (!requestId || !pending || pending.peerId !== connection.peer) return

      clearPendingPairRequest(requestId)

      if (requesterCode !== localPairCode.value) {
        toast.add({
          title: `Could not verify ${getDeviceNameByPeerId(connection.peer)}`,
          color: 'error'
        })
        return
      }

      addTrustedPeer(connection.peer)
      pairCodeInputs.value[connection.peer] = ''
      toast.add({
        title: `${getDeviceNameByPeerId(connection.peer)} is verified`,
        color: 'success'
      })
      return
    }

    if (message.type === 'pair-reject') {
      const requestId = typeof message.requestId === 'string' ? message.requestId : ''
      const reason = typeof message.reason === 'string' ? message.reason : 'Pairing was rejected'
      const pending = pendingPairRequests.get(requestId)
      if (!requestId || !pending || pending.peerId !== connection.peer) return

      clearPendingPairRequest(requestId)
      toast.add({
        title: `Could not verify ${getDeviceNameByPeerId(connection.peer)}`,
        description: reason,
        color: 'warning'
      })
    }
  })

  connection.on('close', () => {
    connectedPeers.value.delete(connection.peer)
    if (targetPeerForSend.value === connection.peer) {
      const remaining = Array.from(connectedPeers.value)[0]
      targetPeerForSend.value = remaining || null
    }

    for (const requestId of Array.from(pendingPairRequests.keys())) {
      if (pendingPairRequests.get(requestId)?.peerId === connection.peer) {
        clearPendingPairRequest(requestId)
      }
    }
  })
}

onMounted(async () => {
  initDevice()

  onConnection((conn) => {
    connectedPeers.value.add(conn.peer)
    if (!targetPeerForSend.value) {
      targetPeerForSend.value = conn.peer
    }
    setupPairingHandlers(conn)

    receiveFile(conn, {
      onIncomingFile: handleIncomingFilePrompt,
      onFileReceived: handleFileReceived
    })
  })

  // Runs on every broker open — the initial one, a retry that fell back to a
  // different ID, and reconnects — so the announced peerId always matches the
  // ID other devices need to dial.
  onPeerOpen((peerId) => {
    setLocalPeerId(peerId)
  })

  // Connect to signaling first: the peer may need a few seconds to come up,
  // and announce() is re-driven by onPeerOpen once it does.
  connect()

  try {
    await initPeer(localDevice.value?.id)
  } catch (error) {
    console.error('Failed to initialize peer:', error)
    toast.add({
      title: 'Could not join the peer network',
      description: 'Other devices will not see this one. Check your connection and reload.',
      color: 'error'
    })
  }
})

const handleDeviceSelect = (device: Device) => {
  selectedDevice.value = device
}

const handleDeviceConnect = async (device: Device) => {
  try {
    if (!device.peerId) {
      toast.add({ title: 'This device is not ready to connect yet', color: 'error' })
      return
    }
    if (connectedPeers.value.has(device.peerId)) {
      targetPeerForSend.value = device.peerId ?? null
      toast.add({ title: `Ready to send to ${device.name}`, color: 'info' })
      return
    }
    await connectToPeer(device.peerId)
    connectedPeers.value.add(device.peerId)
    targetPeerForSend.value = device.peerId ?? null
    toast.add({ title: `Connected to ${device.name}`, color: 'success' })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    toast.add({ title: `Could not connect to ${device.name}`, description: errorMsg, color: 'error' })
  }
}

const handleDeviceDisconnect = (device: Device) => {
  if (device.peerId && connectedPeers.value.has(device.peerId)) {
    connectedPeers.value.delete(device.peerId)
    const conn = connections.value.get(device.peerId)
    if (conn) conn.close()
    if (targetPeerForSend.value === device.peerId) {
      const remaining = Array.from(connectedPeers.value)[0]
      targetPeerForSend.value = remaining || null
    }
  }
}

const handleFilesSelected = async (files: File[], targetPeerId?: string) => {
  const peerId = targetPeerId || targetPeerForSend.value
  if (!peerId) return
  const connection = connections.value.get(peerId)
  if (!connection) return

  const batchId = files.length > 1 ? `batch-${crypto.randomUUID()}` : null
  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const batchFiles: FileTransferBatchFile[] = batchId
    ? files.map(file => ({
        transferId: `transfer-${crypto.randomUUID()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }))
    : []

  for (const [index, file] of files.entries()) {
    try {
      await sendFile(file, connection, batchId
        ? {
            transferId: batchFiles[index]?.transferId,
            batch: {
              id: batchId,
              index,
              count: files.length,
              totalSize,
              files: batchFiles
            }
          }
        : undefined)
    } catch (error) {
      console.error('Failed to send file:', error)
    }
  }
}

onUnmounted(() => {
  rejectAllIncomingPrompts()
  clearAcceptedIncomingBatches()
  clearAllPendingPairRequests()
  disconnect()
  destroy()
})
</script>
