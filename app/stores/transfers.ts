import { defineStore } from 'pinia'
import type { Transfer } from '../types'

export const useTransfersStore = defineStore('transfers', {
  state: () => ({
    activeTransfers: [] as Transfer[],
    completedTransfers: [] as Transfer[],
    failedTransfers: [] as Transfer[]
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
        (sum, t) => sum + t.progress,
        0
      )
      return total / state.activeTransfers.length
    }
  },

  actions: {
    addTransfer(transfer: Transfer) {
      this.activeTransfers.push(transfer)
    },

    updateTransfer(transferId: string, updates: Partial<Transfer>) {
      const transfer = this.activeTransfers.find(t => t.id === transferId)
      if (transfer) {
        Object.assign(transfer, updates)

        // Move to completed/failed if status changed
        if (updates.status === 'completed') {
          this.moveToCompleted(transferId)
        } else if (updates.status === 'failed') {
          this.moveToFailed(transferId)
        }
      }
    },

    moveToCompleted(transferId: string) {
      const index = this.activeTransfers.findIndex(t => t.id === transferId)
      if (index >= 0) {
        const [transfer] = this.activeTransfers.splice(index, 1)
        this.completedTransfers.push(transfer)
      }
    },

    moveToFailed(transferId: string) {
      const index = this.activeTransfers.findIndex(t => t.id === transferId)
      if (index >= 0) {
        const [transfer] = this.activeTransfers.splice(index, 1)
        this.failedTransfers.push(transfer)
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
