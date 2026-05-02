<template>
  <div class="flex flex-col">
    <div
      v-if="devices.length === 0"
      class="flex flex-col items-center justify-center rounded-app border border-dashed border-app-border bg-app-surface px-6 py-12 text-center dark:border-app-border-dark dark:bg-app-surface-dark"
    >
      <UIcon name="i-lucide-wifi" class="mb-4 size-9 text-app-muted dark:text-app-muted-dark" />
      <p class="text-sm font-semibold text-app-text dark:text-app-text-dark">No devices found</p>
      <p class="mt-2 max-w-[17rem] text-sm leading-6 text-app-muted dark:text-app-muted-dark">
        Open Blink on another device and keep both devices on the same network.
      </p>
    </div>

    <div v-else class="flex flex-col gap-2">
      <div
        v-for="device in devices"
        :key="device.id"
        class="group relative cursor-pointer rounded-app border p-3 transition-colors duration-200"
        :class="getCardClass(device)"
        @click="$emit('select', device)"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 items-start gap-3 sm:items-center">
            <div class="relative shrink-0">
              <div class="flex size-9 items-center justify-center rounded-md bg-app-surface-muted text-app-muted dark:bg-app-surface-muted-dark dark:text-app-muted-dark">
                <UIcon :name="getPlatformIcon(device.platform)" class="size-4" />
              </div>
              <span
                class="absolute -right-0.5 -top-0.5 size-2.5 rounded-full ring-2 ring-app-surface dark:ring-app-surface-dark"
                :class="getStatusDotClass(device)"
              />
            </div>

            <div class="min-w-0">
              <div class="flex min-w-0 flex-wrap items-center gap-2">
                <p class="truncate text-sm font-medium text-app-text dark:text-app-text-dark">{{ device.name }}</p>
                <span class="rounded-full border border-app-border px-2 py-0.5 text-xs text-app-muted dark:border-app-border-dark dark:text-app-muted-dark">
                  {{ getPlatformLabel(device.platform) }}
                </span>
              </div>
              <p class="mt-1 text-xs text-app-muted dark:text-app-muted-dark">{{ getStatusText(device) }}</p>
            </div>
          </div>

          <UButton
            variant="solid"
            size="xs"
            :loading="getDeviceState(device) === 'connecting'"
            :disabled="!device.peerId"
            class="w-full shrink-0 rounded-md bg-app-primary px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
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
import { getPlatformIcon, getPlatformLabel } from '../utils/platform'

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
  if (state === 'error') return 'Could not connect'
  if (device.peerId && connectedPeersResolved.value.has(device.peerId)) return 'Ready to receive files'
  return 'Available nearby'
}

const getActionLabel = (device: Device): string => {
  const state = getDeviceState(device)
  if (state === 'connecting') return 'Connecting'
  if (device.peerId && connectedPeersResolved.value.has(device.peerId)) return 'Send here'
  return 'Connect'
}

const getStatusDotClass = (device: Device): string => {
  const state = getDeviceState(device)
  if (state === 'error') return 'bg-app-error'
  if (state === 'connecting') return 'bg-app-warning'
  if (device.peerId && connectedPeersResolved.value.has(device.peerId)) return 'bg-app-success'
  return 'bg-app-muted dark:bg-app-muted-dark'
}

const getCardClass = (device: Device): string => {
  if (getDeviceState(device) === 'error') {
    return 'border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20'
  }
  if (getDeviceState(device) === 'connecting') {
    return 'border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20'
  }
  if (device.peerId && connectedPeersResolved.value.has(device.peerId)) {
    return 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-950/20'
  }
  if (props.selectedDevice?.id === device.id) {
    return 'border-app-primary bg-app-primary-soft dark:bg-app-primary-soft-dark'
  }
  return 'border-app-border bg-app-surface hover:bg-app-surface-muted dark:border-app-border-dark dark:bg-app-surface-dark dark:hover:bg-app-surface-muted-dark'
}
</script>
