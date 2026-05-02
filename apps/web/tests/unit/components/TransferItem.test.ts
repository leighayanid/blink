import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TransferItem from '../../../app/components/TransferItem.vue'
import type { Transfer } from '@blink/types'

const makeTransfer = (overrides: Partial<Transfer> = {}): Transfer => ({
  id: 'test-id',
  fileName: 'document.pdf',
  fileSize: 2097152, // 2 MB
  progress: 50,
  status: 'sending',
  ...overrides,
})

const renderedIconName = (wrapper: ReturnType<typeof mount>) => {
  const stub = wrapper.find('uicon-stub')
  return (stub.exists() ? stub : wrapper.find('uicon')).attributes('name')
}

describe('TransferItem', () => {
  // ---------------------------------------------------------------------------
  // File name and size rendering
  // ---------------------------------------------------------------------------
  it('renders the file name', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ fileName: 'report.pdf' }) } })
    expect(wrapper.text()).toContain('report.pdf')
  })

  it('formats file size in bytes', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ fileSize: 512 }) } })
    expect(wrapper.text()).toContain('512 B')
  })

  it('formats file size in KB', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ fileSize: 2048 }) } })
    expect(wrapper.text()).toContain('2 KB')
  })

  it('formats file size in MB', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ fileSize: 2097152 }) } })
    expect(wrapper.text()).toContain('2 MB')
  })

  it('formats file size of 0 as "0 B"', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ fileSize: 0 }) } })
    expect(wrapper.text()).toContain('0 B')
  })

  // ---------------------------------------------------------------------------
  // Status labels
  // ---------------------------------------------------------------------------
  it('shows Sending label for sending status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'sending' }) } })
    expect(wrapper.text()).toContain('Sending')
  })

  it('shows Receiving label for receiving status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'receiving' }) } })
    expect(wrapper.text()).toContain('Receiving')
  })

  it('shows Done label for completed status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'completed', progress: 100 }) } })
    expect(wrapper.text()).toContain('Done')
  })

  it('shows Failed label for failed status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'failed' }) } })
    expect(wrapper.text()).toContain('Failed')
  })

  it('shows Pending label for pending status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'pending' }) } })
    expect(wrapper.text()).toContain('Pending')
  })

  // ---------------------------------------------------------------------------
  // Progress bar
  // ---------------------------------------------------------------------------
  it('sets progress bar width to the transfer progress', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ progress: 75 }) } })
    const fill = wrapper.find('.progress-fill')
    expect(fill.attributes('style')).toContain('width: 75%')
  })

  it('progress bar has "failed" class for failed status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'failed' }) } })
    const fill = wrapper.find('.progress-fill')
    expect(fill.classes()).toContain('failed')
  })

  // ---------------------------------------------------------------------------
  // Speed display
  // ---------------------------------------------------------------------------
  it('shows speed when provided', () => {
    const wrapper = mount(TransferItem, {
      props: { transfer: makeTransfer({ speed: 1048576 }) } // 1 MB/s
    })
    expect(wrapper.text()).toContain('MB/s')
  })

  it('hides speed element when speed is not provided', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer() } })
    expect(wrapper.find('.speed').exists()).toBe(false)
  })

  // ---------------------------------------------------------------------------
  // Status icons
  // ---------------------------------------------------------------------------
  it('renders a sending icon for "sending" status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'sending' }) } })
    expect(renderedIconName(wrapper)).toBe('i-lucide-send')
  })

  it('renders a download icon for "receiving" status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'receiving' }) } })
    expect(renderedIconName(wrapper)).toBe('i-lucide-download')
  })

  it('renders a check icon for "completed" status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'completed', progress: 100 }) } })
    expect(renderedIconName(wrapper)).toBe('i-lucide-check')
  })

  it('renders an X icon for "failed" status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'failed' }) } })
    expect(renderedIconName(wrapper)).toBe('i-lucide-x')
  })
})
