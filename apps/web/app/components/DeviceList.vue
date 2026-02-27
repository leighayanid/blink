<template>
  <div class="flex flex-col">
    <!-- Empty State -->
    <div
      v-if="devices.length === 0"
      class="flex flex-col items-center justify-center py-12 border border-dashed border-neutral-200 dark:border-neutral-700 rounded-xl text-center"
    >
      <UIcon name="i-lucide-globe" class="size-10 text-neutral-300 dark:text-neutral-600 mb-4" />
      <p class="font-mono font-bold text-sm text-neutral-400 tracking-widest">NO DEVICES FOUND</p>
      <p class="text-xs text-neutral-400 mt-1">Ensure devices are on the same network.</p>
    </div>

    <!-- Devices List -->
    <div v-else class="flex flex-col gap-3">
      <div
        v-for="(device, index) in devices"
        :key="device.id"
        class="flex flex-col justify-between p-4 rounded-xl border transition-all cursor-pointer hover:-translate-y-px"
        :class="getCardClass(device)"
        :style="{ animationDelay: `${index * 50}ms` }"
        @click="$emit('select', device)"
      >
        <div class="flex items-start gap-3 mb-4">
          <div class="relative p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 shrink-0">
            <UIcon :name="getPlatformIcon(device.platform)" class="size-6 text-neutral-600 dark:text-neutral-300" />
            <!-- Connected indicator -->
            <span
              v-if="device.peerId && connectedPeersResolved.has(device.peerId)"
              class="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-green-500 border-2 border-white dark:border-neutral-900"
            />
            <!-- Connecting indicator -->
            <span
              v-else-if="getDeviceState(device) === 'connecting'"
              class="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-blue-400 border-2 border-white dark:border-neutral-900 animate-pulse"
            />
          </div>

          <div class="flex-1 min-w-0">
            <UBadge color="neutral" variant="outline" size="xs" class="font-mono font-bold text-xs mb-1.5">
              {{ getPlatformLabel(device.platform) }}
            </UBadge>
            <p class="font-bold text-sm truncate leading-tight">{{ device.name }}</p>
            <p class="text-xs font-mono text-neutral-400 tracking-wide uppercase mt-0.5">{{ getStatusText(device) }}</p>
          </div>
        </div>

        <UButton
          size="xs"
          color="neutral"
          :variant="connectedPeersResolved.has(device.peerId || '') ? 'outline' : 'solid'"
          :loading="getDeviceState(device) === 'connecting'"
          :disabled="!device.peerId"
          class="w-full font-mono font-bold tracking-widest text-xs"
          @click.stop="$emit('connect', device)"
        >
          {{ getActionLabel(device) }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Device } from '@blink/types'
import type { ConnectionState } from '../composables/useWebRTC'

const props = defineProps<{
  devices: Device[]
  selectedDevice?: Device | null
  connectedPeers?: Set<string>
  connectionStates?: Map<string, ConnectionState>
}>()

defineEmits<{
  select: [device: Device]
  connect: [device: Device]
}>()

const connectedPeersResolved = computed(() => props.connectedPeers ?? new Set<string>())

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

const getPlatformIcon = (platform: string): string => {
  const lower = platform.toLowerCase()
  if (lower.includes('android') || lower.includes('ios')) return 'i-lucide-smartphone'
  if (lower.includes('win') || lower.includes('mac') || lower.includes('linux')) return 'i-lucide-monitor'
  return 'i-lucide-cpu'
}

const getDeviceState = (device: Device): ConnectionState | undefined => {
  if (!device.peerId) return undefined
  return props.connectionStates?.get(device.peerId)
}

const getStatusText = (device: Device): string => {
  const state = getDeviceState(device)
  if (state === 'connecting') return 'ESTABLISHING...'
  if (state === 'error') return 'CONNECTION FAILED'
  if (device.peerId && connectedPeersResolved.value.has(device.peerId)) return 'CONNECTED'
  return 'AVAILABLE'
}

const getActionLabel = (device: Device): string => {
  const state = getDeviceState(device)
  if (state === 'connecting') return 'CONNECTING'
  if (device.peerId && connectedPeersResolved.value.has(device.peerId)) return 'DISCONNECT'
  return 'CONNECT'
}

const getCardClass = (device: Device): string => {
  if (getDeviceState(device) === 'error') {
    return 'border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-950/20'
  }
  if (getDeviceState(device) === 'connecting') {
    return 'border-blue-200 dark:border-blue-800/50 bg-blue-50/50 dark:bg-blue-950/20'
  }
  if (device.peerId && connectedPeersResolved.value.has(device.peerId)) {
    return 'border-neutral-900 dark:border-neutral-100 bg-neutral-50 dark:bg-neutral-900'
  }
  return 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
}
</script>
