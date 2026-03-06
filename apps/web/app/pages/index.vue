<template>
  <div class="relative min-h-screen overflow-hidden bg-light-primary text-light-primary dark:bg-dark-primary dark:text-dark-primary">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_top,rgba(255,149,0,0.24),transparent_58%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,149,0,0.18),transparent_58%)]" />
      <div class="absolute inset-y-0 right-[-12rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(255,215,0,0.18),transparent_68%)] blur-3xl dark:bg-[radial-gradient(circle,rgba(255,140,66,0.14),transparent_68%)]" />
      <div class="brand-grid absolute inset-0 opacity-50 dark:opacity-35" />
      <div class="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-400/50 to-transparent" />
    </div>

    <header class="sticky top-0 z-40 border-b border-primary-200/40 bg-[rgba(255,248,231,0.78)] backdrop-blur-xl dark:border-primary-500/15 dark:bg-[rgba(22,22,42,0.78)]">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <NuxtLink to="/" class="flex items-center gap-3 text-inherit no-underline">
          <div>
            <p class="font-orbitron text-lg font-black uppercase tracking-[0.32em] text-neutral-900 dark:text-white">Blink</p>
            <p class="text-xs tracking-[0.02em] text-neutral-500 dark:text-neutral-400">Trusted local sharing across your devices.</p>
          </div>
        </NuxtLink>

        <nav class="hidden items-center gap-8 lg:flex">
          <a
            v-for="link in navigationLinks"
            :key="link.label"
            :href="link.href"
            class="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
          >
            {{ link.label }}
          </a>
        </nav>

        <div class="flex items-center gap-3">
          <ClientOnly>
            <UButton
              :icon="isDark ? 'i-lucide-sun-medium' : 'i-lucide-moon-star'"
              color="neutral"
              variant="outline"
              size="sm"
              class="rounded-full"
              @click="toggleTheme"
            />
            <template #fallback>
              <div class="size-9 rounded-full border border-neutral-200 dark:border-neutral-700" />
            </template>
          </ClientOnly>
          <UButton
            to="/app"
            color="neutral"
            size="sm"
            class="rounded-full border-0 bg-primary-600 px-5 font-semibold text-white shadow-[0_16px_34px_rgba(255,149,0,0.22)] hover:bg-primary-700 dark:bg-primary-500 dark:text-neutral-950 dark:hover:bg-primary-400"
          >
            Launch Blink
          </UButton>
        </div>
      </div>
    </header>

    <main class="relative z-10">
      <section class="mx-auto grid max-w-7xl gap-14 px-6 pb-18 pt-16 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:pb-24 lg:pt-20">
        <div class="max-w-2xl">
          <span
            class="mb-6 inline-flex rounded-full border border-primary-200 bg-primary-100/80 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary-800 dark:border-primary-500/30 dark:bg-primary-500/12 dark:text-primary-200"
          >
            Professional local sharing for modern teams
          </span>

          <h1 class="max-w-3xl font-orbitron text-5xl font-black uppercase leading-[0.92] tracking-[-0.04em] text-neutral-950 dark:text-white sm:text-6xl lg:text-7xl">
            Move files across your network with confidence.
          </h1>

          <p class="mt-6 max-w-xl text-lg leading-8 text-neutral-600 dark:text-neutral-300">
            Blink gives teams, households, and freelancers a faster way to send files directly between devices,
            without cloud uploads, account friction, or hidden handoffs.
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <UButton
              to="/app"
              color="neutral"
              size="xl"
              class="justify-center rounded-full border-0 bg-primary-600 px-7 font-semibold text-white shadow-[0_20px_50px_rgba(255,149,0,0.18)] hover:bg-primary-700 dark:bg-primary-500 dark:text-neutral-950 dark:hover:bg-primary-400"
            >
              Open Blink
            </UButton>
            <UButton
              to="#how-it-works"
              color="neutral"
              variant="outline"
              size="xl"
              class="justify-center rounded-full px-7 font-semibold"
            >
              See How It Works
            </UButton>
          </div>

          <div class="mt-10 grid gap-4 sm:grid-cols-3">
            <div
              v-for="stat in heroStats"
              :key="stat.label"
              class="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              <p class="text-2xl font-semibold text-neutral-950 dark:text-white">{{ stat.value }}</p>
              <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{{ stat.label }}</p>
            </div>
          </div>

          <div class="mt-10 flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <div
              v-for="pill in supportPills"
              :key="pill"
              class="rounded-full border border-black/5 bg-white/70 px-4 py-2 dark:border-white/10 dark:bg-white/5"
            >
              {{ pill }}
            </div>
          </div>
        </div>

        <div class="relative">
          <div class="absolute -left-6 top-8 hidden h-24 w-24 rounded-full bg-primary-300/35 blur-3xl dark:block" />
          <div class="absolute -right-10 bottom-10 h-32 w-32 rounded-full bg-secondary-500/20 blur-3xl" />

          <div class="relative overflow-hidden rounded-[2rem] border border-black/5 bg-white/85 p-6 shadow-[0_28px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/6">
            <div class="flex items-start justify-between gap-4 border-b border-black/5 pb-5 dark:border-white/10">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.28em] text-primary-700 dark:text-primary-300">Live workspace</p>
                <h2 class="mt-2 text-2xl font-semibold text-neutral-950 dark:text-white">Operational at a glance</h2>
              </div>
              <UBadge color="success" variant="soft" class="rounded-full px-3 py-1 font-medium">
                Secure Session
              </UBadge>
            </div>

            <div class="mt-6 grid gap-4 sm:grid-cols-[1.15fr_0.85fr]">
              <div class="space-y-4">
                <div class="rounded-3xl border border-black/5 bg-neutral-50/80 p-5 dark:border-white/10 dark:bg-black/20">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-sm font-semibold text-neutral-950 dark:text-white">Creative Team Workspace</p>
                      <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Send a project folder to the selected device in one action.</p>
                    </div>
                    <div class="rounded-2xl bg-primary-100 p-3 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
                      <UIcon name="i-lucide-zap" class="size-6" />
                    </div>
                  </div>
                </div>

                <div class="rounded-3xl border border-black/5 bg-white p-5 dark:border-white/10 dark:bg-white/5">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500 dark:text-neutral-400">Selected device</p>
                      <p class="mt-2 text-lg font-semibold text-neutral-950 dark:text-white">MacBook Pro · Studio Floor</p>
                    </div>
                    <UBadge color="success" variant="soft" class="rounded-full px-3 py-1">
                      Connected
                    </UBadge>
                  </div>

                  <div class="mt-4 space-y-3">
                    <div
                      v-for="device in previewDevices"
                      :key="device.name"
                      class="flex items-center justify-between rounded-2xl border border-black/5 px-4 py-3 dark:border-white/10"
                    >
                      <div>
                        <p class="font-medium text-neutral-900 dark:text-white">{{ device.name }}</p>
                        <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ device.role }}</p>
                      </div>
                      <span
                        class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium"
                        :class="device.connected
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                          : 'bg-neutral-900/5 text-neutral-600 dark:bg-white/10 dark:text-neutral-300'"
                      >
                        <span
                          class="size-2 rounded-full"
                          :class="device.connected ? 'bg-emerald-500' : 'bg-neutral-400'"
                        />
                        {{ device.connected ? 'Ready' : 'Standby' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="space-y-4">
                <div class="rounded-3xl border border-primary-200/70 bg-primary-50/80 p-5 dark:border-primary-500/25 dark:bg-primary-500/10">
                  <p class="text-xs font-semibold uppercase tracking-[0.24em] text-primary-700 dark:text-primary-300">Transfer summary</p>
                  <p class="mt-3 text-3xl font-semibold text-neutral-950 dark:text-white">2.4 GB</p>
                  <p class="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Brand assets, product renders, and handoff docs.</p>

                  <div class="mt-5 h-2 overflow-hidden rounded-full bg-white/70 dark:bg-white/10">
                    <div class="h-full w-[78%] rounded-full bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-300" />
                  </div>
                  <div class="mt-2 flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                    <span>78% complete</span>
                    <span>ETA 00:18</span>
                  </div>
                </div>

                <div class="rounded-3xl border border-black/5 bg-neutral-950 p-5 text-white shadow-[0_24px_70px_rgba(17,24,39,0.2)] dark:border-white/10">
                  <div class="flex items-center justify-between gap-2">
                    <p class="text-sm font-semibold">Trust gate</p>
                    <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-neutral-200">Pair code</span>
                  </div>
                  <p class="mt-4 font-orbitron text-3xl font-black tracking-[0.34em] text-primary-300">483 921</p>
                  <p class="mt-3 text-sm leading-6 text-neutral-300">
                    Require a short verification code before sending to a new device, then approve future transfers with one click.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mx-auto max-w-7xl px-6 pb-8 lg:px-8">
        <div class="grid gap-4 rounded-[2rem] border border-black/5 bg-white/75 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.07)] backdrop-blur xl:grid-cols-3 dark:border-white/10 dark:bg-white/5">
          <div
            v-for="highlight in highlights"
            :key="highlight.title"
            class="rounded-3xl border border-black/5 bg-white/80 p-5 dark:border-white/10 dark:bg-black/15"
          >
            <div class="flex items-center gap-3">
              <div class="flex size-11 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
                <UIcon :name="highlight.icon" class="size-5" />
              </div>
              <div>
                <p class="font-semibold text-neutral-950 dark:text-white">{{ highlight.title }}</p>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">{{ highlight.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" class="mx-auto max-w-7xl px-6 py-18 lg:px-8">
        <div class="max-w-2xl">
          <p class="text-sm font-semibold uppercase tracking-[0.28em] text-primary-700 dark:text-primary-300">Why Blink</p>
          <h2 class="mt-4 text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-4xl">
            Built for direct, trustworthy file movement between nearby devices.
          </h2>
        </div>

        <div class="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <UCard
            v-for="feature in features"
            :key="feature.title"
            class="rounded-[1.75rem] border border-black/5 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-white/5"
            :ui="{ body: 'p-6 sm:p-7' }"
          >
            <div class="flex size-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
              <UIcon :name="feature.icon" class="size-6" />
            </div>
            <h3 class="mt-5 text-xl font-semibold text-neutral-950 dark:text-white">{{ feature.title }}</h3>
            <p class="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{{ feature.description }}</p>
          </UCard>
        </div>
      </section>

      <section id="how-it-works" class="mx-auto max-w-7xl px-6 pb-18 lg:px-8 lg:pb-24">
        <div class="grid gap-8 rounded-[2.25rem] border border-black/5 bg-neutral-950 px-6 py-8 text-white shadow-[0_30px_100px_rgba(15,23,42,0.18)] lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-10 dark:border-white/10">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.28em] text-primary-300">How it works</p>
            <h2 class="mt-4 max-w-md text-3xl font-semibold tracking-tight sm:text-4xl">
              Designed for fast handoffs without the usual setup overhead.
            </h2>
            <p class="mt-4 max-w-lg text-base leading-7 text-neutral-300">
              Blink keeps the workflow compact: discover a device, confirm trust, and deliver the file directly.
            </p>
          </div>

          <div class="grid gap-4">
            <div
              v-for="(step, index) in workflowSteps"
              :key="step.title"
              class="rounded-[1.5rem] border border-white/10 bg-white/5 p-5"
            >
              <div class="flex items-start gap-4">
                <div class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-400/20 text-sm font-semibold text-primary-200">
                  0{{ index + 1 }}
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-white">{{ step.title }}</h3>
                  <p class="mt-2 text-sm leading-6 text-neutral-300">{{ step.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div class="flex flex-col gap-6 rounded-[2rem] border border-primary-400/20 bg-[linear-gradient(135deg,rgba(17,24,39,0.98),rgba(41,37,36,0.94))] p-8 text-white shadow-[0_24px_80px_rgba(255,149,0,0.16)] lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-2xl">
            <p class="text-sm font-semibold uppercase tracking-[0.28em] text-primary-300">Ready to use</p>
            <h2 class="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Replace improvised file handoffs with a workspace that feels deliberate.
            </h2>
            <p class="mt-4 text-base leading-7 text-neutral-300">
              Open Blink, choose a destination, and move files directly across your local network with a workflow that stays clear from start to finish.
            </p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row">
            <UButton
              to="/app"
              color="neutral"
              size="lg"
              class="justify-center rounded-full border-0 bg-primary-500 px-7 font-semibold text-neutral-950 hover:bg-primary-400"
            >
              Launch Blink
            </UButton>
            <UButton
              to="#features"
              color="neutral"
              variant="outline"
              size="lg"
              class="justify-center rounded-full border-white/15 bg-white/5 px-7 font-semibold text-white hover:bg-white/10"
            >
              Explore Features
            </UButton>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()

const navigationLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Workflow', href: '#how-it-works' },
  { label: 'Launch', href: '/app' }
] as const

const heroStats = [
  { value: 'Peer-to-peer', label: 'Direct device communication across your local network.' },
  { value: '6-digit trust', label: 'Simple verification before first transfer.' },
  { value: 'Browser-based', label: 'No install required to get started on desktop.' }
] as const

const supportPills = [
  'No cloud upload',
  'Fast on local Wi-Fi',
  'Works across modern browsers'
] as const

const previewDevices = [
  { name: 'MacBook Pro', role: 'Design review station', connected: true },
  { name: 'Office iPad', role: 'Client presentation copy', connected: true },
  { name: 'Windows PC', role: 'Production handoff', connected: false }
] as const

const highlights = [
  {
    icon: 'i-lucide-shield-check',
    title: 'Trust-first workflow',
    description: 'Pair devices intentionally before sending new files.'
  },
  {
    icon: 'i-lucide-arrow-right-left',
    title: 'Direct transfer path',
    description: 'Files move device-to-device without external storage.'
  },
  {
    icon: 'i-lucide-layout-dashboard',
    title: 'Clear operational UI',
    description: 'Discovery, transfer queue, and connection state stay visible.'
  }
] as const

const features = [
  {
    icon: 'i-lucide-zap',
    title: 'Fast local delivery',
    description: 'Blink uses your local network for direct handoffs, keeping transfers quick and avoiding the usual cloud bottleneck.'
  },
  {
    icon: 'i-lucide-lock-keyhole',
    title: 'Controlled device trust',
    description: 'A short pairing code gives new-device approval a clear, understandable security step before sharing starts.'
  },
  {
    icon: 'i-lucide-monitor-smartphone',
    title: 'Cross-device workflow',
    description: 'Send files between laptops, desktops, and tablets in a single interface that stays consistent across screens.'
  },
  {
    icon: 'i-lucide-files',
    title: 'Built for real handoffs',
    description: 'Project folders, assets, drafts, and review packages fit naturally into a queue-based transfer flow.'
  },
  {
    icon: 'i-lucide-list-checks',
    title: 'Clear transfer visibility',
    description: 'Keep active sends, completed deliveries, and failed transfers visible in one queue without losing context.'
  },
  {
    icon: 'i-lucide-globe',
    title: 'Browser-ready access',
    description: 'Start sharing from modern browsers without introducing account setup or external relay services.'
  }
] as const

const workflowSteps = [
  {
    title: 'Discover nearby devices',
    description: 'Open Blink and see available devices on the same network in a clean, immediate list.'
  },
  {
    title: 'Approve trust once',
    description: 'Use the pairing code to verify a new connection, then keep repeat transfers simple for trusted devices.'
  },
  {
    title: 'Send files with visibility',
    description: 'Choose the destination, start the transfer, and monitor queue progress without leaving the workspace.'
  }
] as const
</script>

<style scoped>
.brand-grid {
  background-image:
    linear-gradient(to right, rgb(15 23 42 / 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(15 23 42 / 0.05) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: radial-gradient(circle at top, black 24%, rgb(0 0 0 / 0.8) 55%, transparent 100%);
}

.dark .brand-grid {
  background-image:
    linear-gradient(to right, rgb(255 255 255 / 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgb(255 255 255 / 0.08) 1px, transparent 1px);
}
</style>
