<template>
  <div class="file-uploader">
    <div
      class="drop-zone"
      :class="{ 'drag-over': isDragging, disabled }"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
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
        <div class="icon">📁</div>
        <p class="primary">{{ getDropZoneText }}</p>
        <p class="secondary">{{ getDropZoneSubtext }}</p>
      </div>
    </div>

    <div v-if="selectedFiles.length > 0" class="selected-files">
      <h4>Selected Files ({{ selectedFiles.length }})</h4>
      <div class="file-list">
        <div
          v-for="(file, index) in selectedFiles"
          :key="index"
          class="file-item"
        >
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ formatFileSize(file.size) }}</span>
          <button class="remove-btn" @click="removeFile(index)">×</button>
        </div>
      </div>
      <div class="actions">
        <button class="send-btn" @click="sendFiles">
          Send {{ selectedFiles.length }} file(s)
        </button>
        <button class="clear-btn" @click="clearFiles">Clear</button>
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

const getDropZoneText = computed(() => {
  if (props.disabled) return 'Connect to a device first'
  return 'Click or drag files here'
})

const getDropZoneSubtext = computed(() => {
  if (props.disabled) return ''
  return `Multiple files supported • ${props.connectedCount || 0} device(s) connected`
})

const handleDrop = (e: DragEvent) => {
  isDragging.value = false

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
.file-uploader {
  padding: 1rem;
}

.drop-zone {
  border: 3px dashed #ccc;
  border-radius: 8px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fafafa;
}

.drop-zone:hover:not(.disabled) {
  border-color: #4CAF50;
  background-color: #f1f8f4;
}

.drop-zone.drag-over {
  border-color: #4CAF50;
  background-color: #e8f5e9;
  transform: scale(1.02);
}

.drop-zone.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.drop-zone-content .icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.drop-zone-content .primary {
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0.5rem 0;
}

.drop-zone-content .secondary {
  color: #666;
  margin: 0;
}

.selected-files {
  margin-top: 1.5rem;
}

.selected-files h4 {
  margin-bottom: 1rem;
}

.file-list {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #f0f0f0;
}

.file-item:last-child {
  border-bottom: none;
}

.file-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  color: #666;
  font-size: 0.9rem;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  color: #f44336;
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.send-btn,
.clear-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.send-btn {
  background-color: #4CAF50;
  color: white;
  flex: 1;
}

.send-btn:hover {
  background-color: #45a049;
}

.clear-btn {
  background-color: #f5f5f5;
  color: #333;
}

.clear-btn:hover {
  background-color: #e0e0e0;
}
</style>
