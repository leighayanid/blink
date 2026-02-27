<template>
  <div class="flex flex-col gap-4">
    <!-- Drop Zone -->
    <div
      class="relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200"
      :class="[
        isDragging
          ? 'border-neutral-900 dark:border-white bg-neutral-50 dark:bg-neutral-900 scale-[1.01]'
          : 'border-neutral-200 dark:border-neutral-700',
        disabled
          ? 'opacity-50 cursor-not-allowed bg-neutral-50 dark:bg-neutral-900 border-solid'
          : 'hover:border-neutral-400 dark:hover:border-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
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

      <div class="flex flex-col items-center gap-4 pointer-events-none">
        <div
          class="p-4 rounded-full bg-neutral-100 dark:bg-neutral-800 transition-transform"
          :class="{ 'animate-bounce': isDragging }"
        >
          <UIcon
            name="i-lucide-upload"
            class="size-10 text-neutral-400"
          />
        </div>
        <div>
          <p class="font-mono font-bold tracking-wider text-sm">{{ dropZoneTitle }}</p>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{{ dropZoneSubtitle }}</p>
        </div>
      </div>
    </div>

    <!-- Selected Files -->
    <Transition name="slide-up">
      <div v-if="selectedFiles.length > 0" class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <p class="text-xs font-mono font-bold tracking-widest text-neutral-500">SELECTED FILES</p>
          <UBadge color="neutral" variant="soft" class="font-mono text-xs">
            {{ selectedFiles.length }}
          </UBadge>
        </div>

        <div class="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
          <div
            v-for="(file, index) in selectedFiles"
            :key="index"
            class="flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-neutral-700 last:border-b-0 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
          >
            <UIcon name="i-lucide-file" class="size-5 text-neutral-400 shrink-0" />
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ file.name }}</p>
              <p class="text-xs font-mono text-neutral-400">{{ formatFileSize(file.size) }}</p>
            </div>
            <UButton
              icon="i-lucide-x"
              color="neutral"
              variant="ghost"
              size="xs"
              @click.stop="removeFile(index)"
            />
          </div>
        </div>

        <div class="flex gap-3">
          <UButton
            class="flex-1 font-mono font-bold tracking-wider"
            color="neutral"
            variant="solid"
            icon="i-lucide-send"
            @click="sendFiles"
          >
            SEND {{ selectedFiles.length }} FILE{{ selectedFiles.length > 1 ? 'S' : '' }}
          </UButton>
          <UButton
            color="neutral"
            variant="ghost"
            class="font-mono text-xs tracking-wider"
            @click="clearFiles"
          >
            CLEAR ALL
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
  if (props.disabled) return 'CONNECT DEVICE FIRST'
  if (isDragging.value) return 'DROP FILES HERE'
  return 'DRAG FILES OR CLICK'
})

const dropZoneSubtitle = computed(() => {
  if (props.disabled) return 'Select a device to start sharing'
  return 'Max file size: 1GB • Multiple files supported'
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
