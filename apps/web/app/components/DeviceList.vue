<template>
  <div class="flex flex-col">
    <div
      v-if="devices.length === 0"
      class="flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-primary-200/70 bg-primary-50/35 px-6 py-12 text-center dark:border-primary-500/20 dark:bg-white/3"
    >
      <UIcon name="i-lucide-globe" class="mb-4 size-10 text-primary-300 dark:text-primary-400/70" />
      <p class="text-sm font-semibold text-neutral-700 dark:text-neutral-200">No devices</p>
      <p class="mt-2 max-w-[15rem] text-sm text-neutral-500 dark:text-neutral-400">Ensure nearby devices are on the same local network.</p>
    </div>

    <div v-else class="flex flex-col gap-3">
      <div
        v-for="(device, index) in devices"
        :key="device.id"
        class="cursor-pointer rounded-[1.5rem] border p-4 transition-all hover:-translate-y-px"
        :class="getCardClass(device)"
        :style="{ animationDelay: `${index * 50}ms` }"
        @click="$emit('select', device)"
      >
        <div class="mb-4 flex items-start gap-3">
          <div class="relative flex size-12 shrink-0 items-center justify-center rounded-2xl border border-black/5 bg-white/80 text-neutral-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
            <UIcon :name="getPlatformIcon(device.platform)" class="size-6" />
            <span
              v-if="device.peerId && connectedPeersResolved.has(device.peerId)"
              class="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-white bg-green-500 dark:border-neutral-900"
            />
            <span
              v-else-if="getDeviceState(device) === 'connecting'"
              class="absolute -right-0.5 -top-0.5 size-3 rounded-full border-2 border-white bg-sky-400 dark:border-neutral-900"
            />
          </div>

          <div class="min-w-0 flex-1">
            <UBadge color="neutral" variant="outline" size="xs" class="mb-2 rounded-full text-[11px] font-medium">
              {{ getPlatformLabel(device.platform) }}
            </UBadge>
            <p class="truncate text-sm font-semibold text-neutral-950 dark:text-white">{{ device.name }}</p>
            <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{{ getStatusText(device) }}</p>
          </div>
        </div>

        <UButton
          size="xs"
          color="neutral"
          :variant="connectedPeersResolved.has(device.peerId || '') ? 'outline' : 'solid'"
          :loading="getDeviceState(device) === 'connecting'"
          :disabled="!device.peerId"
          class="w-full rounded-full px-4 text-[11px] font-medium"
          :class="connectedPeersResolved.has(device.peerId || '')
            ? 'border-black/10 bg-white/70 text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-200'
            : 'border-0 bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:text-neutral-950 dark:hover:bg-primary-400'"
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
  if (state === 'connecting') return 'Connecting'
  if (state === 'error') return 'Failed'
  if (device.peerId && connectedPeersResolved.value.has(device.peerId)) return 'Connected'
  return 'Available'
}

const getActionLabel = (device: Device): string => {
  const state = getDeviceState(device)
  if (state === 'connecting') return 'CONNECTING'
  if (device.peerId && connectedPeersResolved.value.has(device.peerId)) return 'DISCONNECT'
  return 'CONNECT'
}

const getCardClass = (device: Device): string => {
  if (getDeviceState(device) === 'error') {
    return 'border-red-200 bg-red-50/70 dark:border-red-800/40 dark:bg-red-950/20'
  }
  if (getDeviceState(device) === 'connecting') {
    return 'border-sky-200 bg-sky-50/70 dark:border-sky-800/40 dark:bg-sky-950/20'
  }
  if (device.peerId && connectedPeersResolved.value.has(device.peerId)) {
    return 'border-primary-300 bg-primary-50/70 dark:border-primary-500/30 dark:bg-primary-500/10'
  }
  if (props.selectedDevice?.id === device.id) {
    return 'border-neutral-300 bg-neutral-50/80 dark:border-neutral-600 dark:bg-white/7'
  }
  return 'border-black/5 bg-white/70 hover:border-primary-200 hover:bg-primary-50/40 dark:border-white/10 dark:bg-white/4 dark:hover:border-primary-500/20 dark:hover:bg-white/7'
}
</script>
