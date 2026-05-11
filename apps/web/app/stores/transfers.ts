import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import type { Transfer } from '@blink/types'

export const useTransfersStore = defineStore('transfers', {
  state: () => ({
    activeTransfers: [] as Transfer[],
    completedTransfers: useStorage<Transfer[]>('blink-completed-transfers', []),
    failedTransfers: useStorage<Transfer[]>('blink-failed-transfers', [])
  }),

  getters: {
    allTransfers: (state) => [
      ...state.activeTransfers,
      ...state.completedTransfers,
      ...state.failedTransfers
    ],

    activeCount: (state) => state.activeTransfers.length,

    completedCount: (state) => state.completedTransfers.length,

    totalProgress: (state) => {
      if (state.activeTransfers.length === 0) return 0

      const total = state.activeTransfers.reduce(
        (sum, t) => sum + t.fileSize,
        0
      )
      if (total === 0) return 0

      const transferred = state.activeTransfers.reduce(
        (sum, t) => sum + t.fileSize * (t.progress / 100),
        0
      )
      return transferred / total * 100
    }
  },

  actions: {
    addTransfer(transfer: Transfer) {
      // Ensure we don't have duplicates
      const existing = this.activeTransfers.find(t => t.id === transfer.id)
      if (existing) {
        Object.assign(existing, transfer)
      } else {
        this.activeTransfers.push(transfer)
      }
    },

    updateTransfer(transferId: string, updates: Partial<Transfer>) {
      const index = this.activeTransfers.findIndex(t => t.id === transferId)
      if (index !== -1) {
        const transfer = this.activeTransfers[index]
        if (transfer) {
          Object.assign(transfer, updates)

          // Move to completed/failed if status changed
          if (updates.status === 'completed') {
            this.moveToCompleted(index)
          } else if (updates.status === 'failed') {
            this.moveToFailed(index)
          }
        }
      }
    },

    moveToCompleted(index: number) {
      const transfer = this.activeTransfers.splice(index, 1)[0]
      if (transfer) {
        // Add to beginning of list (newest first)
        this.completedTransfers.unshift(transfer)
        // Limit history to 50 items
        if (this.completedTransfers.length > 50) {
          this.completedTransfers.pop()
        }
      }
    },

    moveToFailed(index: number) {
      const transfer = this.activeTransfers.splice(index, 1)[0]
      if (transfer) {
        this.failedTransfers.unshift(transfer)
        if (this.failedTransfers.length > 50) {
          this.failedTransfers.pop()
        }
      }
    },

    removeTransfer(transferId: string) {
      this.activeTransfers = this.activeTransfers.filter(t => t.id !== transferId)
      this.completedTransfers = this.completedTransfers.filter(t => t.id !== transferId)
      this.failedTransfers = this.failedTransfers.filter(t => t.id !== transferId)
    },

    clearCompleted() {
      this.completedTransfers = []
    },

    clearAll() {
      this.activeTransfers = []
      this.completedTransfers = []
      this.failedTransfers = []
    }
  }
})
