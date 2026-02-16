<template>
  <div class="file-uploader">
    <!-- Drop Zone -->
    <div class="drop-zone" :class="{
      'drag-over': isDragging,
      'disabled': disabled
    }" @drop.prevent="handleDrop" @dragover.prevent="handleDragOver" @dragleave.prevent="handleDragLeave"
      @click="!disabled && fileInput?.click()">
      <input ref="fileInput" type="file" multiple :disabled="disabled" @change="handleFileSelect"
        style="display: none" />

      <div class="drop-zone-content">
        <div class="drop-zone-icon-wrapper" :class="{ 'animate-bounce': isDragging }">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <div class="drop-zone-text">
           <p class="drop-zone-title font-display">{{ dropZoneTitle }}</p>
           <p class="drop-zone-subtitle">{{ dropZoneSubtitle }}</p>
        </div>
      </div>
    </div>

    <!-- Selected Files List -->
    <transition name="slide-up">
      <div v-if="selectedFiles.length > 0" class="selected-files animate-fade-in">
        <div class="files-header">
          <h4 class="files-title">SELECTED FILES</h4>
          <span class="files-count badge-neon cyan">{{ selectedFiles.length }}</span>
        </div>

        <div class="file-list card-minimal">
          <div v-for="(file, index) in selectedFiles" :key="index" class="file-item">
            <div class="file-icon">
              <!-- Generic File Icon -->
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                <polyline points="13 2 13 9 20 9"></polyline>
              </svg>
            </div>
            <div class="file-details">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size text-mono">{{ formatFileSize(file.size) }}</span>
            </div>
            <button class="remove-btn" @click.stop="removeFile(index)" aria-label="Remove file">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div class="file-actions">
          <button class="btn-base btn-gradient-synth send-btn" @click="sendFiles">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
            <span>SEND {{ selectedFiles.length }} FILE{{ selectedFiles.length > 1 ? 'S' : '' }}</span>
          </button>
          <button class="btn-base btn-ghost clear-btn" @click="clearFiles">CLEAR ALL</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useToast } from '../composables/useToast'

const MAX_FILE_SIZE = 1024 * 1024 * 1024 // 1GB
const { error: showError } = useToast()

const props = defineProps<{
  disabled?: boolean
  connectedCount?: number
}>()

const emit = defineEmits<{
  filesSelected: [files: File[]]
}>()

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
  return `Max file size: 1GB • Multiple files supported`
})

const handleDragOver = () => {
  if (!props.disabled) {
    isDragging.value = true
  }
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  isDragging.value = false
  if (props.disabled) return

  const files = Array.from(e.dataTransfer?.files || [])
  validateAndAddFiles(files)
}

const validateAndAddFiles = (files: File[]) => {
  const validFiles: File[] = []
  
  files.forEach(file => {
    if (file.size > MAX_FILE_SIZE) {
      showError(`File "${file.name}" exceeds the 1GB limit`)
    } else {
      validFiles.push(file)
    }
  })

  if (validFiles.length > 0) {
    selectedFiles.value.push(...validFiles)
  }
}

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  validateAndAddFiles(files)

  if (fileInput.value) {
    fileInput.value.value = ''
  }
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

<style scoped>
.file-uploader {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.drop-zone {
  position: relative;
  border: 2px dashed var(--border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-8) var(--space-6);
  text-align: center;
  cursor: pointer;
  background: var(--bg-primary);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.drop-zone:hover:not(.disabled) {
  border-color: var(--neon-cyan);
  background: rgba(0, 255, 255, 0.02);
  box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
}

.drop-zone.drag-over:not(.disabled) {
  border-style: solid;
  border-color: var(--neon-cyan);
  background: rgba(0, 255, 255, 0.05);
  transform: scale(1.02);
}

.drop-zone.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  border-style: solid;
  background: var(--bg-secondary);
  border-color: var(--border-primary);
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  position: relative;
  z-index: 10;
}

.drop-zone-icon-wrapper {
  color: var(--text-tertiary);
  transition: all 0.3s ease;
  padding: var(--space-4);
  background: var(--bg-secondary);
  border-radius: 50%;
}

.drop-zone:hover:not(.disabled) .drop-zone-icon-wrapper {
  color: var(--neon-cyan);
  background: rgba(0, 255, 255, 0.1);
  transform: translateY(-4px);
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(-4px); }
  50% { transform: translateY(4px); }
}

.drop-zone-text {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.drop-zone-title {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--text-primary);
  margin: 0;
  letter-spacing: 0.05em;
}

.drop-zone-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

/* Selected Files */
.selected-files {
  margin-top: var(--space-6);
  display: flex;
  flex-direction: column;
}

.files-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
  padding: 0 var(--space-1);
}

.files-title {
  font-family: 'Orbitron', var(--font-sans);
  font-size: var(--text-xs);
  font-weight: var(--font-bold);
  letter-spacing: 0.1em;
  color: var(--text-secondary);
  margin: 0;
}

.files-count {
  font-family: var(--font-mono);
}

.file-list {
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  max-height: 240px;
  overflow-y: auto;
  padding: 0;
}

.file-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-primary);
  transition: background-color 0.2s ease;
}

.file-item:last-child {
  border-bottom: none;
}

.file-item:hover {
  background-color: var(--bg-secondary);
}

.file-icon {
  color: var(--neon-cyan);
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.remove-btn {
  background: transparent;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: rgba(255, 51, 102, 0.1);
  color: var(--neon-red);
}

.file-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.send-btn {
  flex: 1;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.clear-btn {
  font-size: var(--text-xs);
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

