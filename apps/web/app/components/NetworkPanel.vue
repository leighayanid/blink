<template>
  <div class="flex h-full min-h-0 flex-col bg-app-bg dark:bg-app-bg-dark">
    <div class="flex items-center justify-between gap-4 border-b border-app-border bg-app-surface p-5 dark:border-app-border-dark dark:bg-app-surface-dark sm:p-6">
      <div>
        <h2 class="text-base font-semibold text-app-text dark:text-app-text-dark">Connection status</h2>
        <p class="mt-1 text-sm text-app-muted dark:text-app-muted-dark">{{ connectedPeerCount }} connected</p>
      </div>
      <span class="flex size-9 items-center justify-center rounded-full bg-app-primary-soft text-app-primary dark:bg-app-primary-soft-dark dark:text-blue-200">
        <UIcon name="i-lucide-radio" class="size-4" />
      </span>
    </div>

    <div class="flex flex-1 flex-col gap-4 overflow-y-auto p-4 sm:p-5 xl:p-6">
      <section class="rounded-app border border-app-border bg-app-surface p-4 dark:border-app-border-dark dark:bg-app-surface-dark">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <span class="block text-sm font-medium text-app-text dark:text-app-text-dark">Pair code</span>
            <p class="mt-1 text-xs leading-5 text-app-muted dark:text-app-muted-dark">
              Verify the first connection with this code.
            </p>
          </div>
          <UButton
            variant="outline"
            size="xs"
            icon="i-lucide-refresh-cw"
            class="shrink-0 rounded-md border-app-border px-2.5 py-1.5 text-xs font-medium text-app-text hover:bg-app-surface-muted dark:border-app-border-dark dark:text-app-text-dark dark:hover:bg-app-surface-muted-dark"
            @click="emit('refreshPairCode')"
          >
            New
          </UButton>
        </div>

        <div class="mt-4 grid grid-cols-6 gap-1.5" aria-label="Your pair code">
          <span
            v-for="(digit, index) in pairCodeDigits"
            :key="`${digit}-${index}`"
            class="flex aspect-square min-w-0 items-center justify-center rounded-md border border-app-border bg-app-bg font-mono text-xl font-semibold text-app-text dark:border-app-border-dark dark:bg-app-bg-dark dark:text-app-text-dark"
          >
            {{ digit }}
          </span>
        </div>
      </section>

      <section class="rounded-app border border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark">
        <div class="flex items-start justify-between gap-3 border-b border-app-border px-4 py-3.5 dark:border-app-border-dark">
          <div class="flex min-w-0 items-center gap-3">
            <span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-app-surface-muted text-app-muted dark:bg-app-surface-muted-dark dark:text-app-muted-dark">
              <UIcon :name="autoAcceptTrustedFiles ? 'i-lucide-toggle-right' : 'i-lucide-toggle-left'" class="size-4" />
            </span>
            <div class="min-w-0">
              <span class="block text-sm font-medium text-app-text dark:text-app-text-dark">Auto-accept</span>
              <span class="block text-xs leading-5 text-app-muted dark:text-app-muted-dark">Trusted devices only</span>
            </div>
          </div>
          <UButton
            color="neutral"
            variant="outline"
            size="xs"
            class="shrink-0 rounded-full border-app-border px-3 py-1.5 text-xs font-medium text-app-text hover:bg-app-surface-muted dark:border-app-border-dark dark:text-app-text-dark dark:hover:bg-app-surface-muted-dark"
            @click="emit('toggleAutoAccept')"
          >
            {{ autoAcceptTrustedFiles ? 'On' : 'Off' }}
          </UButton>
        </div>

        <div
          v-for="item in statusItems"
          :key="item.label"
          class="flex items-start gap-3 border-b border-app-border px-4 py-3.5 last:border-b-0 dark:border-app-border-dark"
        >
          <span class="flex size-8 shrink-0 items-center justify-center rounded-md bg-app-surface-muted text-app-muted dark:bg-app-surface-muted-dark dark:text-app-muted-dark">
            <UIcon :name="item.icon" class="size-4" />
          </span>
          <div class="min-w-0 flex-1">
            <span class="block text-sm font-medium text-app-text dark:text-app-text-dark">{{ item.label }}</span>
            <span class="mt-0.5 block min-w-0 break-words text-sm leading-5" :class="item.valueClass">
              {{ item.value }}
            </span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  localPairCode: string
  autoAcceptTrustedFiles: boolean
  connectedPeerCount: number
  targetPeerLabel: string
}>()

const emit = defineEmits<{
  refreshPairCode: []
  toggleAutoAccept: []
}>()

const pairCodeDigits = computed(() => props.localPairCode.padEnd(6, '0').slice(0, 6).split(''))

const statusItems = computed(() => [
  {
    label: 'Security',
    value: 'Direct encrypted',
    valueClass: 'text-app-success',
    icon: 'i-lucide-lock',
  },
  {
    label: 'Transfer type',
    value: 'WebRTC direct',
    valueClass: 'text-app-text dark:text-app-text-dark',
    icon: 'i-lucide-waypoints',
  },
  {
    label: 'Current target',
    value: props.targetPeerLabel,
    valueClass: props.targetPeerLabel === 'No device selected' ? 'text-app-muted dark:text-app-muted-dark' : 'text-app-primary',
    icon: 'i-lucide-send',
  },
])
</script>
