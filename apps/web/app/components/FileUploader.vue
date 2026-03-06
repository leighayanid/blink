<template>
  <div class="flex flex-col gap-4">
    <div
      class="relative overflow-hidden rounded-[1.75rem] border-2 border-dashed p-8 text-center transition-all duration-200 sm:p-10"
      :class="[
        isDragging
          ? 'border-primary-400 bg-primary-50/80 scale-[1.01] dark:border-primary-400/60 dark:bg-primary-500/12'
          : 'border-primary-200/80 bg-primary-50/35 dark:border-primary-500/20 dark:bg-white/3',
        disabled
          ? 'cursor-not-allowed opacity-60 border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-white/3'
          : 'cursor-pointer hover:border-primary-300 hover:bg-primary-50/60 dark:hover:border-primary-500/30 dark:hover:bg-white/5'
      ]"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @click="!disabled && fileInput?.click()"
    >
      <div class="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary-100/60 to-transparent dark:from-primary-500/10" />

      <input
        ref="fileInput"
        type="file"
        multiple
        :disabled="disabled"
        class="hidden"
        @change="handleFileSelect"
      />

      <div class="relative flex flex-col items-center gap-4">
        <div
          class="flex size-15 items-center justify-center rounded-[1.35rem] border border-black/5 bg-white/80 text-primary-700 shadow-[0_12px_24px_rgba(255,149,0,0.08)] transition-transform dark:border-white/10 dark:bg-white/5 dark:text-primary-300 sm:size-16 sm:rounded-[1.5rem]"
          :class="{ 'animate-bounce': isDragging }"
        >
          <UIcon name="i-lucide-upload" class="size-9" />
        </div>
        <div>
          <p class="text-sm font-semibold tracking-[0.08em] text-neutral-900 dark:text-white">{{ dropZoneTitle }}</p>
          <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{{ dropZoneSubtitle }}</p>
        </div>
      </div>
    </div>

    <Transition name="slide-up">
      <div v-if="selectedFiles.length > 0" class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <p class="text-xs font-medium tracking-[0.08em] text-neutral-500 dark:text-neutral-400">Selected</p>
          <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1 text-[11px] font-medium">
            {{ selectedFiles.length }}
          </UBadge>
        </div>

        <div class="max-h-60 overflow-y-auto rounded-[1.5rem] border border-black/5 bg-white/80 dark:border-white/10 dark:bg-white/5">
          <div
            v-for="(file, index) in selectedFiles"
            :key="index"
            class="flex items-center gap-3 border-b border-black/5 px-4 py-3 last:border-b-0 dark:border-white/10"
          >
            <div class="flex size-10 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300">
              <UIcon name="i-lucide-file" class="size-5 shrink-0" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-neutral-950 dark:text-white">{{ file.name }}</p>
              <p class="text-xs text-neutral-500 dark:text-neutral-400">{{ formatFileSize(file.size) }}</p>
            </div>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="xs"
              class="rounded-full"
              @click.stop="removeFile(index)"
            />
          </div>
        </div>

        <div class="flex gap-3">
          <UButton
            class="flex-1 rounded-full border-0 bg-primary-600 px-5 font-medium text-white hover:bg-primary-700 dark:bg-primary-500 dark:text-neutral-950 dark:hover:bg-primary-400"
            color="neutral"
            variant="solid"
            icon="i-lucide-send"
            @click="sendFiles"
          >
            Send {{ selectedFiles.length }} file{{ selectedFiles.length > 1 ? 's' : '' }}
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            class="rounded-full px-4 text-[11px] font-medium"
            @click="clearFiles"
          >
            Clear
          </UButton>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const MAX_FILE_SIZE = 1024 * 1024 * 1024 // 1GB

const props = defineProps<{
  disabled?: boolean
  connectedCount?: number
}>()

const emit = defineEmits<{
  filesSelected: [files: File[]]
}>()

const toast = useToast()
const fileInput = ref<HTMLInputElement>()
const selectedFiles = ref<File[]>([])
const isDragging = ref(false)

const dropZoneTitle = computed(() => {
  if (props.disabled) return 'Connect device'
  if (isDragging.value) return 'Drop files here'
  return 'Drop files'
})

const dropZoneSubtitle = computed(() => {
  if (props.disabled) return 'Choose a device first'
  return 'Up to 1GB per file'
})

const handleDragOver = () => {
  if (!props.disabled) isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  if (props.disabled) return
  validateAndAddFiles(Array.from(e.dataTransfer?.files || []))
}

const validateAndAddFiles = (files: File[]) => {
  const validFiles: File[] = []
  files.forEach(file => {
    if (file.size > MAX_FILE_SIZE) {
      toast.add({ title: `"${file.name}" exceeds the 1GB limit`, color: 'error' })
    } else {
      validFiles.push(file)
    }
  })
  if (validFiles.length > 0) selectedFiles.value.push(...validFiles)
}

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  validateAndAddFiles(Array.from(input.files || []))
  if (fileInput.value) fileInput.value.value = ''
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const clearFiles = () => {
  selectedFiles.value = []
}

const sendFiles = () => {
  if (selectedFiles.value.length > 0) {
    emit('filesSelected', [...selectedFiles.value])
    selectedFiles.value = []
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
</script>
