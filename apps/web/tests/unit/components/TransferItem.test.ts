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
  it('shows SENDING label for sending status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'sending' }) } })
    expect(wrapper.text()).toContain('SENDING')
  })

  it('shows RECEIVING label for receiving status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'receiving' }) } })
    expect(wrapper.text()).toContain('RECEIVING')
  })

  it('shows DONE label for completed status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'completed', progress: 100 }) } })
    expect(wrapper.text()).toContain('DONE')
  })

  it('shows FAILED label for failed status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'failed' }) } })
    expect(wrapper.text()).toContain('FAILED')
  })

  it('shows PENDING label for pending status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'pending' }) } })
    expect(wrapper.text()).toContain('PENDING')
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
  // SVG icons
  // ---------------------------------------------------------------------------
  it('renders a sending icon for "sending" status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'sending' }) } })
    // polygon is unique to the send (paper-plane) icon
    expect(wrapper.html()).toContain('polygon')
  })

  it('renders a download icon for "receiving" status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'receiving' }) } })
    // The receiving icon has a polyline "7 10 12 15 17 10"
    expect(wrapper.html()).toContain('7 10 12 15 17 10')
  })

  it('renders a check icon for "completed" status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'completed', progress: 100 }) } })
    // The check icon has a polyline "20 6 9 17 4 12"
    expect(wrapper.html()).toContain('20 6 9 17 4 12')
  })

  it('renders an X icon for "failed" status', () => {
    const wrapper = mount(TransferItem, { props: { transfer: makeTransfer({ status: 'failed' }) } })
    // The X icon has a line from (18,6)→(6,18): x1="18" y1="6" x2="6" y2="18"
    expect(wrapper.html()).toContain('x1="18" y1="6"')
  })
})
