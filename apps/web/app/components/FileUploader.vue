<template>
  <div class="flex flex-col gap-4">
    <div
      class="relative overflow-hidden rounded-none border p-6 text-center transition-all duration-200 sm:p-8 lg:p-10 group"
      :class="[
        isDragging
          ? 'border-swiss-orange bg-white dark:bg-swiss-paper-dark scale-[1.01] shadow-lg'
          : 'border-swiss-black dark:border-white bg-white dark:bg-swiss-paper-dark',
        disabled
          ? 'cursor-not-allowed opacity-40 bg-swiss-bg dark:bg-swiss-bg-dark border-swiss-grey'
          : 'cursor-pointer hover:border-swiss-orange hover:-translate-y-1 hover:shadow-md hover:scale-[1.01]'
      ]"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @click="!disabled && fileInput?.click()"
    >
      <div v-if="isDragging" class="absolute inset-0 bg-swiss-orange/5 animate-pulse" />

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
          class="flex size-14 items-center justify-center rounded-none border border-swiss-black dark:border-white bg-white dark:bg-swiss-paper-dark text-swiss-black dark:text-white transition-all duration-300 sm:size-16 lg:size-20 group-hover:scale-110 group-hover:text-swiss-orange group-hover:border-swiss-orange"
          :class="{ 'animate-bounce': isDragging }"
        >
          <UIcon name="i-lucide-upload" class="size-8 sm:size-9 lg:size-10 transition-transform duration-300 group-hover:-translate-y-1" />
        </div>
        <div>
          <p class="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-swiss-black dark:text-white">{{ dropZoneTitle }}</p>
          <p class="mt-2 text-[10px] font-bold uppercase tracking-widest text-swiss-grey dark:text-swiss-grey-light">{{ dropZoneSubtitle }}</p>
        </div>
      </div>
    </div>

    <Transition name="slide-up">
      <div v-if="selectedFiles.length > 0" class="flex flex-col gap-4">
        <div class="flex items-center justify-between border-b border-swiss-black dark:border-white pb-2">
          <p class="text-[10px] font-black uppercase tracking-[0.4em] text-swiss-black dark:text-white">FILES READY TO SEND</p>
          <span class="text-xs font-black text-swiss-black dark:text-white">[{{ selectedFiles.length }}]</span>
        </div>

        <div class="max-h-60 overflow-y-auto rounded-none border border-swiss-black dark:border-white bg-white dark:bg-swiss-paper-dark">
          <div
            v-for="(file, index) in selectedFiles"
            :key="index"
            class="flex items-start gap-3 border-b border-swiss-border dark:border-white/10 px-4 py-3 last:border-b-0 sm:items-center sm:gap-4"
          >
            <div class="flex size-10 shrink-0 items-center justify-center rounded-none border border-swiss-black dark:border-white bg-swiss-bg dark:bg-swiss-bg-dark text-swiss-black dark:text-white">
              <UIcon name="i-lucide-file" class="size-5 shrink-0" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-xs font-black uppercase tracking-tighter text-swiss-black dark:text-white">{{ file.name }}</p>
              <p class="text-[9px] font-bold uppercase tracking-widest text-swiss-grey dark:text-swiss-grey-light">{{ formatFileSize(file.size) }}</p>
            </div>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="xs"
              class="shrink-0 rounded-none hover:bg-swiss-orange hover:text-white transition-colors text-swiss-black dark:text-white"
              @click.stop="removeFile(index)"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row">
          <UButton
            class="flex-1 rounded-none border-0 bg-swiss-black dark:bg-white py-5 sm:py-6 text-sm font-black uppercase tracking-widest text-white dark:text-swiss-black hover:bg-swiss-orange dark:hover:bg-swiss-orange hover:shadow-sm active:scale-[0.98] transition-all duration-200"
            color="neutral"
            variant="solid"
            @click="sendFiles"
          >
            SEND FILES
          </UButton>
          <UButton
            color="neutral"
            variant="outline"
            class="w-full rounded-none border border-swiss-black dark:border-white px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-swiss-black hover:text-white dark:hover:bg-white dark:hover:text-swiss-black active:scale-[0.98] transition-all duration-200 text-swiss-black dark:text-white sm:w-auto"
            @click="clearFiles"
          >
            CLEAR LIST
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
  return 'Drop or choose files'
})

const dropZoneSubtitle = computed(() => {
  if (props.disabled) return 'Pick a nearby device before sending'
  return 'Click to browse or drag files here. Up to 1GB per file.'
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
