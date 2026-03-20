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
      <div class="mx-auto flex max-w-[1400px] flex-wrap items-stretch justify-between">
        <NuxtLink to="/" class="flex min-h-16 items-center px-5 sm:px-8 border-r border-swiss-border group no-underline">
          <span class="font-black text-3xl uppercase tracking-tighter text-swiss-black group-hover:bg-swiss-black group-hover:text-white transition-all px-2">
            BLINK
          </span>
        </NuxtLink>

        <nav class="hidden min-h-16 md:flex flex-1 items-stretch">
          <a
            v-for="link in navigationLinks"
            :key="link.label"
            :href="link.href"
            class="flex items-center px-6 lg:px-10 text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] border-r border-swiss-border text-swiss-black hover:bg-swiss-black hover:text-white transition-all"
          >
            {{ link.label }}
          </a>
        </nav>

        <div class="flex min-h-16 items-stretch">
          <UButton
            to="/app"
            color="neutral"
            size="lg"
            class="rounded-none bg-swiss-orange hover:bg-swiss-black text-white px-6 sm:px-8 lg:px-12 font-bold uppercase tracking-[0.2em] transition-all"
          >
            OPEN APP
          </UButton>
        </div>
      </div>
    </header>

    <main class="relative z-10">
      <!-- Hero Section (Typography Centric) -->
      <section class="mx-auto max-w-[1400px] border-b border-swiss-border">
        <div class="grid md:grid-cols-12 gap-0">
          <div class="md:col-span-8 p-6 sm:p-8 md:p-16 md:border-r border-swiss-border">
            <h1 class="text-5xl sm:text-7xl md:text-[12rem] font-black uppercase leading-[0.8] tracking-[-0.05em] text-swiss-black">
              SEND<br/>FILES<br/>FAST
            </h1>
            <div class="mt-8 flex flex-col gap-6 sm:mt-12 sm:flex-row sm:items-start sm:gap-12">
               <div class="w-20 sm:w-24 h-4 bg-swiss-orange" />
               <p class="max-w-md text-base sm:text-xl font-medium leading-relaxed text-swiss-black/80">
                 Blink lets you send files straight to another device on the same network. No upload, no cloud, no account.
               </p>
            </div>
          </div>
          <div class="md:col-span-4 p-6 sm:p-8 md:p-16 flex flex-col justify-between gap-8 bg-swiss-paper">
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
              class="w-full rounded-none border-2 border-swiss-black bg-transparent py-5 sm:py-6 text-lg sm:text-xl font-black uppercase !text-swiss-black hover:!bg-swiss-black hover:!text-white transition-all text-center"
             >
               LAUNCH APP
             </UButton>
          </div>
        </div>
      </section>

      <!-- Highlights (Grid Layout) -->
      <section id="why-blink" class="mx-auto max-w-[1400px] border-b border-swiss-border bg-swiss-paper">
        <div class="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-swiss-border">
          <div
            v-for="highlight in highlights"
            :key="highlight.title"
            class="p-6 sm:p-8 md:p-12 hover:bg-swiss-bg transition-colors"
          >
            <span class="block text-4xl font-black text-swiss-orange mb-8 tracking-tighter">
               0{{ highlights.indexOf(highlight) + 1 }}
            </span>
            <h3 class="font-black text-2xl uppercase tracking-tighter text-swiss-black mb-4">{{ highlight.title }}</h3>
            <p class="text-sm font-medium leading-relaxed text-swiss-grey">{{ highlight.description }}</p>
          </div>
        </div>
      </section>

      <!-- How it Works -->
      <section id="how-it-works" class="mx-auto max-w-[1400px] border-b border-swiss-border">
        <div class="grid md:grid-cols-2">
          <div class="p-6 sm:p-8 md:p-16 md:border-r border-swiss-border flex flex-col justify-center">
            <h2 class="text-4xl sm:text-5xl md:text-6xl font-black uppercase leading-none tracking-tighter text-swiss-black mb-8 sm:mb-12">
               SEND IN<br/>3 STEPS.
            </h2>
            <div class="space-y-6 sm:space-y-8">
              <div v-for="(step, idx) in workflowSteps" :key="step.title" class="flex gap-8">
                <span class="text-xl font-black text-swiss-orange">/{{ idx + 1 }}</span>
                <div>
                   <h4 class="font-black uppercase text-lg text-swiss-black">{{ step.title }}</h4>
                   <p class="text-sm font-medium text-swiss-grey mt-2 max-w-sm">{{ step.description }}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-swiss-black p-8 sm:p-12 md:p-16 flex items-center justify-center relative overflow-hidden min-h-[18rem] sm:min-h-[24rem]">
             <!-- Abstract Swiss Graphic -->
             <div class="relative h-48 w-48 sm:h-64 sm:w-64 md:h-80 md:w-80">
                <div class="absolute inset-0 border-8 border-white rounded-full animate-pulse" />
                <div class="absolute inset-10 border-4 border-swiss-orange" />
                <div class="absolute inset-20 bg-white" />
                <div class="absolute top-1/2 left-0 w-full h-1 bg-white transform -rotate-45" />
             </div>
             <p class="absolute bottom-6 right-6 text-right text-white font-mono text-[9px] sm:text-[10px] tracking-widest opacity-50 uppercase">Direct device link</p>
          </div>
        </div>
      </section>

      <!-- Call to Action -->
      <section class="mx-auto max-w-[1400px] p-8 sm:p-12 md:p-16 text-center">
         <h2 class="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tighter text-swiss-black mb-8 sm:mb-12">READY TO SEND?</h2>
         <UButton
            to="/app"
            size="xl"
            class="w-full sm:w-auto rounded-none bg-swiss-black px-10 sm:px-16 md:px-24 py-6 sm:py-8 text-lg sm:text-2xl font-black uppercase text-white hover:bg-swiss-orange transition-all"
         >
           OPEN APP
         </UButton>
      </section>
    </main>

    <!-- Footer Labels -->
    <footer class="border-t border-swiss-border py-12">
      <div class="mx-auto flex max-w-[1400px] flex-col items-center gap-3 px-6 text-center text-[10px] font-black uppercase tracking-[0.4em] text-swiss-grey sm:px-8 md:flex-row md:justify-between md:text-left">
        <span>Blink / Local file sharing</span>
        <span>Est. 2026</span>
        <span>No Cloud. No upload.</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const navigationLinks = [
  { label: 'Why Blink', href: '#why-blink' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Open App', href: '/app' }
] as const

const heroStats = [
  { value: 'DIRECT', label: 'Device to device' },
  { value: 'LOCAL', label: 'Same network' },
  { value: 'PRIVATE', label: 'No cloud upload' }
] as const

const highlights = [
  {
    title: 'Easy To Verify',
    description: 'Use the 6-digit code to make sure you are connecting to the right device.'
  },
  {
    title: 'Direct Transfer',
    description: 'Files move between devices on your local network instead of being uploaded first.'
  },
  {
    title: 'Clear Progress',
    description: 'See when a transfer starts, how fast it is moving, and when it is done.'
  }
] as const

const workflowSteps = [
  {
    title: 'Find A Device',
    description: 'Open Blink on both devices and make sure they are on the same network.'
  },
  {
    title: 'Verify It',
    description: 'Check the 6-digit code before the first transfer so you know it is the right device.'
  },
  {
    title: 'Send Files',
    description: 'Choose files, send them directly, and watch progress until the transfer finishes.'
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
