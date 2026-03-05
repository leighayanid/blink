<template>
  <div class="flex flex-col h-screen overflow-hidden bg-white dark:bg-neutral-950">
    <!-- Three-Column Dashboard -->
    <div class="flex flex-1 min-h-0">

      <!-- LEFT COLUMN: Identity & Discovery -->
      <div
        class="flex flex-col w-full md:w-72 shrink-0 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto"
        :class="{ 'hidden md:flex': activeMobileTab !== 'discover' }"
      >
        <!-- App Header -->
        <div class="relative px-5 py-5 border-b border-neutral-200 dark:border-neutral-800 text-center shrink-0">
          <ClientOnly>
            <UButton
              :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
              color="neutral"
              variant="ghost"
              size="xs"
              class="absolute top-4 right-4"
              @click="toggleTheme"
            />
            <template #fallback>
              <div class="absolute top-4 right-4 size-7" />
            </template>
          </ClientOnly>

          <h1 class="text-4xl font-black tracking-tight leading-none">BLINK</h1>
          <p class="text-xs font-mono text-neutral-400 tracking-widest mt-1.5 mb-3">SECURE LOCAL FILE SHARING</p>
          <UBadge color="success" variant="soft" class="font-mono text-xs gap-1.5">
            <span class="size-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            ONLINE
          </UBadge>
        </div>

        <!-- Local Device -->
        <div class="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <p class="text-xs font-mono font-bold text-neutral-400 tracking-widest mb-3">LOCAL DEVICE</p>
          <div v-if="localDevice" class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <UBadge color="neutral" variant="outline" class="font-mono font-bold text-xs shrink-0">
                {{ getPlatformLabel(localDevice.platform) }}
              </UBadge>
              <div class="min-w-0">
                <p class="font-bold text-sm truncate">{{ localDevice.name }}</p>
                <p class="text-xs text-neutral-400">{{ localDevice.platform }}</p>
              </div>
            </div>
            <UBadge
              :color="isConnected ? 'success' : 'neutral'"
              variant="soft"
              class="font-mono text-xs shrink-0"
            >
              {{ isConnected ? 'LIVE' : 'OFFLINE' }}
            </UBadge>
          </div>
        </div>

        <!-- Discovered Devices -->
        <div class="px-5 py-4 flex-1">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-mono font-bold text-neutral-400 tracking-widest">DISCOVERED</p>
            <UBadge color="neutral" variant="soft" class="font-mono text-xs">{{ devices.length }}</UBadge>
          </div>
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

      <!-- CENTER COLUMN: Transfer -->
      <div
        class="flex flex-col flex-1 min-w-0 overflow-y-auto"
        :class="{ 'hidden md:flex': activeMobileTab !== 'transfer' }"
      >
        <!-- File Upload -->
        <div class="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <p class="text-xs font-mono font-bold text-neutral-400 tracking-widest mb-3">TRANSFER FILES</p>
          <FileUploader
            :disabled="connectedPeers.size === 0"
            :connected-count="connectedPeers.size"
            @files-selected="handleFilesSelected"
          />
        </div>

        <!-- Transfer Queue -->
        <div class="px-5 py-4 flex-1 flex flex-col min-h-0">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-mono font-bold text-neutral-400 tracking-widest">QUEUE</p>
            <UBadge v-if="transfers.length > 0" color="neutral" variant="soft" class="font-mono text-xs">
              {{ transfers.length }}
            </UBadge>
          </div>
          <TransferProgress :embedded="true" class="flex-1 min-h-0" />
        </div>
      </div>

      <!-- RIGHT COLUMN: Active Connections -->
      <div
        class="flex flex-col w-full md:w-72 shrink-0 border-l border-neutral-200 dark:border-neutral-800 overflow-y-auto"
        :class="{ 'hidden md:flex': activeMobileTab !== 'network' }"
      >
        <div class="px-5 py-4 flex-1">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-mono font-bold text-neutral-400 tracking-widest">NETWORK</p>
            <UBadge color="neutral" variant="soft" class="font-mono text-xs">{{ connectedPeers.size }}</UBadge>
          </div>

          <div class="mb-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/70">
            <div class="flex items-center justify-between mb-2">
              <p class="text-[10px] font-mono font-bold text-neutral-400 tracking-widest">PAIRING CODE</p>
              <UButton
                size="xs"
                color="neutral"
                variant="ghost"
                class="font-mono font-bold text-[10px] tracking-wider"
                @click="regeneratePairCode"
              >
                NEW
              </UButton>
            </div>
            <p class="text-xl font-mono font-black tracking-[0.25em]">{{ localPairCode }}</p>
            <p class="text-[11px] text-neutral-500 mt-1">
              Share this 6-digit code with the sender to trust their device.
            </p>
            <div class="mt-3 flex items-center justify-between gap-2">
              <p class="text-[10px] font-mono font-bold text-neutral-400 tracking-widest">
                AUTO-ACCEPT TRUSTED FILES
              </p>
              <UButton
                size="xs"
                :color="autoAcceptTrustedFiles ? 'success' : 'neutral'"
                :variant="autoAcceptTrustedFiles ? 'soft' : 'outline'"
                class="font-mono font-bold text-[10px] tracking-wider"
                @click="autoAcceptTrustedFiles = !autoAcceptTrustedFiles"
              >
                {{ autoAcceptTrustedFiles ? 'ON' : 'OFF' }}
              </UButton>
            </div>
          </div>

          <!-- Empty state -->
          <div
            v-if="connectedPeers.size === 0 && !hasConnectingDevices"
            class="flex flex-col items-center justify-center h-48 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl"
          >
            <UIcon name="i-lucide-wifi-off" class="size-8 text-neutral-300 dark:text-neutral-600 mb-3" />
            <p class="text-xs font-mono text-neutral-400 tracking-widest">NO ACTIVE CONNECTIONS</p>
          </div>

          <div v-else class="flex flex-col gap-3">
            <!-- Connecting devices -->
            <div
              v-for="device in connectingDevices"
              :key="'connecting-' + device.id"
              class="flex items-center justify-between p-3 rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20"
            >
              <div class="flex items-center gap-2 min-w-0">
                <UBadge color="neutral" variant="outline" class="font-mono font-bold text-xs shrink-0">
                  {{ getPlatformLabel(device.platform) }}
                </UBadge>
                <span class="text-sm font-medium truncate">{{ device.name }}</span>
              </div>
              <span class="text-xs font-mono text-neutral-400 shrink-0 ml-2">...</span>
            </div>

            <!-- Connected devices -->
            <div
              v-for="device in devices.filter(d => connectedPeers.has(d.peerId!))"
              :key="device.id"
              class="p-3 rounded-xl border transition-colors"
              :class="targetPeerForSend === device.peerId
                ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white'
                : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900'"
            >
              <div class="flex items-center gap-2 mb-2.5">
                <UBadge
                  color="neutral"
                  variant="outline"
                  class="font-mono font-bold text-xs shrink-0"
                  :class="targetPeerForSend === device.peerId ? 'border-neutral-400 text-neutral-400' : ''"
                >
                  {{ getPlatformLabel(device.platform) }}
                </UBadge>
                <div class="flex-1 min-w-0">
                  <p
                    class="text-sm font-semibold truncate"
                    :class="targetPeerForSend === device.peerId
                      ? 'text-white dark:text-neutral-900'
                      : 'text-neutral-900 dark:text-white'"
                  >
                    {{ device.name }}
                  </p>
                  <p
                    class="text-xs font-mono"
                    :class="targetPeerForSend === device.peerId ? 'text-neutral-400 dark:text-neutral-500' : 'text-neutral-400'"
                  >
                    {{ isTrustedPeer(device.peerId) ? 'TRUSTED CONNECTION' : 'ACTIVE' }}
                  </p>
                </div>
              </div>

              <div class="mb-2.5">
                <UBadge
                  :color="isTrustedPeer(device.peerId) ? 'success' : 'neutral'"
                  variant="soft"
                  class="font-mono text-[10px] tracking-wider"
                >
                  {{ isTrustedPeer(device.peerId) ? 'TRUSTED' : 'UNTRUSTED' }}
                </UBadge>
              </div>

              <div v-if="device.peerId && !isTrustedPeer(device.peerId)" class="flex gap-2 mb-2.5">
                <UInput
                  :model-value="pairCodeInputs[device.peerId] || ''"
                  placeholder="ENTER CODE"
                  size="xs"
                  inputmode="numeric"
                  maxlength="6"
                  class="flex-1"
                  @update:model-value="updatePairCodeInput(device.peerId, String($event ?? ''))"
                  @keydown.enter.prevent="pairWithPeer(device.peerId)"
                />
                <UButton
                  size="xs"
                  color="primary"
                  variant="solid"
                  class="font-mono font-bold text-xs tracking-wider"
                  :loading="isPairingPeer(device.peerId)"
                  @click="pairWithPeer(device.peerId)"
                >
                  PAIR
                </UButton>
              </div>

              <div class="flex gap-2">
                <UButton
                  v-if="connectedPeers.size > 1"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  class="font-mono font-bold text-xs tracking-wider"
                  :class="targetPeerForSend === device.peerId ? 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-300' : ''"
                  @click="targetPeerForSend = device.peerId ?? null"
                >
                  {{ targetPeerForSend === device.peerId ? 'SELECTED' : 'SELECT' }}
                </UButton>
                <UButton
                  v-if="device.peerId && isTrustedPeer(device.peerId)"
                  size="xs"
                  color="warning"
                  variant="outline"
                  class="font-mono font-bold text-xs tracking-wider"
                  @click="untrustPeer(device.peerId)"
                >
                  UNTRUST
                </UButton>
                <UButton
                  size="xs"
                  color="neutral"
                  variant="outline"
                  class="font-mono font-bold text-xs tracking-wider"
                  @click="handleDeviceDisconnect(device)"
                >
                  DISCONNECT
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Bottom Navigation -->
    <nav class="md:hidden flex shrink-0 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 pb-safe">
      <button
        v-for="tab in mobileTabs"
        :key="tab.value"
        class="relative flex flex-col items-center justify-center gap-1 flex-1 py-3 text-xs font-mono font-bold tracking-widest transition-colors"
        :class="activeMobileTab === tab.value
          ? 'text-neutral-900 dark:text-white'
          : 'text-neutral-400'"
        @click="activeMobileTab = tab.value as typeof activeMobileTab"
      >
        <UIcon :name="tab.icon" class="size-5" />
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.value === 'network' && connectedPeers.size > 0"
          class="absolute top-2 right-[22%] size-4 flex items-center justify-center bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[9px] rounded-full font-mono leading-none"
        >{{ connectedPeers.size }}</span>
      </button>
    </nav>

    <UModal :open="isIncomingFileModalOpen" :close="false" :prevent-close="true">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-download" class="size-5 text-neutral-500" />
          <h3 class="text-sm font-bold tracking-wide">INCOMING FILE</h3>
        </div>
      </template>

      <div v-if="currentIncomingFile" class="space-y-3">
        <p class="text-sm text-neutral-600 dark:text-neutral-300">
          <span class="font-semibold">{{ currentIncomingFile.peerId }}</span>
          wants to send:
        </p>
        <div class="rounded-lg border border-neutral-200 dark:border-neutral-700 p-3">
          <p class="font-semibold break-all">{{ currentIncomingFile.metadata.name }}</p>
          <p class="text-xs text-neutral-500 mt-1">{{ formatBytes(currentIncomingFile.metadata.size) }}</p>
        </div>
        <p class="text-xs text-neutral-500">
          Accept to start receiving. Decline to cancel this transfer.
        </p>
        <p v-if="incomingFileQueue.length > 1" class="text-xs text-neutral-500">
          {{ incomingFileQueue.length - 1 }} more file request(s) waiting.
        </p>
      </div>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="outline" @click="declineIncomingFile">
            DECLINE
          </UButton>
          <UButton color="success" @click="acceptIncomingFile">
            ACCEPT
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Footer (desktop only) -->
    <footer class="hidden md:flex justify-center items-center py-2.5 text-xs font-mono text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 shrink-0">
      CREATED BY
      <a
        href="https://leighdinaya.dev"
        target="_blank"
        rel="noopener"
        class="font-bold text-neutral-700 dark:text-neutral-300 ml-1 hover:underline"
      >LEIGH DINAYA</a>
    </footer>
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

const { devices, localDevice, isConnected, connect, disconnect, initDevice, setLocalPeerId } = useDeviceDiscovery()
const { initPeer, connectToPeer, connections, connectionStates, onConnection, destroy } = useWebRTC()
const { transfers, sendFile, receiveFile } = useFileTransfer()
const { isDark, toggleTheme } = useTheme()
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
  { value: 'discover', label: 'DISCOVER', icon: 'i-lucide-compass' },
  { value: 'transfer', label: 'TRANSFER', icon: 'i-lucide-plus' },
  { value: 'network', label: 'NETWORK', icon: 'i-lucide-wifi' }
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
      title: `Declined ${current.metadata.name}`,
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
    toast.add({ title: `${getDeviceNameByPeerId(peerId)} is already trusted`, color: 'info' })
    return
  }

  const connection = connections.value.get(peerId)
  if (!connection || !connection.open) {
    toast.add({ title: 'Device is not connected', color: 'error' })
    return
  }

  const targetCode = normalizePairCode(pairCodeInputs.value[peerId] || '')
  if (targetCode.length !== 6) {
    toast.add({ title: 'Enter a valid 6-digit pairing code', color: 'warning' })
    return
  }

  const requestId = `pair-${crypto.randomUUID()}`
  const timeoutId = setTimeout(() => {
    clearPendingPairRequest(requestId)
    toast.add({
      title: `Pairing timed out with ${getDeviceNameByPeerId(peerId)}`,
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
    title: `Pair request sent to ${getDeviceNameByPeerId(peerId)}`,
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
        title: `Paired with ${getDeviceNameByPeerId(connection.peer)}`,
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
          title: `Pairing validation failed with ${getDeviceNameByPeerId(connection.peer)}`,
          color: 'error'
        })
        return
      }

      addTrustedPeer(connection.peer)
      pairCodeInputs.value[connection.peer] = ''
      toast.add({
        title: `Paired with ${getDeviceNameByPeerId(connection.peer)}`,
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
        title: `Pairing failed with ${getDeviceNameByPeerId(connection.peer)}`,
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

const getPlatformLabel = (platform: string): string => {
  const map: Record<string, string> = {
    Windows: 'WIN',
    macOS: 'MAC',
    Linux: 'LIN',
    Android: 'AND',
    iOS: 'IOS',
    Unknown: 'UNK'
  }
  return map[platform] || 'UNK'
}

const handleDeviceSelect = (device: Device) => {
  selectedDevice.value = device
}

const handleDeviceConnect = async (device: Device) => {
  try {
    if (!device.peerId) {
      toast.add({ title: 'Cannot connect: Device has no peer ID', color: 'error' })
      return
    }
    if (connectedPeers.value.has(device.peerId)) {
      targetPeerForSend.value = device.peerId ?? null
      return
    }
    await connectToPeer(device.peerId)
    connectedPeers.value.add(device.peerId)
    targetPeerForSend.value = device.peerId ?? null
    toast.add({ title: `Connected to ${device.name}`, color: 'success' })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    toast.add({ title: `Failed to connect to ${device.name}: ${errorMsg}`, color: 'error' })
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
