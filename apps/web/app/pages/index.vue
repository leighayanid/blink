<template>
  <div class="min-h-screen bg-app-bg font-app text-app-text selection:bg-app-primary selection:text-white dark:bg-app-bg-dark dark:text-app-text-dark">
    <header class="border-b border-app-border bg-app-surface/90 backdrop-blur dark:border-app-border-dark dark:bg-app-surface-dark/90">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
        <NuxtLink to="/" class="text-lg font-semibold text-app-text no-underline dark:text-app-text-dark">
          Blink
        </NuxtLink>

        <nav class="hidden items-center gap-6 text-sm text-app-muted dark:text-app-muted-dark md:flex">
          <a
            v-for="link in navigationLinks"
            :key="link.label"
            :href="link.href"
            class="transition-colors hover:text-app-text dark:hover:text-app-text-dark"
          >
            {{ link.label }}
          </a>
        </nav>

        <UButton
          to="/app"
          color="neutral"
          class="rounded-app bg-app-primary px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Open app
        </UButton>
      </div>
    </header>

    <main>
      <section class="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:px-8">
        <div>
          <p class="mb-4 text-sm font-medium text-app-primary">Local file sharing</p>
          <h1 class="max-w-3xl text-4xl font-semibold leading-tight text-app-text dark:text-app-text-dark sm:text-5xl lg:text-6xl">
            Send files across your local network
          </h1>
          <p class="mt-5 max-w-2xl text-base leading-7 text-app-muted dark:text-app-muted-dark sm:text-lg">
            Blink transfers files directly between nearby devices. No account, no cloud upload, and a simple pair code before the first transfer.
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <UButton
              to="/app"
              size="lg"
              class="rounded-app bg-app-primary px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              Open app
            </UButton>
            <UButton
              to="#how-it-works"
              color="neutral"
              variant="outline"
              size="lg"
              class="rounded-app border-app-border px-5 py-3 font-medium text-app-text hover:bg-app-surface-muted dark:border-app-border-dark dark:text-app-text-dark dark:hover:bg-app-surface-muted-dark"
            >
              See how it works
            </UButton>
          </div>
        </div>

        <div class="rounded-app border border-app-border bg-app-surface p-4 shadow-soft dark:border-app-border-dark dark:bg-app-surface-dark">
          <div class="rounded-md border border-app-border bg-app-bg p-4 dark:border-app-border-dark dark:bg-app-bg-dark">
            <div class="mb-4 flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-medium text-app-text dark:text-app-text-dark">Nearby devices</p>
                <p class="text-xs text-app-muted dark:text-app-muted-dark">2 ready to connect</p>
              </div>
              <span class="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-app-success dark:bg-green-950/30">
                <span class="size-2 rounded-full bg-app-success" />
                Online
              </span>
            </div>

            <div class="space-y-3">
              <div
                v-for="device in previewDevices"
                :key="device.name"
                class="flex items-center justify-between gap-3 rounded-md border border-app-border bg-app-surface px-3 py-3 dark:border-app-border-dark dark:bg-app-surface-dark"
              >
                <div class="flex min-w-0 items-center gap-3">
                  <div class="flex size-9 items-center justify-center rounded-md bg-app-primary-soft text-app-primary dark:bg-app-primary-soft-dark dark:text-blue-200">
                    <UIcon :name="device.icon" class="size-4" />
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-app-text dark:text-app-text-dark">{{ device.name }}</p>
                    <p class="text-xs text-app-muted dark:text-app-muted-dark">{{ device.status }}</p>
                  </div>
                </div>
                <span class="text-xs font-medium text-app-primary">Send</span>
              </div>
            </div>

            <div class="mt-4 rounded-md border border-dashed border-app-border bg-app-surface px-4 py-6 text-center dark:border-app-border-dark dark:bg-app-surface-dark">
              <UIcon name="i-lucide-upload" class="mx-auto mb-2 size-5 text-app-primary" />
              <p class="text-sm font-medium text-app-text dark:text-app-text-dark">Drop files here</p>
              <p class="mt-1 text-xs text-app-muted dark:text-app-muted-dark">Transfer directly to Leigh's MacBook</p>
            </div>
          </div>
        </div>
      </section>

      <section id="why-blink" class="border-y border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark">
        <div class="mx-auto grid max-w-6xl gap-0 px-5 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
          <article
            v-for="highlight in highlights"
            :key="highlight.title"
            class="border-b border-app-border py-6 last:border-b-0 dark:border-app-border-dark lg:border-b-0 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
          >
            <UIcon :name="highlight.icon" class="mb-4 size-5 text-app-primary" />
            <h2 class="text-lg font-semibold text-app-text dark:text-app-text-dark">{{ highlight.title }}</h2>
            <p class="mt-2 text-sm leading-6 text-app-muted dark:text-app-muted-dark">{{ highlight.description }}</p>
          </article>
        </div>
      </section>

      <section id="how-it-works" class="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
        <div class="max-w-2xl">
          <p class="mb-3 text-sm font-medium text-app-primary">How it works</p>
          <h2 class="text-3xl font-semibold text-app-text dark:text-app-text-dark">Three steps, no extra setup</h2>
        </div>

        <div class="mt-8 grid gap-4 md:grid-cols-3">
          <article
            v-for="(step, idx) in workflowSteps"
            :key="step.title"
            class="rounded-app border border-app-border bg-app-surface p-5 dark:border-app-border-dark dark:bg-app-surface-dark"
          >
            <span class="mb-5 flex size-8 items-center justify-center rounded-full bg-app-primary-soft text-sm font-semibold text-app-primary dark:bg-app-primary-soft-dark dark:text-blue-200">
              {{ idx + 1 }}
            </span>
            <h3 class="font-semibold text-app-text dark:text-app-text-dark">{{ step.title }}</h3>
            <p class="mt-2 text-sm leading-6 text-app-muted dark:text-app-muted-dark">{{ step.description }}</p>
          </article>
        </div>
      </section>
    </main>

    <footer class="border-t border-app-border bg-app-surface py-6 dark:border-app-border-dark dark:bg-app-surface-dark">
      <div class="mx-auto flex max-w-6xl flex-col gap-2 px-5 text-sm text-app-muted dark:text-app-muted-dark sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <span>Blink local file sharing</span>
        <span>No cloud upload</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const navigationLinks = [
  { label: 'Why Blink', href: '#why-blink' },
  { label: 'How it works', href: '#how-it-works' },
] as const

const previewDevices = [
  { name: "Leigh's MacBook", status: 'Connected and ready', icon: 'i-lucide-laptop' },
  { name: 'Kitchen iPad', status: 'Available nearby', icon: 'i-lucide-tablet' },
] as const

const highlights = [
  {
    title: 'Find nearby devices',
    description: 'Open Blink on the same network and choose the device you want to send to.',
    icon: 'i-lucide-radar'
  },
  {
    title: 'Verify with a pair code',
    description: 'A short code helps confirm the first connection before files move.',
    icon: 'i-lucide-shield-check'
  },
  {
    title: 'Watch transfer progress',
    description: 'See active transfers, speed, and history in one clear queue.',
    icon: 'i-lucide-list-checks'
  }
] as const

const workflowSteps = [
  {
    title: 'Open Blink on both devices',
    description: 'Keep both devices on the same local network so they can discover each other.'
  },
  {
    title: 'Choose and verify',
    description: 'Select the nearby device and compare the pair code before sending.'
  },
  {
    title: 'Send files directly',
    description: 'Drop files into Blink and follow each transfer until it is complete.'
  }
] as const
</script>
