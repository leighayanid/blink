<template>
  <div
    ref="landingRef"
    class="landing-page min-h-screen flex flex-col relative overflow-hidden"
    @pointermove="handleDotGridMove"
    @pointerleave="resetDotGridPointer"
  >
    <div ref="dotGridBgRef" class="dot-grid-bg" aria-hidden="true">
      <div class="dot-grid-pattern" />
      <div class="dot-grid-glow" />
    </div>

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
    <section class="relative z-10 flex-1 max-w-6xl mx-auto w-full px-6 py-20 md:py-28 text-center">
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
    <section class="relative z-10 max-w-6xl mx-auto w-full px-6 pb-20">
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
    <footer class="relative z-10 border-t border-neutral-200 dark:border-neutral-800 py-8">
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
import { onMounted, onUnmounted, ref } from 'vue'

const { isDark, toggleTheme } = useTheme()

const landingRef = ref<HTMLElement | null>(null)
const dotGridBgRef = ref<HTMLElement | null>(null)
const prefersReducedMotion = ref(false)

type DotGridMotionProfile = {
  restDotOpacity: number
  restGlowOpacity: number
  restGlowSize: number
  activeGlowOpacity: number
  activeGlowSize: number
  driftShiftX: number
  driftShiftY: number
  driftDuration: number
  pulseDotOpacity: number
  pulseGlowOpacity: number
  pulseGlowSize: number
  pulseDuration: number
  pointerPosDuration: number
  pointerGlowOpacityDuration: number
  pointerGlowSizeDuration: number
}

const DOT_GRID_MOTION_PROFILE: DotGridMotionProfile = {
  restDotOpacity: 0.22,
  restGlowOpacity: 0.56,
  restGlowSize: 320,
  activeGlowOpacity: 0.98,
  activeGlowSize: 470,
  driftShiftX: 26,
  driftShiftY: 16,
  driftDuration: 9.6,
  pulseDotOpacity: 0.34,
  pulseGlowOpacity: 0.7,
  pulseGlowSize: 400,
  pulseDuration: 4.9,
  pointerPosDuration: 0.18,
  pointerGlowOpacityDuration: 0.22,
  pointerGlowSizeDuration: 0.26
}

const DOT_GRID_REDUCED_MOTION_PROFILE: DotGridMotionProfile = {
  restDotOpacity: 0.2,
  restGlowOpacity: 0.5,
  restGlowSize: 300,
  activeGlowOpacity: 0.72,
  activeGlowSize: 360,
  driftShiftX: 10,
  driftShiftY: 6,
  driftDuration: 12,
  pulseDotOpacity: 0.25,
  pulseGlowOpacity: 0.56,
  pulseGlowSize: 335,
  pulseDuration: 8.5,
  pointerPosDuration: 0.24,
  pointerGlowOpacityDuration: 0.28,
  pointerGlowSizeDuration: 0.32
}

const getDotGridProfile = (): DotGridMotionProfile =>
  prefersReducedMotion.value ? DOT_GRID_REDUCED_MOTION_PROFILE : DOT_GRID_MOTION_PROFILE

const dotGridMotion = {
  x: 50,
  y: 35,
  shiftX: 0,
  shiftY: 0,
  dotOpacity: DOT_GRID_MOTION_PROFILE.restDotOpacity,
  glowOpacity: DOT_GRID_MOTION_PROFILE.restGlowOpacity,
  glowSize: DOT_GRID_MOTION_PROFILE.restGlowSize
}

let quickX: ((value: number) => unknown) | null = null
let quickY: ((value: number) => unknown) | null = null
let quickGlowOpacity: ((value: number) => unknown) | null = null
let quickGlowSize: ((value: number) => unknown) | null = null
let cleanupDotGridAnimations: (() => void) | null = null

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

const syncDotGridVars = () => {
  if (!dotGridBgRef.value) return

  dotGridBgRef.value.style.setProperty('--dot-grid-x', `${dotGridMotion.x}%`)
  dotGridBgRef.value.style.setProperty('--dot-grid-y', `${dotGridMotion.y}%`)
  dotGridBgRef.value.style.setProperty('--dot-grid-shift-x', `${dotGridMotion.shiftX}px`)
  dotGridBgRef.value.style.setProperty('--dot-grid-shift-y', `${dotGridMotion.shiftY}px`)
  dotGridBgRef.value.style.setProperty('--dot-grid-dot-opacity', `${dotGridMotion.dotOpacity}`)
  dotGridBgRef.value.style.setProperty('--dot-grid-glow-opacity', `${dotGridMotion.glowOpacity}`)
  dotGridBgRef.value.style.setProperty('--dot-grid-glow-size', `${dotGridMotion.glowSize}px`)
}

const handleDotGridMove = (event: PointerEvent) => {
  const profile = getDotGridProfile()
  const container = event.currentTarget as HTMLElement | null
  if (!container) return

  const rect = container.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return

  const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100)
  const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100)

  if (quickX && quickY && quickGlowOpacity && quickGlowSize) {
    quickX(x)
    quickY(y)
    quickGlowOpacity(profile.activeGlowOpacity)
    quickGlowSize(profile.activeGlowSize)
    return
  }

  dotGridMotion.x = x
  dotGridMotion.y = y
  dotGridMotion.glowOpacity = profile.activeGlowOpacity
  dotGridMotion.glowSize = profile.activeGlowSize
  syncDotGridVars()
}

const resetDotGridPointer = () => {
  const profile = getDotGridProfile()
  if (quickX && quickY && quickGlowOpacity && quickGlowSize) {
    quickX(50)
    quickY(35)
    quickGlowOpacity(profile.restGlowOpacity)
    quickGlowSize(profile.restGlowSize)
    return
  }

  dotGridMotion.x = 50
  dotGridMotion.y = 35
  dotGridMotion.glowOpacity = profile.restGlowOpacity
  dotGridMotion.glowSize = profile.restGlowSize
  syncDotGridVars()
}

onMounted(async () => {
  if (!landingRef.value || !dotGridBgRef.value) return

  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const profile = getDotGridProfile()

  dotGridMotion.dotOpacity = profile.restDotOpacity
  dotGridMotion.glowOpacity = profile.restGlowOpacity
  dotGridMotion.glowSize = profile.restGlowSize

  syncDotGridVars()

  const { gsap } = await import('gsap')

  const driftTween = gsap.to(dotGridMotion, {
    shiftX: profile.driftShiftX,
    shiftY: profile.driftShiftY,
    duration: profile.driftDuration,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    onUpdate: syncDotGridVars
  })

  const pulseTween = gsap.to(dotGridMotion, {
    dotOpacity: profile.pulseDotOpacity,
    glowOpacity: profile.pulseGlowOpacity,
    glowSize: profile.pulseGlowSize,
    duration: profile.pulseDuration,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    onUpdate: syncDotGridVars
  })

  quickX = gsap.quickTo(dotGridMotion, 'x', { duration: profile.pointerPosDuration, ease: 'power3.out', onUpdate: syncDotGridVars })
  quickY = gsap.quickTo(dotGridMotion, 'y', { duration: profile.pointerPosDuration, ease: 'power3.out', onUpdate: syncDotGridVars })
  quickGlowOpacity = gsap.quickTo(dotGridMotion, 'glowOpacity', {
    duration: profile.pointerGlowOpacityDuration,
    ease: 'power2.out',
    onUpdate: syncDotGridVars
  })
  quickGlowSize = gsap.quickTo(dotGridMotion, 'glowSize', {
    duration: profile.pointerGlowSizeDuration,
    ease: 'power2.out',
    onUpdate: syncDotGridVars
  })

  cleanupDotGridAnimations = () => {
    driftTween.kill()
    pulseTween.kill()
    quickX = null
    quickY = null
    quickGlowOpacity = null
    quickGlowSize = null
  }
})

onUnmounted(() => {
  cleanupDotGridAnimations?.()
})

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

<style scoped>
.dot-grid-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  --dot-grid-x: 50%;
  --dot-grid-y: 35%;
  --dot-grid-shift-x: 0px;
  --dot-grid-shift-y: 0px;
  --dot-grid-dot-opacity: 0.2;
  --dot-grid-glow-opacity: 0.5;
  --dot-grid-glow-size: 300px;
}

.dot-grid-pattern,
.dot-grid-glow {
  position: absolute;
  inset: 0;
}

.dot-grid-pattern {
  background-image: radial-gradient(circle at center, rgb(23 23 23 / var(--dot-grid-dot-opacity)) 1px, transparent 1px);
  background-size: 22px 22px;
  background-position: var(--dot-grid-shift-x) var(--dot-grid-shift-y);
  mask-image: radial-gradient(140% 100% at 50% 0%, black 30%, rgb(0 0 0 / 0.35) 70%, transparent 100%);
}

.dark .dot-grid-pattern {
  background-image: radial-gradient(circle at center, rgb(245 245 245 / var(--dot-grid-dot-opacity)) 1px, transparent 1px);
}

.dot-grid-glow {
  opacity: var(--dot-grid-glow-opacity);
  background:
    radial-gradient(
      var(--dot-grid-glow-size) circle at var(--dot-grid-x) var(--dot-grid-y),
      rgb(255 255 255 / 0.5),
      transparent 70%
    );
  mix-blend-mode: soft-light;
}

.dark .dot-grid-glow {
  background:
    radial-gradient(
      var(--dot-grid-glow-size) circle at var(--dot-grid-x) var(--dot-grid-y),
      rgb(56 189 248 / 0.28),
      transparent 72%
    );
  mix-blend-mode: screen;
}
</style>
