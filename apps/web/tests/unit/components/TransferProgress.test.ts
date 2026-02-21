import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import TransferProgress from '../../../app/components/TransferProgress.vue'
import { useTransfersStore } from '../../../app/stores/transfers'
import type { Transfer } from '@blink/types'

const makeTransfer = (overrides: Partial<Transfer> = {}): Transfer => ({
  id: `t-${Math.random().toString(36).slice(2)}`,
  fileName: 'file.txt',
  fileSize: 1024,
  progress: 50,
  status: 'sending',
  startTime: Date.now(),
  ...overrides,
})

// TransferProgress imports TransferItem which is a simple component with no
// external deps — we don't need to stub it.
describe('TransferProgress', () => {
  let store: ReturnType<typeof useTransfersStore>
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    // Share ONE Pinia instance so the test store and the component store are the same.
    pinia = createPinia()
    setActivePinia(pinia)
    store = useTransfersStore()
  })

  const mountComp = (props = {}) =>
    mount(TransferProgress, {
      props,
      global: { plugins: [pinia] },
    })

  // ---------------------------------------------------------------------------
  // Empty active state
  // ---------------------------------------------------------------------------
  it('shows empty state when no active transfers', () => {
    const wrapper = mountComp()
    expect(wrapper.text()).toContain('NO ACTIVE TRANSFERS')
  })

  // ---------------------------------------------------------------------------
  // Active transfers tab
  // ---------------------------------------------------------------------------
  it('renders active transfers', () => {
    store.addTransfer(makeTransfer({ id: 'a1', fileName: 'active.txt' }))
    store.addTransfer(makeTransfer({ id: 'a2', fileName: 'active2.txt' }))
    const wrapper = mountComp()
    expect(wrapper.text()).toContain('active.txt')
    expect(wrapper.text()).toContain('active2.txt')
  })

  it('shows badge with active transfer count', () => {
    store.addTransfer(makeTransfer({ id: 'b1' }))
    store.addTransfer(makeTransfer({ id: 'b2' }))
    const wrapper = mountComp()
    expect(wrapper.find('.badge').text()).toBe('2')
  })

  it('does not show badge when no active transfers', () => {
    const wrapper = mountComp()
    expect(wrapper.find('.badge').exists()).toBe(false)
  })

  // ---------------------------------------------------------------------------
  // Tab switching
  // ---------------------------------------------------------------------------
  it('starts on the ACTIVE tab', () => {
    const wrapper = mountComp()
    const activeBtn = wrapper.findAll('.tab-btn').find(b => b.text().includes('ACTIVE'))
    expect(activeBtn?.classes()).toContain('active')
  })

  it('switches to HISTORY tab on click', async () => {
    const wrapper = mountComp()
    const historyBtn = wrapper.findAll('.tab-btn').find(b => b.text().includes('HISTORY'))
    await historyBtn?.trigger('click')
    expect(historyBtn?.classes()).toContain('active')
  })

  it('shows "NO HISTORY" when history tab is empty', async () => {
    const wrapper = mountComp()
    const historyBtn = wrapper.findAll('.tab-btn').find(b => b.text().includes('HISTORY'))
    await historyBtn?.trigger('click')
    expect(wrapper.text()).toContain('NO HISTORY')
  })

  // ---------------------------------------------------------------------------
  // History tab — completed + failed
  // ---------------------------------------------------------------------------
  it('renders completed transfers in history', async () => {
    const t = makeTransfer({ id: 'done1', fileName: 'done.pdf' })
    store.addTransfer(t)
    store.updateTransfer('done1', { status: 'completed', progress: 100 })

    const wrapper = mountComp()
    const historyBtn = wrapper.findAll('.tab-btn').find(b => b.text().includes('HISTORY'))
    await historyBtn?.trigger('click')
    expect(wrapper.text()).toContain('done.pdf')
  })

  it('renders failed transfers in history', async () => {
    const t = makeTransfer({ id: 'fail1', fileName: 'broken.zip' })
    store.addTransfer(t)
    store.updateTransfer('fail1', { status: 'failed' })

    const wrapper = mountComp()
    const historyBtn = wrapper.findAll('.tab-btn').find(b => b.text().includes('HISTORY'))
    await historyBtn?.trigger('click')
    expect(wrapper.text()).toContain('broken.zip')
  })

  // ---------------------------------------------------------------------------
  // Clear history button
  // ---------------------------------------------------------------------------
  it('shows CLEAR HISTORY button in history tab when there are entries', async () => {
    const t = makeTransfer({ id: 'clr1' })
    store.addTransfer(t)
    store.updateTransfer('clr1', { status: 'completed' })

    const wrapper = mountComp()
    const historyBtn = wrapper.findAll('.tab-btn').find(b => b.text().includes('HISTORY'))
    await historyBtn?.trigger('click')
    expect(wrapper.text()).toContain('CLEAR HISTORY')
  })

  it('clears history when CLEAR HISTORY is clicked', async () => {
    const t = makeTransfer({ id: 'clr2', fileName: 'remove-me.txt' })
    store.addTransfer(t)
    store.updateTransfer('clr2', { status: 'completed' })

    const wrapper = mountComp()
    const historyBtn = wrapper.findAll('.tab-btn').find(b => b.text().includes('HISTORY'))
    await historyBtn?.trigger('click')
    const clearBtn = wrapper.find('.clear-btn')
    await clearBtn.trigger('click')
    expect(wrapper.text()).toContain('NO HISTORY')
  })

  // ---------------------------------------------------------------------------
  // embedded prop
  // ---------------------------------------------------------------------------
  it('applies "embedded" class when embedded prop is true', () => {
    const wrapper = mountComp({ embedded: true })
    expect(wrapper.find('.transfer-progress').classes()).toContain('embedded')
  })

  it('does not apply "embedded" class by default', () => {
    const wrapper = mountComp()
    expect(wrapper.find('.transfer-progress').classes()).not.toContain('embedded')
  })
})
