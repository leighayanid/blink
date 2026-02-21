import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DeviceList from '../../../app/components/DeviceList.vue'
import type { Device } from '@blink/types'

const makeDevice = (overrides: Partial<Device> = {}): Device => ({
  id: `dev-${Math.random().toString(36).slice(2)}`,
  name: 'My Device',
  platform: 'macOS',
  timestamp: Date.now(),
  peerId: undefined,
  ...overrides,
})

describe('DeviceList', () => {
  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------
  it('shows empty state when no devices are provided', () => {
    const wrapper = mount(DeviceList, { props: { devices: [] } })
    expect(wrapper.text()).toContain('NO DEVICES FOUND')
    expect(wrapper.find('.devices-grid').exists()).toBe(false)
  })

  it('shows the network hint in empty state', () => {
    const wrapper = mount(DeviceList, { props: { devices: [] } })
    expect(wrapper.text()).toContain('same network')
  })

  // ---------------------------------------------------------------------------
  // Device cards
  // ---------------------------------------------------------------------------
  it('renders one card per device', () => {
    const devices = [makeDevice({ id: 'a' }), makeDevice({ id: 'b' }), makeDevice({ id: 'c' })]
    const wrapper = mount(DeviceList, { props: { devices } })
    expect(wrapper.findAll('.device-card')).toHaveLength(3)
  })

  it('renders device name', () => {
    const wrapper = mount(DeviceList, { props: { devices: [makeDevice({ name: 'Alice Phone' })] } })
    expect(wrapper.text()).toContain('Alice Phone')
  })

  // ---------------------------------------------------------------------------
  // Platform label
  // ---------------------------------------------------------------------------
  it.each([
    ['Windows', 'WIN'],
    ['macOS', 'MAC'],
    ['Linux', 'LIN'],
    ['Android', 'AND'],
    ['iOS', 'IOS'],
  ])('shows %s platform as "%s"', (platform, label) => {
    const wrapper = mount(DeviceList, { props: { devices: [makeDevice({ platform })] } })
    expect(wrapper.text()).toContain(label)
  })

  it('shows "UNK" for unknown platform', () => {
    const wrapper = mount(DeviceList, { props: { devices: [makeDevice({ platform: 'BeOS' })] } })
    expect(wrapper.text()).toContain('UNK')
  })

  // ---------------------------------------------------------------------------
  // Platform icon
  // ---------------------------------------------------------------------------
  it('renders smartphone icon for Android devices', () => {
    const wrapper = mount(DeviceList, { props: { devices: [makeDevice({ platform: 'Android' })] } })
    // Android uses the smartphone SVG which has a specific rect x="5" y="2" width="14"
    expect(wrapper.html()).toContain('x="5" y="2" width="14"')
  })

  it('renders monitor icon for macOS devices', () => {
    const wrapper = mount(DeviceList, { props: { devices: [makeDevice({ platform: 'macOS' })] } })
    // Monitor SVG has rect x="2" y="3" width="20"
    expect(wrapper.html()).toContain('x="2" y="3" width="20"')
  })

  // ---------------------------------------------------------------------------
  // Status text
  // ---------------------------------------------------------------------------
  it('shows "AVAILABLE" for device with no connection state', () => {
    const wrapper = mount(DeviceList, {
      props: { devices: [makeDevice({ id: 'av', peerId: 'p1' })] }
    })
    expect(wrapper.text()).toContain('AVAILABLE')
  })

  it('shows "CONNECTED" for a connected peer', () => {
    const d = makeDevice({ id: 'conn', peerId: 'p-conn' })
    const wrapper = mount(DeviceList, {
      props: {
        devices: [d],
        connectedPeers: new Set(['p-conn']),
      },
    })
    expect(wrapper.text()).toContain('CONNECTED')
  })

  it('shows "ESTABLISHING..." when connection state is "connecting"', () => {
    const d = makeDevice({ id: 'ing', peerId: 'p-ing' })
    const wrapper = mount(DeviceList, {
      props: {
        devices: [d],
        connectionStates: new Map([['p-ing', 'connecting']]),
      },
    })
    expect(wrapper.text()).toContain('ESTABLISHING')
  })

  it('shows "CONNECTION FAILED" when connection state is "error"', () => {
    const d = makeDevice({ id: 'err', peerId: 'p-err' })
    const wrapper = mount(DeviceList, {
      props: {
        devices: [d],
        connectionStates: new Map([['p-err', 'error']]),
      },
    })
    expect(wrapper.text()).toContain('CONNECTION FAILED')
  })

  // ---------------------------------------------------------------------------
  // Connect button label
  // ---------------------------------------------------------------------------
  it('shows "CONNECT" button for unconnected device with peerId', () => {
    const wrapper = mount(DeviceList, {
      props: { devices: [makeDevice({ peerId: 'p1' })] }
    })
    expect(wrapper.find('.connect-btn').text()).toBe('CONNECT')
  })

  it('shows "DISCONNECT" button for connected device', () => {
    const d = makeDevice({ peerId: 'p-disc' })
    const wrapper = mount(DeviceList, {
      props: {
        devices: [d],
        connectedPeers: new Set(['p-disc']),
      },
    })
    expect(wrapper.find('.connect-btn').text()).toBe('DISCONNECT')
  })

  it('disables connect button when no peerId', () => {
    const wrapper = mount(DeviceList, {
      props: { devices: [makeDevice({ peerId: undefined })] }
    })
    expect(wrapper.find('.connect-btn').attributes('disabled')).toBeDefined()
  })

  it('disables connect button when connecting', () => {
    const d = makeDevice({ id: 'dis', peerId: 'p-dis' })
    const wrapper = mount(DeviceList, {
      props: {
        devices: [d],
        connectionStates: new Map([['p-dis', 'connecting']]),
      },
    })
    expect(wrapper.find('.connect-btn').attributes('disabled')).toBeDefined()
  })

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------
  it('emits "select" when device card is clicked', async () => {
    const d = makeDevice({ id: 'sel-1' })
    const wrapper = mount(DeviceList, { props: { devices: [d] } })
    await wrapper.find('.device-card').trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([d])
  })

  it('emits "connect" when connect button is clicked (not bubbling select)', async () => {
    const d = makeDevice({ id: 'btn-1', peerId: 'p-btn' })
    const wrapper = mount(DeviceList, { props: { devices: [d] } })
    await wrapper.find('.connect-btn').trigger('click')
    expect(wrapper.emitted('connect')?.[0]).toEqual([d])
    // connect button uses @click.stop so it should NOT also emit select
    expect(wrapper.emitted('select')).toBeUndefined()
  })

  // ---------------------------------------------------------------------------
  // Selected device highlight
  // ---------------------------------------------------------------------------
  it('marks the selected device card with "selected" class', () => {
    const d1 = makeDevice({ id: 's1' })
    const d2 = makeDevice({ id: 's2' })
    const wrapper = mount(DeviceList, {
      props: { devices: [d1, d2], selectedDevice: d1 }
    })
    const cards = wrapper.findAll('.device-card')
    expect(cards[0].classes()).toContain('selected')
    expect(cards[1].classes()).not.toContain('selected')
  })

  // ---------------------------------------------------------------------------
  // Connection status dot
  // ---------------------------------------------------------------------------
  it('shows green status dot for connected peer', () => {
    const d = makeDevice({ id: 'dot-conn', peerId: 'p-dot' })
    const wrapper = mount(DeviceList, {
      props: { devices: [d], connectedPeers: new Set(['p-dot']) }
    })
    expect(wrapper.find('.status-indicator.connected').exists()).toBe(true)
  })

  it('shows connecting dot for "connecting" state', () => {
    const d = makeDevice({ id: 'dot-ing', peerId: 'p-ing2' })
    const wrapper = mount(DeviceList, {
      props: {
        devices: [d],
        connectionStates: new Map([['p-ing2', 'connecting']]),
      },
    })
    expect(wrapper.find('.status-indicator.connecting').exists()).toBe(true)
  })
})
