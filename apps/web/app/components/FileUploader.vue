<template>
  <div class="flex flex-col gap-4">
    <div
      class="group relative overflow-hidden rounded-app border border-dashed p-6 text-center transition-all duration-200 sm:p-8 lg:p-10"
      :class="[
        isDragging
          ? 'border-app-primary bg-app-primary-soft dark:bg-app-primary-soft-dark'
          : 'border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark',
        disabled
          ? 'cursor-not-allowed opacity-60'
          : 'cursor-pointer hover:border-app-primary hover:bg-app-primary-soft/60 dark:hover:bg-app-primary-soft-dark/40'
      ]"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @click="!disabled && fileInput?.click()"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        :disabled="disabled"
        class="hidden"
        @change="handleFileSelect"
      />

      <div class="flex flex-col items-center gap-4">
        <div
          class="flex size-12 items-center justify-center rounded-app border border-app-border bg-app-surface text-app-primary transition-colors dark:border-app-border-dark dark:bg-app-surface-dark sm:size-14"
          :class="{ 'border-app-primary bg-app-primary-soft dark:bg-app-primary-soft-dark': isDragging }"
        >
          <UIcon name="i-lucide-upload" class="size-6" />
        </div>
        <div>
          <p class="text-base font-semibold text-app-text dark:text-app-text-dark">{{ dropZoneTitle }}</p>
          <p class="mt-1 text-sm text-app-muted dark:text-app-muted-dark">{{ dropZoneSubtitle }}</p>
        </div>
      </div>
    </div>

    <Transition name="slide-up">
      <div v-if="selectedFiles.length > 0" class="flex flex-col gap-4">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm font-medium text-app-text dark:text-app-text-dark">Files ready to send</p>
          <span class="rounded-full bg-app-surface-muted px-2.5 py-1 text-xs font-medium text-app-muted dark:bg-app-surface-muted-dark dark:text-app-muted-dark">
            {{ selectedFiles.length }}
          </span>
        </div>

        <div class="max-h-60 overflow-y-auto rounded-app border border-app-border bg-app-surface dark:border-app-border-dark dark:bg-app-surface-dark">
          <div
            v-for="(file, index) in selectedFiles"
            :key="index"
            class="flex items-start gap-3 border-b border-app-border px-4 py-3 last:border-b-0 dark:border-app-border-dark sm:items-center sm:gap-4"
          >
            <div class="flex size-10 shrink-0 items-center justify-center rounded-md bg-app-surface-muted text-app-muted dark:bg-app-surface-muted-dark dark:text-app-muted-dark">
              <UIcon name="i-lucide-file" class="size-5 shrink-0" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-app-text dark:text-app-text-dark">{{ file.name }}</p>
              <p class="mt-0.5 text-xs text-app-muted dark:text-app-muted-dark">{{ formatFileSize(file.size) }}</p>
            </div>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="xs"
              class="shrink-0 rounded-md text-app-muted hover:bg-app-surface-muted hover:text-app-text dark:text-app-muted-dark dark:hover:bg-app-surface-muted-dark dark:hover:text-app-text-dark"
              @click.stop="removeFile(index)"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row">
          <UButton
            class="flex-1 rounded-app bg-app-primary py-3 text-sm font-medium text-white hover:bg-blue-700"
            color="neutral"
            variant="solid"
            icon="i-lucide-send"
            @click="sendFiles"
          >
            Send files
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            class="w-full rounded-app border-app-border px-5 py-3 text-sm font-medium text-app-text hover:bg-app-surface-muted dark:border-app-border-dark dark:text-app-text-dark dark:hover:bg-app-surface-muted-dark sm:w-auto"
            @click="clearFiles"
          >
            Clear list
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
  if (props.disabled) return 'Connect a device first'
  if (isDragging.value) return 'Drop files to send'
  return 'Drop files here'
})

const dropZoneSubtitle = computed(() => {
  if (props.disabled) return 'Choose a nearby device before sending files.'
  return 'or choose files from your device. Up to 1GB per file.'
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
      toast.add({ title: `"${file.name}" is larger than 1GB`, color: 'error' })
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
