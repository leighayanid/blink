<template>
  <div class="relative min-h-screen bg-swiss-bg font-swiss selection:bg-swiss-black selection:text-white overflow-x-hidden">
    <!-- Swiss Grid System (Overlay) -->
    <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden">
       <div class="grid grid-cols-4 md:grid-cols-12 gap-0 h-full w-full opacity-[0.03]">
         <div v-for="i in 12" :key="i" class="border-r border-swiss-black h-full" />
       </div>
    </div>

    <!-- Header / Navigation (Strict Grid) -->
    <header class="relative z-10 border-b border-swiss-border">
      <div class="mx-auto flex max-w-[1400px] items-stretch justify-between h-20">
        <NuxtLink to="/" class="flex items-center px-8 border-r border-swiss-border group no-underline">
          <span class="font-black text-3xl uppercase tracking-tighter text-swiss-black group-hover:bg-swiss-black group-hover:text-white transition-all px-2">
            BLINK
          </span>
        </NuxtLink>

        <nav class="hidden md:flex flex-1 items-stretch">
          <a
            v-for="link in navigationLinks"
            :key="link.label"
            :href="link.href"
            class="flex items-center px-10 text-xs font-bold uppercase tracking-[0.2em] border-r border-swiss-border text-swiss-black hover:bg-swiss-black hover:text-white transition-all"
          >
            {{ link.label }}
          </a>
        </nav>

        <div class="flex items-stretch">
          <UButton
            to="/app"
            color="neutral"
            size="lg"
            class="rounded-none bg-swiss-orange hover:bg-swiss-black text-white px-12 font-bold uppercase tracking-[0.2em] transition-all"
          >
            ENTER
          </UButton>
        </div>
      </div>
    </header>

    <main class="relative z-10">
      <!-- Hero Section (Typography Centric) -->
      <section class="mx-auto max-w-[1400px] border-b border-swiss-border">
        <div class="grid md:grid-cols-12 gap-0">
          <div class="md:col-span-8 p-8 md:p-16 md:border-r border-swiss-border">
            <h1 class="text-7xl md:text-[12rem] font-black uppercase leading-[0.8] tracking-[-0.05em] text-swiss-black">
              FAST<br/>DIRECT<br/>FILE
            </h1>
            <div class="mt-12 flex items-start gap-12">
               <div class="w-24 h-4 bg-swiss-orange" />
               <p class="max-w-md text-xl font-medium leading-relaxed text-swiss-black/80">
                 Blink is a peer-to-peer file transfer utility built on objective clarity and the speed of your local network.
               </p>
            </div>
          </div>
          <div class="md:col-span-4 p-8 md:p-16 flex flex-col justify-between bg-swiss-paper">
             <div>
               <p class="text-[10px] font-black uppercase tracking-[0.4em] text-swiss-grey mb-8">STATUS_v1.0.4</p>
               <div class="space-y-4">
                 <div v-for="stat in heroStats" :key="stat.value" class="border-b border-swiss-border pb-4">
                    <span class="block text-2xl font-black">{{ stat.value }}</span>
                    <span class="block text-[10px] uppercase font-bold text-swiss-grey mt-1">{{ stat.label }}</span>
                 </div>
               </div>
             </div>
             
             <UButton
              to="/app"
              color="neutral"
              variant="outline"
              class="rounded-none border-2 border-swiss-black bg-transparent py-6 text-xl font-black uppercase !text-swiss-black hover:!bg-swiss-black hover:!text-white transition-all text-center"
             >
               LAUNCH APP
             </UButton>
          </div>
        </div>
      </section>

      <!-- Highlights (Grid Layout) -->
      <section class="mx-auto max-w-[1400px] border-b border-swiss-border bg-swiss-paper">
        <div class="grid md:grid-cols-3 divide-x divide-swiss-border">
          <div
            v-for="highlight in highlights"
            :key="highlight.title"
            class="p-12 hover:bg-swiss-bg transition-colors"
          >
            <span class="block text-4xl font-black text-swiss-orange mb-8 tracking-tighter">
               0{{ highlights.indexOf(highlight) + 1 }}
            </span>
            <h3 class="font-black text-2xl uppercase tracking-tighter text-swiss-black mb-4">{{ highlight.title }}</h3>
            <p class="text-sm font-medium leading-relaxed text-swiss-grey">{{ highlight.description }}</p>
          </div>
        </div>
      </section>

      <!-- How it Works (Abstract & Clear) -->
      <section id="how-it-works" class="mx-auto max-w-[1400px] border-b border-swiss-border">
        <div class="grid md:grid-cols-2">
          <div class="p-16 md:border-r border-swiss-border flex flex-col justify-center">
            <h2 class="text-6xl font-black uppercase leading-none tracking-tighter text-swiss-black mb-12">
               HOW THE LINK<br/>IS FORMED.
            </h2>
            <div class="space-y-8">
              <div v-for="(step, idx) in workflowSteps" :key="step.title" class="flex gap-8">
                <span class="text-xl font-black text-swiss-orange">/{{ idx + 1 }}</span>
                <div>
                   <h4 class="font-black uppercase text-lg text-swiss-black">{{ step.title }}</h4>
                   <p class="text-sm font-medium text-swiss-grey mt-2 max-w-sm">{{ step.description }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-swiss-black p-16 flex items-center justify-center relative overflow-hidden">
             <!-- Abstract Swiss Graphic -->
             <div class="relative w-80 h-80">
                <div class="absolute inset-0 border-8 border-white rounded-full animate-pulse" />
                <div class="absolute inset-10 border-4 border-swiss-orange" />
                <div class="absolute inset-20 bg-white" />
                <div class="absolute top-1/2 left-0 w-full h-1 bg-white transform -rotate-45" />
             </div>
             <p class="absolute bottom-8 right-8 text-white font-mono text-[10px] tracking-widest opacity-50 uppercase">Visualizing_Link_Tunnel</p>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="mx-auto max-w-[1400px] p-16 text-center">
         <h2 class="text-8xl font-black uppercase tracking-tighter text-swiss-black mb-12">READY?</h2>
         <UButton
            to="/app"
            size="xl"
            class="rounded-none bg-swiss-black px-24 py-8 text-2xl font-black uppercase text-white hover:bg-swiss-orange transition-all"
         >
           START TRANSFER
         </UButton>
      </section>
    </main>

    <!-- Footer Labels -->
    <footer class="border-t border-swiss-border py-12">
      <div class="mx-auto max-w-[1400px] px-8 flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-swiss-grey">
        <span>Blink / Local Mesh Network</span>
        <span>Est. 2026</span>
        <span>No Cloud. No upload.</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()

const navigationLinks = [
  { label: 'Principles', href: '#features' },
  { label: 'Process', href: '#how-it-works' },
  { label: 'Launch', href: '/app' }
] as const

const heroStats = [
  { value: 'P2P', label: 'Peer to Peer' },
  { value: 'MESH', label: 'Local Discovery' },
  { value: 'NULL', label: 'Zero Cloud Storage' }
] as const

const highlights = [
  {
    title: 'Manual Auth',
    description: 'Manual 6-digit authentication ensures every peer connection is verified by the operator.'
  },
  {
    title: 'Mesh Utility',
    description: 'Establish high-speed data lanes using your local hardware directly. No external dependencies.'
  },
  {
    title: 'Telemetry',
    description: 'Strict visual feedback for every packet. Every transfer has an objective beginning and end.'
  }
] as const

const features = [
  {
    icon: 'i-lucide-zap',
    title: 'Instant',
    description: 'Built for speed across local subnets.'
  },
  {
    icon: 'i-lucide-lock-keyhole',
    title: 'Private',
    description: 'Zero external servers. Zero tracking.'
  },
  {
    icon: 'i-lucide-monitor-smartphone',
    title: 'Mesh',
    description: 'Cross-platform device discovery.'
  }
] as const

const workflowSteps = [
  {
    title: 'Discovery',
    description: 'The grid scans for available localized nodes on your subnet.'
  },
  {
    title: 'Authentication',
    description: 'Manual validation via 6-digit security sequence.'
  },
  {
    title: 'Transfer',
    description: 'Objective binary movement via WebRTC p2p tunnel.'
  }
] as const
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.05); }
}

.animate-pulse {
  animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
