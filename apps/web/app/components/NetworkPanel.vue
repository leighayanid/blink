<template>
  <div class="flex h-full min-h-0 flex-col bg-swiss-bg/40 dark:bg-swiss-bg-dark/40">
    <div class="flex items-center justify-between gap-4 border-b-4 border-swiss-black dark:border-white bg-swiss-black p-5 dark:bg-white sm:p-6">
      <h2 class="text-[10px] font-black uppercase tracking-[0.3em] text-white dark:text-swiss-black">CONNECTION STATUS</h2>
      <span class="shrink-0 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-swiss-black dark:bg-swiss-black dark:text-white">[{{ connectedPeerCount }}]</span>
    </div>

    <div class="flex flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-6 xl:p-8">
      <div class="border-2 border-swiss-black bg-white p-4 dark:border-white dark:bg-swiss-paper-dark sm:p-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span class="block text-[10px] font-black uppercase tracking-[0.3em] text-swiss-grey dark:text-swiss-grey-light">YOUR PAIR CODE</span>
            <span class="mt-2 block text-4xl font-black tracking-[0.18em] text-swiss-black dark:text-white sm:text-5xl">{{ localPairCode }}</span>
          </div>

          <UButton
            variant="ghost"
            size="sm"
            class="self-start rounded-none border-2 border-swiss-black px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-swiss-black hover:bg-swiss-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-swiss-black sm:self-auto"
            @click="emit('refreshPairCode')"
          >
            NEW CODE
          </UButton>
        </div>

        <p class="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-swiss-grey dark:text-swiss-grey-light">
          Share this code before the first transfer to verify the other device.
        </p>
      </div>

      <div class="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden border-4 border-swiss-black bg-white shadow-[6px_6px_0px_0px_#000] dark:border-white dark:bg-swiss-paper-dark dark:shadow-[6px_6px_0px_0px_#fff] sm:aspect-square">
        <div class="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-[0.05] dark:opacity-[0.1]">
          <div v-for="i in 36" :key="i" class="border border-swiss-black dark:border-white" />
        </div>
        <div class="relative z-10 size-[70%] rotate-45 border-[6px] border-swiss-black dark:border-white" />
        <div class="absolute z-20 size-[35%] -rotate-45 bg-swiss-orange animate-pulse" />
        <div class="absolute bottom-4 right-4 text-[8px] font-mono uppercase tracking-[0.2em] text-swiss-grey dark:text-swiss-grey-light">Live connection</div>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between gap-4 border-b-2 border-swiss-black pb-3 dark:border-white">
          <span class="text-[11px] font-black uppercase tracking-widest text-swiss-grey dark:text-swiss-grey-light">AUTO-ACCEPT TRUSTED</span>
          <UButton
            variant="ghost"
            size="xs"
            class="rounded-none border border-swiss-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-swiss-black hover:bg-swiss-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-swiss-black"
            @click="emit('toggleAutoAccept')"
          >
            {{ autoAcceptTrustedFiles ? 'ON' : 'OFF' }}
          </UButton>
        </div>

        <div class="flex items-center justify-between gap-4 border-b-2 border-swiss-black pb-3 dark:border-white">
          <span class="text-[11px] font-black uppercase tracking-widest text-swiss-grey dark:text-swiss-grey-light">SECURITY</span>
          <span class="text-[11px] font-black uppercase tracking-widest text-swiss-orange">DIRECT ENCRYPTED</span>
        </div>

        <div class="flex items-center justify-between gap-4 border-b-2 border-swiss-black pb-3 dark:border-white">
          <span class="text-[11px] font-black uppercase tracking-widest text-swiss-grey dark:text-swiss-grey-light">TRANSFER TYPE</span>
          <span class="text-right text-[11px] font-black uppercase tracking-widest text-swiss-black dark:text-white">WEBRTC DIRECT</span>
        </div>

        <div class="flex items-center justify-between gap-4 border-b-2 border-swiss-black pb-3 dark:border-white">
          <span class="text-[11px] font-black uppercase tracking-widest text-swiss-grey dark:text-swiss-grey-light">CURRENT TARGET</span>
          <span class="max-w-[12rem] truncate text-right text-[11px] font-black uppercase tracking-widest text-swiss-orange">{{ targetPeerLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  localPairCode: string
  autoAcceptTrustedFiles: boolean
  connectedPeerCount: number
  targetPeerLabel: string
}>()

const emit = defineEmits<{
  refreshPairCode: []
  toggleAutoAccept: []
}>()
</script>
