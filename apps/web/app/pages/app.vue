<template>
  <div class="flex flex-col h-screen overflow-hidden bg-white dark:bg-neutral-950">
    <!-- Three-Column Dashboard -->
    <div class="flex flex-1 min-h-0">

      <!-- LEFT COLUMN: Identity & Discovery -->
      <div
        class="flex flex-col w-72 shrink-0 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto"
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
        class="flex flex-col w-72 shrink-0 border-l border-neutral-200 dark:border-neutral-800 overflow-y-auto"
        :class="{ 'hidden md:flex': activeMobileTab !== 'network' }"
      >
        <div class="px-5 py-4 flex-1">
          <div class="flex items-center justify-between mb-3">
            <p class="text-xs font-mono font-bold text-neutral-400 tracking-widest">NETWORK</p>
            <UBadge color="neutral" variant="soft" class="font-mono text-xs">{{ connectedPeers.size }}</UBadge>
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
                    ACTIVE
                  </p>
                </div>
              </div>

              <div class="flex gap-2">
                <UButton
                  v-if="connectedPeers.size > 1"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  class="font-mono font-bold text-xs tracking-wider"
                  :class="targetPeerForSend === device.peerId ? 'text-neutral-400 dark:text-neutral-600 hover:text-neutral-300' : ''"
                  @click="targetPeerForSend = device.peerId"
                >
                  {{ targetPeerForSend === device.peerId ? 'SELECTED' : 'SELECT' }}
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
import type { Device } from '@blink/types'
import { useDeviceDiscovery } from '../composables/useDeviceDiscovery'
import { useWebRTC } from '../composables/useWebRTC'
import { useFileTransfer } from '../composables/useFileTransfer'
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

onMounted(async () => {
  initDevice()

  onConnection((conn) => {
    receiveFile(conn)
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
      targetPeerForSend.value = device.peerId
      return
    }
    await connectToPeer(device.peerId)
    connectedPeers.value.add(device.peerId)
    targetPeerForSend.value = device.peerId
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
  disconnect()
  destroy()
})
</script>
