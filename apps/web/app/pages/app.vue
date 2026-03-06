<template>
  <div class="relative flex h-screen flex-col overflow-hidden bg-light-primary text-light-primary dark:bg-dark-primary dark:text-dark-primary">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute inset-x-0 top-0 h-[26rem] bg-[radial-gradient(circle_at_top,rgba(255,149,0,0.24),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,149,0,0.18),transparent_60%)]" />
      <div class="absolute left-[-10rem] top-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.18),transparent_68%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(255,140,66,0.14),transparent_68%)]" />
      <div class="absolute bottom-[-7rem] right-[-6rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,149,0,0.18),transparent_70%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(255,149,0,0.14),transparent_70%)]" />
      <div class="app-grid absolute inset-0 opacity-45 dark:opacity-25" />
    </div>

    <main class="relative z-10 flex min-h-0 flex-1 flex-col p-3 md:p-4">
      <div class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] border border-black/5 bg-white/70 shadow-[0_24px_90px_rgba(15,23,42,0.10)] backdrop-blur-xl dark:border-white/10 dark:bg-white/6">
        <div class="hidden items-center justify-between border-b border-black/5 px-6 py-4 md:flex dark:border-white/10">
          <div class="flex items-center gap-4">
            <div>
              <p class="font-orbitron text-lg font-black uppercase tracking-[0.32em] text-neutral-950 dark:text-white">Blink</p>
              <p class="text-sm text-neutral-500 dark:text-neutral-400">Direct local file transfer with trusted device pairing.</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="rounded-full border border-black/5 bg-white/80 px-4 py-2 text-sm text-neutral-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
              <span class="font-semibold text-neutral-950 dark:text-white">{{ connectedPeers.size }}</span>
              active connection{{ connectedPeers.size === 1 ? '' : 's' }}
            </div>
            <div class="rounded-full border border-black/5 bg-white/80 px-4 py-2 text-sm text-neutral-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
              <span class="font-semibold text-neutral-950 dark:text-white">{{ transfers.length }}</span>
              transfer{{ transfers.length === 1 ? '' : 's' }} tracked
            </div>
          </div>
        </div>

        <div class="flex min-h-0 flex-1 gap-3 p-3 md:p-4">
          <div
            class="flex w-full flex-col overflow-y-auto rounded-[1.75rem] border border-black/5 bg-white/82 shadow-[0_18px_60px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-black/12 md:w-80 md:shrink-0"
            :class="{ 'hidden md:flex': activeMobileTab !== 'discover' }"
          >
            <div class="relative border-b border-black/5 px-5 py-5 dark:border-white/10">
              <ClientOnly>
                <UButton
                  :icon="isDark ? 'i-lucide-sun-medium' : 'i-lucide-moon-star'"
                  color="neutral"
                  variant="outline"
                  size="xs"
                  class="absolute right-4 top-4 rounded-full"
                  @click="toggleTheme"
                />
                <template #fallback>
                  <div class="absolute right-4 top-4 size-7 rounded-full border border-neutral-200 dark:border-neutral-700" />
                </template>
              </ClientOnly>

              <div class="flex items-start gap-3 pr-12">
                <div>
                  <h1 class="font-orbitron text-2xl font-black uppercase tracking-[0.28em] text-neutral-950 dark:text-white">Blink</h1>
                  <p class="mt-1 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    Trusted local sharing across your devices.
                  </p>
                </div>
              </div>

              <div class="mt-4 flex items-center gap-2">
                <UBadge color="success" variant="soft" class="rounded-full px-3 py-1 text-[11px] font-medium tracking-[0.22em]">
                  <span class="mr-1.5 inline-block size-1.5 rounded-full bg-green-500" />
                  SESSION ONLINE
                </UBadge>
              </div>
            </div>

            <div class="px-5 py-4">
              <div class="rounded-[1.5rem] border border-primary-200/70 bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 dark:border-primary-500/20 dark:from-primary-500/10 dark:via-white/5 dark:to-white/0">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700 dark:text-primary-300">Local Device</p>
                    <div v-if="localDevice" class="mt-2">
                      <p class="text-base font-semibold text-neutral-950 dark:text-white">{{ localDevice.name }}</p>
                      <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ localDevice.platform }}</p>
                    </div>
                  </div>
                  <UBadge
                    :color="isConnected ? 'success' : 'neutral'"
                    variant="soft"
                    class="rounded-full px-3 py-1 text-[11px] font-medium tracking-[0.2em]"
                  >
                    {{ isConnected ? 'LIVE' : 'OFFLINE' }}
                  </UBadge>
                </div>

                <div v-if="localDevice" class="mt-4 flex items-center gap-2">
                  <span class="inline-flex rounded-full border border-black/5 bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-neutral-600 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300">
                    {{ getPlatformLabel(localDevice.platform) }}
                  </span>
                  <span class="text-xs text-neutral-500 dark:text-neutral-400">Ready for nearby discovery</span>
                </div>
              </div>
            </div>

            <div class="flex flex-1 flex-col px-5 pb-5 min-h-0">
              <div class="mb-3 flex items-center justify-between">
                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500 dark:text-neutral-400">Discovered Devices</p>
                <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1 text-[11px] font-medium">
                  {{ devices.length }}
                </UBadge>
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

          <div
            class="flex min-w-0 flex-1 flex-col overflow-y-auto rounded-[1.75rem] border border-black/5 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-black/12"
            :class="{ 'hidden md:flex': activeMobileTab !== 'transfer' }"
          >
            <div class="border-b border-black/5 px-5 py-5 dark:border-white/10 sm:px-6">
              <div class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div class="max-w-2xl">
                  <p class="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700 dark:text-primary-300">Transfer Workspace</p>
                  <h2 class="mt-2 text-2xl font-semibold text-neutral-950 dark:text-white">Send files with a clearer handoff flow.</h2>
                  <p class="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                    Select a trusted device, drop files, and monitor transfer state without leaving the workspace.
                  </p>
                </div>

                <div class="grid gap-3 sm:grid-cols-3 lg:min-w-[24rem] lg:max-w-[30rem] lg:flex-1">
                  <div class="rounded-[1.25rem] border border-black/5 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">Target</p>
                    <p class="mt-1 truncate text-sm font-semibold text-neutral-950 dark:text-white">{{ targetPeerForSend ? getDeviceNameByPeerId(targetPeerForSend) : 'No device selected' }}</p>
                  </div>
                  <div class="rounded-[1.25rem] border border-black/5 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">Trusted</p>
                    <p class="mt-1 text-sm font-semibold text-neutral-950 dark:text-white">{{ trustedPeerIds.length }} device{{ trustedPeerIds.length === 1 ? '' : 's' }}</p>
                  </div>
                  <div class="rounded-[1.25rem] border border-black/5 bg-white/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                    <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">Queue</p>
                    <p class="mt-1 text-sm font-semibold text-neutral-950 dark:text-white">{{ transfers.length }} item{{ transfers.length === 1 ? '' : 's' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="border-b border-black/5 px-5 py-5 dark:border-white/10 sm:px-6">
              <div class="mb-3 flex items-center justify-between">
                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500 dark:text-neutral-400">Transfer Files</p>
                <div class="rounded-full border border-black/5 bg-white/80 px-3 py-1 text-[11px] text-neutral-500 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
                  {{ connectedPeers.size === 0 ? 'Connect a device to begin' : connectedPeers.size + ' destination' + (connectedPeers.size === 1 ? '' : 's') + ' available' }}
                </div>
              </div>
              <FileUploader
                :disabled="connectedPeers.size === 0"
                :connected-count="connectedPeers.size"
                @files-selected="handleFilesSelected"
              />
            </div>

            <div class="flex min-h-0 flex-1 flex-col px-5 py-5 sm:px-6">
              <div class="mb-3 flex items-center justify-between">
                <p class="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500 dark:text-neutral-400">Transfer Queue</p>
                <UBadge v-if="transfers.length > 0" color="neutral" variant="soft" class="rounded-full px-3 py-1 text-[11px] font-medium">
                  {{ transfers.length }}
                </UBadge>
              </div>
              <TransferProgress :embedded="true" class="flex-1 min-h-0" />
            </div>
          </div>

          <div
            class="flex w-full flex-col overflow-y-auto rounded-[1.75rem] border border-black/5 bg-white/82 shadow-[0_18px_60px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-black/12 md:w-80 md:shrink-0"
            :class="{ 'hidden md:flex': activeMobileTab !== 'network' }"
          >
            <div class="flex flex-1 flex-col px-5 py-5 min-h-0">
              <div class="mb-4 flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700 dark:text-primary-300">Network Trust</p>
                  <h3 class="mt-1 text-xl font-semibold text-neutral-950 dark:text-white">Active connections</h3>
                </div>
                <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1 text-[11px] font-medium">
                  {{ connectedPeers.size }}
                </UBadge>
              </div>

              <div class="mb-4 rounded-[1.5rem] border border-primary-200/70 bg-gradient-to-br from-primary-50 via-white to-secondary-50 p-4 dark:border-primary-500/20 dark:from-primary-500/10 dark:via-white/5 dark:to-white/0">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700 dark:text-primary-300">Pairing code</p>
                    <p class="mt-2 font-orbitron text-2xl font-black tracking-[0.28em] text-neutral-950 dark:text-white">{{ localPairCode }}</p>
                  </div>
                  <UButton
                    size="xs"
                    color="neutral"
                    variant="outline"
                    class="rounded-full border-primary-200 bg-white/70 px-3 text-[11px] font-semibold tracking-[0.22em] text-primary-700 dark:border-primary-500/30 dark:bg-white/5 dark:text-primary-300"
                    @click="regeneratePairCode"
                  >
                    Refresh
                  </UButton>
                </div>
                <p class="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  Share this code to approve a new device before the first transfer.
                </p>
                <div class="mt-4 flex items-center justify-between gap-3 rounded-[1rem] border border-black/5 bg-white/70 px-3 py-3 dark:border-white/10 dark:bg-white/5">
                  <div>
                    <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500 dark:text-neutral-400">Trusted auto-accept</p>
                    <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Skip prompts for verified devices.</p>
                  </div>
                  <UButton
                    size="xs"
                    color="neutral"
                    :variant="autoAcceptTrustedFiles ? 'solid' : 'outline'"
                    class="rounded-full px-3 text-[11px] font-semibold tracking-[0.2em]"
                    :class="autoAcceptTrustedFiles
                      ? 'border-0 bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:text-neutral-950 dark:hover:bg-primary-400'
                      : 'border-primary-200 bg-white/70 text-primary-700 dark:border-primary-500/30 dark:bg-white/5 dark:text-primary-300'"
                    @click="autoAcceptTrustedFiles = !autoAcceptTrustedFiles"
                  >
                    {{ autoAcceptTrustedFiles ? 'ON' : 'OFF' }}
                  </UButton>
                </div>
              </div>

              <div
                v-if="connectedPeers.size === 0 && !hasConnectingDevices"
                class="flex h-52 flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-primary-200/80 bg-primary-50/40 text-center dark:border-primary-500/20 dark:bg-white/3"
              >
                <UIcon name="i-lucide-wifi-off" class="mb-3 size-8 text-primary-300 dark:text-primary-400/70" />
                <p class="text-sm font-semibold uppercase tracking-[0.24em] text-neutral-600 dark:text-neutral-300">No active connections</p>
                <p class="mt-2 max-w-[14rem] text-sm text-neutral-500 dark:text-neutral-400">Connect to a nearby device to open a direct transfer session.</p>
              </div>

              <div v-else class="flex flex-col gap-3">
                <div
                  v-for="device in connectingDevices"
                  :key="'connecting-' + device.id"
                  class="flex items-center justify-between rounded-[1.25rem] border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-800/40 dark:bg-sky-950/20"
                >
                  <div class="flex min-w-0 items-center gap-3">
                    <UBadge color="neutral" variant="outline" class="rounded-full text-[11px] font-semibold tracking-[0.2em]">
                      {{ getPlatformLabel(device.platform) }}
                    </UBadge>
                    <div class="min-w-0">
                      <p class="truncate text-sm font-semibold text-neutral-900 dark:text-white">{{ device.name }}</p>
                      <p class="text-xs text-sky-700 dark:text-sky-300">Establishing secure channel…</p>
                    </div>
                  </div>
                  <span class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">Connecting</span>
                </div>

                <div
                  v-for="device in devices.filter(d => connectedPeers.has(d.peerId!))"
                  :key="device.id"
                  class="rounded-[1.5rem] border p-4 transition-colors"
                  :class="targetPeerForSend === device.peerId
                    ? 'border-primary-300 bg-primary-50/80 dark:border-primary-500/30 dark:bg-primary-500/10'
                    : 'border-black/5 bg-white/80 dark:border-white/10 dark:bg-white/5'"
                >
                  <div class="mb-3 flex items-center gap-3">
                    <UBadge
                      color="neutral"
                      variant="outline"
                      class="rounded-full text-[11px] font-semibold tracking-[0.2em]"
                    >
                      {{ getPlatformLabel(device.platform) }}
                    </UBadge>
                    <div class="min-w-0 flex-1">
                      <p class="truncate text-sm font-semibold text-neutral-950 dark:text-white">{{ device.name }}</p>
                      <p class="text-xs text-neutral-500 dark:text-neutral-400">
                        {{ isTrustedPeer(device.peerId) ? 'Trusted device ready for faster approvals' : 'Connected and awaiting trust approval' }}
                      </p>
                    </div>
                  </div>

                  <div class="mb-3 flex flex-wrap items-center gap-2">
                    <UBadge
                      :color="isTrustedPeer(device.peerId) ? 'success' : 'neutral'"
                      variant="soft"
                      class="rounded-full px-3 py-1 text-[11px] font-medium tracking-[0.2em]"
                    >
                      {{ isTrustedPeer(device.peerId) ? 'TRUSTED' : 'UNTRUSTED' }}
                    </UBadge>
                    <span
                      v-if="targetPeerForSend === device.peerId"
                      class="rounded-full border border-primary-200 bg-white/70 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] text-primary-700 dark:border-primary-500/30 dark:bg-white/5 dark:text-primary-300"
                    >
                      SEND TARGET
                    </span>
                  </div>

                  <div v-if="device.peerId && !isTrustedPeer(device.peerId)" class="mb-3 flex gap-2">
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
                      color="neutral"
                      variant="solid"
                      class="rounded-full border-0 bg-primary-600 px-4 text-xs font-semibold tracking-[0.2em] text-white hover:bg-primary-700 dark:bg-primary-500 dark:text-neutral-950 dark:hover:bg-primary-400"
                      :loading="isPairingPeer(device.peerId)"
                      @click="pairWithPeer(device.peerId)"
                    >
                      Pair
                    </UButton>
                  </div>

                  <div class="flex flex-wrap gap-2">
                    <UButton
                      v-if="connectedPeers.size > 1"
                      size="xs"
                      color="neutral"
                      variant="outline"
                      class="rounded-full px-3 text-[11px] font-semibold tracking-[0.2em]"
                      :class="targetPeerForSend === device.peerId
                        ? 'border-primary-200 bg-white/70 text-primary-700 dark:border-primary-500/30 dark:bg-white/5 dark:text-primary-300'
                        : ''"
                      @click="targetPeerForSend = device.peerId ?? null"
                    >
                      {{ targetPeerForSend === device.peerId ? 'SELECTED' : 'SELECT' }}
                    </UButton>
                    <UButton
                      v-if="device.peerId && isTrustedPeer(device.peerId)"
                      size="xs"
                      color="warning"
                      variant="outline"
                      class="rounded-full px-3 text-[11px] font-semibold tracking-[0.2em]"
                      @click="untrustPeer(device.peerId)"
                    >
                      Untrust
                    </UButton>
                    <UButton
                      size="xs"
                      color="neutral"
                      variant="outline"
                      class="rounded-full px-3 text-[11px] font-semibold tracking-[0.2em]"
                      @click="handleDeviceDisconnect(device)"
                    >
                      Disconnect
                    </UButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <nav class="md:hidden relative z-10 flex shrink-0 border-t border-primary-200/50 bg-[rgba(255,248,231,0.92)] px-2 py-2 backdrop-blur-xl dark:border-primary-500/15 dark:bg-[rgba(22,22,42,0.92)] pb-safe">
      <button
        v-for="tab in mobileTabs"
        :key="tab.value"
        class="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-3 text-[11px] font-semibold uppercase tracking-[0.22em] transition-colors"
        :class="activeMobileTab === tab.value
          ? 'bg-white/80 text-primary-700 shadow-[0_12px_28px_rgba(255,149,0,0.12)] dark:bg-primary-500/14 dark:text-primary-300'
          : 'text-neutral-600 dark:text-neutral-400'"
        @click="activeMobileTab = tab.value as typeof activeMobileTab"
      >
        <UIcon :name="tab.icon" class="size-5" />
        <span>{{ tab.label }}</span>
        <span
          v-if="tab.value === 'network' && connectedPeers.size > 0"
          class="absolute right-[18%] top-2 flex size-4 items-center justify-center rounded-full bg-primary-600 text-[9px] font-semibold text-white dark:bg-primary-500 dark:text-neutral-950"
        >{{ connectedPeers.size }}</span>
      </button>
    </nav>

    <UModal :open="isIncomingFileModalOpen" :close="false" :prevent-close="true">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="flex size-9 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
            <UIcon name="i-lucide-download" class="size-5" />
          </div>
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-primary-700 dark:text-primary-300">Incoming transfer</p>
            <h3 class="text-sm font-semibold text-neutral-950 dark:text-white">Approve file receipt</h3>
          </div>
        </div>
      </template>

      <div v-if="currentIncomingFile" class="space-y-4">
        <p class="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
          <span class="font-semibold text-neutral-950 dark:text-white">{{ currentIncomingFile.peerId }}</span>
          wants to send a file to this device.
        </p>
        <div class="rounded-[1.25rem] border border-primary-200/80 bg-primary-50/70 p-4 dark:border-primary-500/20 dark:bg-primary-500/10">
          <p class="break-all text-base font-semibold text-neutral-950 dark:text-white">{{ currentIncomingFile.metadata.name }}</p>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{{ formatBytes(currentIncomingFile.metadata.size) }}</p>
        </div>
        <p class="text-xs leading-5 text-neutral-500 dark:text-neutral-400">
          Accept to start receiving immediately. Decline to cancel this transfer request.
        </p>
        <p v-if="incomingFileQueue.length > 1" class="text-xs text-neutral-500 dark:text-neutral-400">
          {{ incomingFileQueue.length - 1 }} more file request(s) waiting.
        </p>
      </div>

      <template #footer>
        <div class="flex w-full justify-end gap-2">
          <UButton color="neutral" variant="outline" class="rounded-full px-4" @click="declineIncomingFile">
            Decline
          </UButton>
          <UButton color="success" class="rounded-full px-4" @click="acceptIncomingFile">
            Accept
          </UButton>
        </div>
      </template>
    </UModal>

    <footer class="relative z-10 hidden shrink-0 items-center justify-center border-t border-black/5 py-2.5 text-xs text-neutral-500 dark:border-white/10 dark:text-neutral-400 md:flex">
      CREATED BY
      <a
        href="https://leighdinaya.dev"
        target="_blank"
        rel="noopener"
        class="ml-1 font-semibold text-neutral-800 hover:underline dark:text-neutral-200"
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

<style scoped>
.app-grid {
  background-image:
    linear-gradient(to right, rgb(15 23 42 / 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(15 23 42 / 0.05) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(circle at top, black 24%, rgb(0 0 0 / 0.8) 55%, transparent 100%);
}

.dark .app-grid {
  background-image:
    linear-gradient(to right, rgb(255 255 255 / 0.06) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(255 255 255 / 0.06) 1px, transparent 1px);
}
</style>
