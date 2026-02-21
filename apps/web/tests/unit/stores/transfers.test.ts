import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTransfersStore } from '../../../app/stores/transfers'
import type { Transfer } from '@blink/types'

const makeTransfer = (overrides: Partial<Transfer> = {}): Transfer => ({
  id: `t-${Math.random().toString(36).slice(2)}`,
  fileName: 'file.txt',
  fileSize: 1024,
  progress: 0,
  status: 'sending',
  startTime: Date.now(),
  ...overrides,
})

describe('useTransfersStore', () => {
  let store: ReturnType<typeof useTransfersStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useTransfersStore()
  })

  // ---------------------------------------------------------------------------
  // addTransfer
  // ---------------------------------------------------------------------------
  describe('addTransfer', () => {
    it('adds a transfer to activeTransfers', () => {
      const t = makeTransfer()
      store.addTransfer(t)
      expect(store.activeTransfers).toHaveLength(1)
      expect(store.activeTransfers[0]).toEqual(t)
    })

    it('does not add duplicate transfers', () => {
      const t = makeTransfer({ id: 'dup' })
      store.addTransfer(t)
      store.addTransfer(t)
      expect(store.activeTransfers).toHaveLength(1)
    })
  })

  // ---------------------------------------------------------------------------
  // updateTransfer
  // ---------------------------------------------------------------------------
  describe('updateTransfer', () => {
    it('updates fields on an active transfer', () => {
      const t = makeTransfer({ id: 'u1', progress: 0 })
      store.addTransfer(t)
      store.updateTransfer('u1', { progress: 50 })
      expect(store.activeTransfers[0].progress).toBe(50)
    })

    it('moves to completedTransfers when status becomes "completed"', () => {
      const t = makeTransfer({ id: 'c1' })
      store.addTransfer(t)
      store.updateTransfer('c1', { status: 'completed', progress: 100 })
      expect(store.activeTransfers).toHaveLength(0)
      expect(store.completedTransfers[0].id).toBe('c1')
      expect(store.completedTransfers[0].status).toBe('completed')
    })

    it('moves to failedTransfers when status becomes "failed"', () => {
      const t = makeTransfer({ id: 'f1' })
      store.addTransfer(t)
      store.updateTransfer('f1', { status: 'failed' })
      expect(store.activeTransfers).toHaveLength(0)
      expect(store.failedTransfers[0].id).toBe('f1')
    })

    it('is a no-op for unknown transferId', () => {
      store.updateTransfer('nonexistent', { progress: 99 })
      expect(store.activeTransfers).toHaveLength(0)
    })
  })

  // ---------------------------------------------------------------------------
  // moveToCompleted / moveToFailed history capping
  // ---------------------------------------------------------------------------
  describe('history capping', () => {
    it('caps completedTransfers to 50 entries', () => {
      for (let i = 0; i < 52; i++) {
        const t = makeTransfer({ id: `c${i}` })
        store.addTransfer(t)
        store.updateTransfer(`c${i}`, { status: 'completed' })
      }
      expect(store.completedTransfers).toHaveLength(50)
    })

    it('caps failedTransfers to 50 entries', () => {
      for (let i = 0; i < 52; i++) {
        const t = makeTransfer({ id: `f${i}` })
        store.addTransfer(t)
        store.updateTransfer(`f${i}`, { status: 'failed' })
      }
      expect(store.failedTransfers).toHaveLength(50)
    })

    it('stores newest completed first', () => {
      const t1 = makeTransfer({ id: 'first' })
      const t2 = makeTransfer({ id: 'second' })
      store.addTransfer(t1)
      store.updateTransfer('first', { status: 'completed' })
      store.addTransfer(t2)
      store.updateTransfer('second', { status: 'completed' })
      expect(store.completedTransfers[0].id).toBe('second')
    })
  })

  // ---------------------------------------------------------------------------
  // removeTransfer
  // ---------------------------------------------------------------------------
  describe('removeTransfer', () => {
    it('removes from activeTransfers', () => {
      const t = makeTransfer({ id: 'rm1' })
      store.addTransfer(t)
      store.removeTransfer('rm1')
      expect(store.activeTransfers).toHaveLength(0)
    })

    it('removes from completedTransfers', () => {
      const t = makeTransfer({ id: 'rm2' })
      store.addTransfer(t)
      store.updateTransfer('rm2', { status: 'completed' })
      store.removeTransfer('rm2')
      expect(store.completedTransfers).toHaveLength(0)
    })

    it('removes from failedTransfers', () => {
      const t = makeTransfer({ id: 'rm3' })
      store.addTransfer(t)
      store.updateTransfer('rm3', { status: 'failed' })
      store.removeTransfer('rm3')
      expect(store.failedTransfers).toHaveLength(0)
    })
  })

  // ---------------------------------------------------------------------------
  // clearCompleted / clearAll
  // ---------------------------------------------------------------------------
  describe('clearCompleted', () => {
    it('clears completed transfers only', () => {
      const active = makeTransfer({ id: 'a1' })
      const completed = makeTransfer({ id: 'done1' })
      store.addTransfer(active)
      store.addTransfer(completed)
      store.updateTransfer('done1', { status: 'completed' })
      store.clearCompleted()
      expect(store.completedTransfers).toHaveLength(0)
      expect(store.activeTransfers).toHaveLength(1)
    })
  })

  describe('clearAll', () => {
    it('clears all lists', () => {
      store.addTransfer(makeTransfer({ id: 'a' }))
      const b = makeTransfer({ id: 'b' })
      store.addTransfer(b)
      store.updateTransfer('b', { status: 'completed' })
      store.clearAll()
      expect(store.activeTransfers).toHaveLength(0)
      expect(store.completedTransfers).toHaveLength(0)
      expect(store.failedTransfers).toHaveLength(0)
    })
  })

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------
  describe('getters', () => {
    it('allTransfers combines all lists', () => {
      const t1 = makeTransfer({ id: 'g1' })
      const t2 = makeTransfer({ id: 'g2' })
      const t3 = makeTransfer({ id: 'g3' })
      store.addTransfer(t1)
      store.addTransfer(t2)
      store.updateTransfer('g2', { status: 'completed' })
      store.addTransfer(t3)
      store.updateTransfer('g3', { status: 'failed' })
      expect(store.allTransfers).toHaveLength(3)
    })

    it('activeCount returns count of active transfers', () => {
      store.addTransfer(makeTransfer({ id: 'a1' }))
      store.addTransfer(makeTransfer({ id: 'a2' }))
      expect(store.activeCount).toBe(2)
    })

    it('completedCount returns count of completed transfers', () => {
      const t = makeTransfer({ id: 'done' })
      store.addTransfer(t)
      store.updateTransfer('done', { status: 'completed' })
      expect(store.completedCount).toBe(1)
    })

    it('totalProgress is 0 when no active transfers', () => {
      expect(store.totalProgress).toBe(0)
    })

    it('totalProgress averages active transfer progress', () => {
      store.addTransfer(makeTransfer({ id: 'p1', progress: 40 }))
      store.addTransfer(makeTransfer({ id: 'p2', progress: 80 }))
      expect(store.totalProgress).toBe(60)
    })
  })
})
