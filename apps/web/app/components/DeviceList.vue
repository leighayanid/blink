<template>
  <div class="flex flex-col">
    <div
      v-if="devices.length === 0"
      class="flex flex-col items-center justify-center border-4 border-swiss-black dark:border-white bg-swiss-bg dark:bg-swiss-bg-dark px-6 py-12 text-center"
    >
      <UIcon name="i-lucide-globe" class="mb-4 size-10 text-swiss-orange" />
      <p class="text-xs font-black uppercase tracking-[0.3em] text-swiss-black dark:text-white">NO_DEVICES_FOUND</p>
      <p class="mt-4 max-w-[15rem] text-[10px] font-bold uppercase tracking-widest text-swiss-grey dark:text-swiss-grey-light leading-relaxed">Ensure nearby devices are on the same local network.</p>
    </div>

    <div v-else class="flex flex-col border-t-2 border-swiss-black dark:border-white">
      <div
        v-for="(device, index) in devices"
        :key="device.id"
        class="group relative cursor-pointer border-b border-swiss-border dark:border-white/20 p-4 transition-colors"
        :class="getCardClass(device)"
        @click="$emit('select', device)"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <!-- Geometric Status Indicator -->
            <div 
              class="size-3 border border-swiss-black dark:border-white rotate-45 shrink-0"
              :class="connectedPeersResolved.has(device.peerId || '') ? 'bg-swiss-orange' : 'bg-transparent'"
            />
            
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <p class="truncate text-sm font-black uppercase tracking-tighter text-swiss-black dark:text-white">{{ device.name }}</p>
                <span class="text-[8px] font-bold text-swiss-grey dark:text-swiss-grey-light border border-swiss-grey dark:border-swiss-grey-light px-1 leading-none uppercase">{{ getPlatformLabel(device.platform) }}</span>
              </div>
              <p class="text-[9px] font-bold uppercase tracking-widest text-swiss-grey dark:text-swiss-grey-light mt-1">{{ getStatusText(device) }}</p>
            </div>
          </div>

          <UButton
            variant="ghost"
            size="xs"
            :loading="getDeviceState(device) === 'connecting'"
            :disabled="!device.peerId"
            class="rounded-none bg-swiss-black dark:bg-white text-white dark:text-swiss-black px-4 text-[9px] font-black uppercase tracking-widest hover:bg-swiss-orange transition-all"
            @click.stop="$emit('connect', device)"
          >
            {{ getActionLabel(device) }}
          </UButton>
        </div>
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
    return 'bg-red-50 dark:bg-red-950/20'
  }
  if (getDeviceState(device) === 'connecting') {
    return 'bg-swiss-bg dark:bg-swiss-bg-dark opacity-50 animate-pulse'
  }
  if (device.peerId && connectedPeersResolved.value.has(device.peerId)) {
    return 'bg-white dark:bg-swiss-paper-dark border-l-4 border-l-swiss-orange'
  }
  if (props.selectedDevice?.id === device.id) {
    return 'bg-swiss-bg dark:bg-swiss-bg-dark'
  }
  return 'bg-white dark:bg-swiss-paper-dark hover:bg-swiss-bg dark:hover:bg-swiss-bg-dark'
}
</script>
