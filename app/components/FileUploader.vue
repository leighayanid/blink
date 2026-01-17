<template>
  <div class="file-uploader">
    <!-- Drop Zone -->
    <div
      class="drop-zone"
      :class="{
        'drag-over': isDragging,
        'disabled': disabled
      }"
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
        @change="handleFileSelect"
        style="display: none"
      />

      <div class="drop-zone-content">
        <div class="drop-zone-icon" :class="{ bounce: isDragging && !disabled }">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p class="drop-zone-title">{{ dropZoneTitle }}</p>
        <p class="drop-zone-subtitle">{{ dropZoneSubtitle }}</p>
      </div>
    </div>

    <!-- Selected Files List -->
    <div v-if="selectedFiles.length > 0" class="selected-files">
      <div class="files-header">
        <h4 class="files-title">Selected Files</h4>
        <span class="files-count">{{ selectedFiles.length }}</span>
      </div>

      <div class="file-list">
        <div
          v-for="(file, index) in selectedFiles"
          :key="index"
          class="file-item"
          :style="{ '--file-index': index }"
        >
          <div class="file-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div class="file-details">
            <span class="file-name">{{ file.name }}</span>
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
          </div>
          <button
            class="remove-btn"
            @click.stop="removeFile(index)"
            aria-label="Remove file"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div class="file-actions">
        <button class="send-btn" @click="sendFiles">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          <span>Send {{ selectedFiles.length }} file{{ selectedFiles.length > 1 ? 's' : '' }}</span>
        </button>
        <button class="clear-btn" @click="clearFiles">Clear All</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

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
  if (props.disabled) return 'Connect to a device first'
  if (isDragging.value) return 'Drop files here'
  return 'Drag files here or click to browse'
})

const dropZoneSubtitle = computed(() => {
  if (props.disabled) return 'Select a device from the list to start sharing'
  return `Multiple files supported`
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
  selectedFiles.value.push(...files)
}

const handleFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files || [])
  selectedFiles.value.push(...files)

  // Reset input
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
/* ============================================
   FILE UPLOADER CONTAINER
   ============================================ */
.file-uploader {
  padding: 0;
}

/* ============================================
   DROP ZONE
   ============================================ */
.drop-zone {
  border: 2px dashed rgba(0, 0, 0, 0.12);
  border-radius: 0.75rem;
  padding: var(--space-10) var(--space-6);
  text-align: center;
  cursor: pointer;
  transition:
    border-color var(--transition-base),
    background-color var(--transition-base),
    transform var(--transition-fast);
  background: rgba(0, 0, 0, 0.02);
}

html.dark .drop-zone {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
}

/* Hover state */
.drop-zone:hover:not(.disabled) {
  border-color: var(--color-primary);
  background: rgba(255, 165, 0, 0.04);
}

html.dark .drop-zone:hover:not(.disabled) {
  background: rgba(255, 149, 0, 0.06);
}

/* Drag over state - solid orange border, tinted background */
.drop-zone.drag-over:not(.disabled) {
  border-style: solid;
  border-color: var(--color-primary);
  background: rgba(255, 165, 0, 0.08);
  transform: scale(1.01);
}

html.dark .drop-zone.drag-over:not(.disabled) {
  background: rgba(255, 149, 0, 0.12);
}

/* Disabled state */
.drop-zone.disabled {
  cursor: not-allowed;
  opacity: 0.5;
  background: rgba(0, 0, 0, 0.04);
}

html.dark .drop-zone.disabled {
  background: rgba(255, 255, 255, 0.02);
}

/* Drop zone content */
.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.drop-zone-icon {
  color: var(--text-tertiary);
  transition: color var(--transition-base), transform var(--transition-base);
}

.drop-zone:hover:not(.disabled) .drop-zone-icon {
  color: var(--color-primary);
}

.drop-zone.drag-over:not(.disabled) .drop-zone-icon {
  color: var(--color-primary);
}

/* Icon bounce animation on drag */
.drop-zone-icon.bounce {
  animation: iconBounce 0.6s var(--ease-bounce) infinite;
}

@keyframes iconBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

.drop-zone-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
  letter-spacing: var(--tracking-tight);
}

.drop-zone-subtitle {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

/* ============================================
   SELECTED FILES
   ============================================ */
.selected-files {
  margin-top: var(--space-6);
  animation: slideUp var(--duration-slow) var(--ease-out) forwards;
}

.files-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.files-title {
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  margin: 0;
}

.files-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  color: var(--color-primary);
  background: rgba(255, 165, 0, 0.1);
  border-radius: 9999px;
}

html.dark .files-count {
  background: rgba(255, 149, 0, 0.15);
}

/* File list container */
.file-list {
  background: var(--bg-tertiary);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 0.625rem;
  max-height: 240px;
  overflow-y: auto;
}

html.dark .file-list {
  border-color: rgba(255, 255, 255, 0.06);
}

/* Individual file item */
.file-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  transition: background-color var(--transition-fast);

  /* Staggered entry animation */
  opacity: 0;
  animation: fileSlideIn var(--duration-base) var(--ease-out) forwards;
  animation-delay: calc(var(--file-index, 0) * 30ms);
}

@keyframes fileSlideIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

html.dark .file-item {
  border-bottom-color: rgba(255, 255, 255, 0.04);
}

.file-item:last-child {
  border-bottom: none;
}

.file-item:hover {
  background: rgba(0, 0, 0, 0.02);
}

html.dark .file-item:hover {
  background: rgba(255, 255, 255, 0.02);
}

/* File icon */
.file-icon {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

/* File details */
.file-details {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
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

/* Remove button */
.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 0.375rem;
  background: transparent;
  color: var(--text-tertiary);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast),
    transform var(--transition-fast);
  flex-shrink: 0;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
  transform: scale(1.1);
}

/* ============================================
   FILE ACTIONS
   ============================================ */
.file-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.send-btn,
.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-5);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.send-btn {
  flex: 1;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: white;
  box-shadow: 0 2px 4px rgba(255, 165, 0, 0.2);
}

.send-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 165, 0, 0.3);
}

.send-btn:active {
  transform: translateY(0) scale(0.98);
}

.clear-btn {
  background: rgba(100, 116, 139, 0.08);
  color: var(--text-secondary);
  border: 1px solid rgba(100, 116, 139, 0.15);
}

.clear-btn:hover {
  background: rgba(100, 116, 139, 0.15);
  color: var(--text-primary);
}

/* ============================================
   MOBILE RESPONSIVE
   ============================================ */
@media (max-width: 767px) {
  .drop-zone {
    padding: var(--space-8) var(--space-4);
  }

  .drop-zone-icon svg {
    width: 40px;
    height: 40px;
  }

  .drop-zone-title {
    font-size: var(--text-base);
  }

  .file-actions {
    flex-direction: column;
  }

  .send-btn,
  .clear-btn {
    min-height: 44px;
  }
}
</style>
