<template>
  <div class="relative min-h-screen bg-swiss-bg dark:bg-swiss-bg-dark font-swiss text-swiss-black dark:text-white selection:bg-swiss-black selection:text-white flex flex-col overflow-x-hidden">
    <!-- Swiss Grid System (Overlay) -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
       <div class="grid grid-cols-4 md:grid-cols-12 gap-0 h-full w-full opacity-[0.05] dark:opacity-[0.08]">
         <div v-for="i in 12" :key="i" class="border-r border-swiss-black dark:border-white h-full" />
       </div>
    </div>

    <!-- Header (Swiss Style) -->
    <header class="relative z-10 border-b-4 border-swiss-black dark:border-white bg-white dark:bg-swiss-black">
      <div class="mx-auto flex max-w-[1600px] flex-col md:flex-row md:items-stretch md:justify-between">
        <NuxtLink to="/" class="group flex min-h-16 items-center px-5 no-underline sm:px-8 md:border-r-4 md:border-swiss-black dark:border-white">
          <span class="font-black text-3xl uppercase tracking-tighter text-swiss-black dark:text-white group-hover:bg-swiss-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-swiss-black transition-all px-2">BLINK</span>
        </NuxtLink>

        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-3 border-t-4 border-swiss-black px-5 py-4 dark:border-white sm:px-8 md:border-t-0">
           <div class="flex items-center gap-2">
             <span class="size-4 bg-swiss-orange" />
             <span class="text-[10px] sm:text-xs font-black uppercase tracking-widest text-swiss-black dark:text-white">THIS DEVICE</span>
           </div>
           <div class="hidden h-6 w-px bg-swiss-black dark:bg-white sm:block" />
           <div class="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-swiss-grey dark:text-swiss-grey-light">
             CONNECTED DEVICES: <span class="text-swiss-black dark:text-white font-black">{{ connectedPeers.size }}</span>
           </div>
        </div>

        <div class="flex items-stretch border-t-4 border-swiss-black dark:border-white md:border-l-4 md:border-t-0">
          <UButton
            color="neutral"
            variant="ghost"
            class="min-h-14 w-full rounded-none px-6 sm:px-10 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-swiss-black hover:text-white dark:hover:bg-white dark:hover:text-swiss-black transition-all"
            @click="toggleTheme"
          >
            THEME
          </UButton>
        </div>
      </div>
    </header>

    <main class="flex-1 flex flex-col min-h-0 relative z-10">
      <div class="mx-auto flex w-full max-w-[1600px] flex-1 min-h-0 flex-col border-y-4 border-swiss-black bg-white/40 backdrop-blur-[1px] dark:border-white dark:bg-swiss-black/40 sm:border-x-4 sm:border-y-0 xl:flex-row">
        <!-- Sidebar: Nodes -->
        <div class="min-h-0 w-full shrink-0 flex-col border-b-4 border-swiss-black dark:border-white xl:w-80 xl:border-b-0 xl:border-r-4" :class="activeMobileTab !== 'discover' ? 'hidden xl:flex' : 'flex'">
          <div class="p-5 sm:p-6 border-b-4 border-swiss-black dark:border-white bg-swiss-black dark:bg-white">
            <h2 class="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-white dark:text-swiss-black">NEARBY DEVICES</h2>
          </div>
          
          <div class="p-4 sm:p-6 border-b-2 border-swiss-black dark:border-white bg-swiss-bg dark:bg-swiss-bg-dark">
            <div v-if="localDevice" class="bg-white dark:bg-swiss-paper-dark border-2 border-swiss-black dark:border-white p-4 sm:p-5">
               <span class="block text-[10px] font-black text-swiss-orange uppercase mb-2">YOUR DEVICE</span>
               <p class="text-xl sm:text-2xl font-black leading-none uppercase tracking-tighter text-swiss-black dark:text-white break-words">{{ localDevice.name }}</p>
               <p class="text-[11px] font-bold text-swiss-grey dark:text-swiss-grey-light mt-2 uppercase tracking-widest">{{ localDevice.platform }}</p>
               
               <div class="mt-6 flex flex-col gap-4 border-t border-swiss-border pt-4 dark:border-white/20 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <span class="block text-[9px] font-black text-swiss-grey dark:text-swiss-grey-light uppercase mb-1">PAIR CODE</span>
                    <span class="text-3xl sm:text-4xl font-black tracking-tighter text-swiss-black dark:text-white">{{ localPairCode }}</span>
                  </div>
                  <UButton variant="ghost" size="xs" class="self-start p-0 text-swiss-orange font-black hover:bg-transparent sm:self-auto" @click="regeneratePairCode">NEW CODE</UButton>
               </div>
            </div>
          </div>

          <div class="flex-1 overflow-y-auto p-4 bg-white/60 dark:bg-swiss-black/20">
            <DeviceList
              :devices="devices"
              :selected-device="selectedDevice"
              :connected-peers="connectedPeers"
              :connection-states="connectionStates"
              @select="handleDeviceSelect"
              @connect="handleDeviceConnect"
            />
          </div>
        </div>

        <!-- Center: Interface -->
        <div class="min-h-0 flex-1 flex-col" :class="activeMobileTab !== 'transfer' ? 'hidden xl:flex' : 'flex'">
          <div class="p-5 sm:p-6 lg:p-8 border-b-4 border-swiss-black dark:border-white bg-white dark:bg-swiss-paper-dark">
             <div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                   <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.8] text-swiss-black dark:text-white">SEND FILES</h1>
                   <p class="mt-4 sm:mt-6 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] text-swiss-grey dark:text-swiss-grey-light">CONNECT A DEVICE, THEN CHOOSE FILES TO SEND</p>
                </div>
                <div class="text-left lg:text-right">
                   <span class="block text-[10px] font-black text-swiss-grey dark:text-swiss-grey-light uppercase mb-1">SEND TO</span>
                   <span class="block break-words text-2xl sm:text-3xl font-black uppercase tracking-tighter text-swiss-orange">
                     {{ targetPeerForSend ? getDeviceNameByPeerId(targetPeerForSend) : 'CHOOSE A DEVICE' }}
                   </span>
                </div>
             </div>
          </div>

          <!-- Upload Area -->
          <div class="p-4 sm:p-6 lg:p-10 border-b-4 border-swiss-black dark:border-white bg-swiss-bg dark:bg-swiss-bg-dark">
            <FileUploader
              :disabled="connectedPeers.size === 0"
              :connected-count="connectedPeers.size"
              @files-selected="handleFilesSelected"
            />
          </div>

          <!-- Queue -->
          <div class="flex-1 flex flex-col min-h-0 p-4 sm:p-6 lg:p-8 bg-white/40 dark:bg-swiss-black/40">
            <div class="mb-6 sm:mb-8 flex items-center justify-between gap-4 border-b-4 border-swiss-black dark:border-white pb-4">
               <h3 class="text-xs sm:text-sm font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-swiss-black dark:text-white">TRANSFERS</h3>
               <span class="text-sm font-black bg-swiss-black dark:bg-white text-white dark:text-swiss-black px-3 py-1">[{{ transfers.length }}]</span>
            </div>
            <TransferProgress :embedded="true" class="flex-1 min-h-0" />
          </div>
        </div>

        <!-- Mobile: Network -->
        <div v-show="activeMobileTab === 'network'" class="w-full border-t-4 border-swiss-black dark:border-white xl:hidden">
          <NetworkPanel
            :local-pair-code="localPairCode"
            :auto-accept-trusted-files="autoAcceptTrustedFiles"
            :connected-peer-count="connectedPeers.size"
            :target-peer-label="targetPeerForSend ? getDeviceNameByPeerId(targetPeerForSend) : 'No device selected'"
            @refresh-pair-code="regeneratePairCode"
            @toggle-auto-accept="autoAcceptTrustedFiles = !autoAcceptTrustedFiles"
          />
        </div>

        <!-- Desktop: Status -->
        <div class="hidden 2xl:flex w-80 min-h-0 flex-col border-l-4 border-swiss-black dark:border-white">
          <NetworkPanel
            :local-pair-code="localPairCode"
            :auto-accept-trusted-files="autoAcceptTrustedFiles"
            :connected-peer-count="connectedPeers.size"
            :target-peer-label="targetPeerForSend ? getDeviceNameByPeerId(targetPeerForSend) : 'No device selected'"
            @refresh-pair-code="regeneratePairCode"
            @toggle-auto-accept="autoAcceptTrustedFiles = !autoAcceptTrustedFiles"
          />
        </div>
      </div>
    </main>

    <!-- Mobile Nav (Swiss Style) -->
    <nav class="sticky bottom-0 z-20 flex h-16 items-stretch border-t-4 border-swiss-black bg-white/95 backdrop-blur-sm dark:border-white dark:bg-swiss-black/95 xl:hidden">
      <button
        v-for="tab in mobileTabs"
        :key="tab.value"
        class="flex flex-1 items-center justify-center px-2 text-[10px] font-black uppercase tracking-[0.2em]"
        :class="activeMobileTab === tab.value ? 'bg-swiss-black text-white dark:bg-white dark:text-swiss-black' : 'text-swiss-black dark:text-white'"
        @click="activeMobileTab = tab.value as typeof activeMobileTab"
      >
        {{ tab.label }}
      </button>
    </nav>

    <!-- Incoming Modal -->
    <UModal 
      :open="isIncomingFileModalOpen" 
      :close="false" 
      :prevent-close="true" 
      :ui="{ 
        content: 'rounded-none border-4 border-swiss-black dark:border-white',
        container: 'flex min-h-full items-center justify-center p-4 text-center'
      }"
    >
      <template #content>
        <div class="w-full max-w-lg bg-white p-6 text-left text-swiss-black dark:bg-swiss-black dark:text-white sm:p-8">
          <h2 class="mb-6 border-b-4 border-swiss-black pb-4 text-3xl font-black uppercase tracking-tighter dark:border-white sm:mb-8 sm:text-4xl">INCOMING FILE</h2>
          <div v-if="currentIncomingFile" class="border-b-2 border-swiss-black dark:border-white/20 py-6 mb-8">
             <p class="mb-4 text-sm font-bold uppercase tracking-widest"><span class="font-black underline">{{ getDeviceNameByPeerId(currentIncomingFile.peerId) }}</span> wants to send you a file.</p>
             <div class="bg-swiss-bg dark:bg-swiss-bg-dark p-6 border-2 border-swiss-black dark:border-white">
                <p class="text-2xl font-black uppercase tracking-tighter break-all">{{ currentIncomingFile.metadata.name }}</p>
                <p class="text-xs font-bold text-swiss-grey dark:text-swiss-grey-light mt-4 uppercase tracking-[0.2em]">{{ formatBytes(currentIncomingFile.metadata.size) }}</p>
             </div>
          </div>
          <div class="flex flex-col gap-4 sm:flex-row">
             <UButton class="flex-1 rounded-none bg-swiss-black dark:bg-white text-white dark:text-swiss-black py-5 sm:py-6 font-black uppercase tracking-widest hover:bg-swiss-orange dark:hover:bg-swiss-orange transition-all" @click="acceptIncomingFile">ACCEPT FILE</UButton>
             <UButton variant="outline" class="flex-1 rounded-none border-4 border-swiss-black dark:border-white text-swiss-black dark:text-white py-5 sm:py-6 font-black uppercase tracking-widest hover:bg-swiss-black hover:text-white dark:hover:bg-white dark:hover:text-swiss-black transition-all" @click="declineIncomingFile">DECLINE</UButton>
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
import { useFileTransfer, type IncomingFilePrompt } from '../composables/useFileTransfer'
import { useTheme } from '../composables/useTheme'

const { devices, localDevice, connect, disconnect, initDevice, setLocalPeerId } = useDeviceDiscovery()
const { initPeer, connectToPeer, connections, connectionStates, onConnection, destroy } = useWebRTC()
const { transfers, sendFile, receiveFile } = useFileTransfer()
const { toggleTheme } = useTheme()
const toast = useToast()

const selectedDevice = ref<Device | null>(null)
const connectedPeers = ref<Set<string>>(new Set())
const targetPeerForSend = ref<string | null>(null)
const activeMobileTab = ref<'discover' | 'transfer' | 'network'>('transfer')
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
}

const incomingFileQueue = ref<IncomingFileQueueItem[]>([])
const incomingFileResolvers = new Map<string, (accepted: boolean) => void>()
const pendingPairRequests = new Map<string, { peerId: string; timeoutId: ReturnType<typeof setTimeout> }>()
const pairingMessageListeners = new WeakSet<DataConnection>()
const PAIR_REQUEST_TIMEOUT_MS = 30000

const currentIncomingFile = computed(() => incomingFileQueue.value[0] ?? null)
const isIncomingFileModalOpen = computed(() => currentIncomingFile.value !== null)
const trustedPeerSet = computed(() => new Set(trustedPeerIds.value))

const mobileTabs = [
  { value: 'discover', label: 'DEVICES', icon: '' },
  { value: 'transfer', label: 'SEND', icon: '' },
  { value: 'network', label: 'STATUS', icon: '' }
]

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

const enqueueIncomingFilePrompt = ({ transferId, metadata, connection }: IncomingFilePrompt): Promise<boolean> => {
  return new Promise((resolve) => {
    incomingFileQueue.value.push({
      transferId,
      metadata,
      peerId: connection.peer
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

  return enqueueIncomingFilePrompt(incoming)
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
      onIncomingFile: handleIncomingFilePrompt
    })
  })

  try {
    const peerId = await initPeer(localDevice.value?.id)
    setLocalPeerId(peerId)
  } catch (error) {
    console.error('Failed to initialize peer:', error)
  }

  connect()
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

  for (const file of files) {
    try {
      await sendFile(file, connection)
    } catch (error) {
      console.error('Failed to send file:', error)
    }
  }
}

onUnmounted(() => {
  rejectAllIncomingPrompts()
  clearAllPendingPairRequests()
  disconnect()
  destroy()
})
</script>
