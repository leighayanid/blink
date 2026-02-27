<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-sm">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 class="text-2xl font-black tracking-tight">BLINK</h1>
        <nav class="flex items-center gap-3">
          <ClientOnly>
            <UButton
              :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
              color="neutral"
              variant="outline"
              size="sm"
              @click="toggleTheme"
            />
            <template #fallback>
              <div class="size-8" />
            </template>
          </ClientOnly>
          <UButton
            to="/app"
            color="neutral"
            variant="solid"
            size="sm"
            class="font-mono font-bold tracking-widest"
          >
            LAUNCH APP
          </UButton>
        </nav>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="flex-1 max-w-6xl mx-auto w-full px-6 py-20 md:py-28 text-center">
      <div class="max-w-2xl mx-auto flex flex-col items-center">
        <UBadge
          color="neutral"
          variant="solid"
          class="mb-6 font-mono tracking-widest text-xs px-4 py-1.5 rounded-full"
        >
          FREE FOREVER
        </UBadge>

        <h1 class="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">
          INSTANT FILE<br />SHARING
        </h1>

        <p class="text-lg text-neutral-500 dark:text-neutral-400 mb-10 max-w-lg leading-relaxed">
          Fast, secure, peer-to-peer file transfer on your local network. No cloud, no tracking, just pure speed.
        </p>

        <UButton
          to="/app"
          color="neutral"
          variant="solid"
          size="xl"
          class="font-mono font-bold tracking-widest mb-8 px-10"
        >
          GET STARTED
        </UButton>

        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-500">
          <UIcon name="i-lucide-smartphone" class="size-3.5" />
          <span>Mobile app coming soon</span>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="max-w-6xl mx-auto w-full px-6 pb-20">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <UCard
          v-for="feature in features"
          :key="feature.title"
          :class="['transition-transform hover:-translate-y-1', feature.soon ? 'opacity-60' : '']"
        >
          <UIcon :name="feature.icon" class="size-8 mb-4 text-neutral-700 dark:text-neutral-300" />
          <h3 class="font-mono font-bold text-sm tracking-widest mb-2">{{ feature.title }}</h3>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{{ feature.description }}</p>
          <UBadge
            v-if="feature.soon"
            color="neutral"
            variant="outline"
            class="mt-4 font-mono tracking-widest text-xs"
          >
            COMING SOON
          </UBadge>
        </UCard>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-neutral-200 dark:border-neutral-800 py-8">
      <p class="text-center text-xs font-mono text-neutral-400">
        CREATED BY
        <a
          href="https://leighdinaya.dev"
          target="_blank"
          rel="noopener"
          class="font-bold text-neutral-900 dark:text-neutral-100 hover:underline ml-1"
        >LEIGH DINAYA</a>
      </p>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { isDark, toggleTheme } = useTheme()

const features = [
  {
    icon: 'i-lucide-smile',
    title: 'SIMPLE & FAST',
    description: 'No setup required. Just open and share files instantly across devices on your local network.',
    soon: false
  },
  {
    icon: 'i-lucide-lock',
    title: 'SECURE',
    description: 'Peer-to-peer connections with WebRTC. Your files never leave your local network.',
    soon: false
  },
  {
    icon: 'i-lucide-zap',
    title: 'LIGHTNING SPEED',
    description: "Direct device-to-device transfer at your network's full bandwidth. No cloud bottleneck.",
    soon: false
  },
  {
    icon: 'i-lucide-layout-grid',
    title: 'CROSS-PLATFORM',
    description: 'Works seamlessly on desktop and mobile browsers. Share between any devices.',
    soon: false
  },
  {
    icon: 'i-lucide-smartphone',
    title: 'MOBILE APP',
    description: 'Native iOS and Android apps coming soon for even better performance.',
    soon: true
  }
]
</script>
