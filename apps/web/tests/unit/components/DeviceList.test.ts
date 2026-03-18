import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DeviceList from '../../../app/components/DeviceList.vue'
import type { Device } from '@blink/types'
import type { ConnectionState } from '../../../app/composables/useWebRTC'

const makeDevice = (overrides: Partial<Device> = {}): Device => ({
  id: `dev-${Math.random().toString(36).slice(2)}`,
  name: 'My Device',
  platform: 'macOS',
  timestamp: Date.now(),
  peerId: undefined,
  ...overrides,
})

// Mock Nuxt UI components
const globalMocks = {
  components: {
    UIcon: {
      template: '<div class="u-icon" :data-name="name"></div>',
      props: ['name']
    },
    UBadge: {
      template: '<div class="u-badge"><slot /></div>',
      props: ['color', 'variant', 'size']
    },
    UButton: {
      template: '<button class="u-button" :disabled="disabled"><slot /></button>',
      props: ['size', 'color', 'variant', 'loading', 'disabled']
    }
  }
}

describe('DeviceList', () => {
  it('shows empty state when no devices are provided', () => {
    const wrapper = mount(DeviceList, { 
      props: { devices: [] },
      global: globalMocks
    })
    expect(wrapper.text()).toContain('No devices')
    expect(wrapper.text()).toContain('Ensure nearby devices are on the same local network.')
  })

  it('renders one card per device', () => {
    const devices = [makeDevice({ id: 'a' }), makeDevice({ id: 'b' }), makeDevice({ id: 'c' })]
    const wrapper = mount(DeviceList, { 
      props: { devices },
      global: globalMocks
    })
    // Each device is in a div with transition classes
    expect(wrapper.findAll('.cursor-pointer')).toHaveLength(3)
  })

  it('renders device name', () => {
    const wrapper = mount(DeviceList, { 
      props: { devices: [makeDevice({ name: 'Alice Phone' })] },
      global: globalMocks
    })
    expect(wrapper.text()).toContain('Alice Phone')
  })

  it.each([
    ['Windows', 'WIN'],
    ['macOS', 'MAC'],
    ['Linux', 'LIN'],
    ['Android', 'AND'],
    ['iOS', 'IOS'],
  ])('shows %s platform as "%s"', (platform, label) => {
    const wrapper = mount(DeviceList, { 
      props: { devices: [makeDevice({ platform })] },
      global: globalMocks
    })
    expect(wrapper.text()).toContain(label)
  })

  it('renders smartphone icon for Android devices', () => {
    const wrapper = mount(DeviceList, { 
      props: { devices: [makeDevice({ platform: 'Android' })] },
      global: globalMocks
    })
    const icon = wrapper.find('.u-icon')
    expect(icon.attributes('data-name')).toBe('i-lucide-smartphone')
  })

  it('renders monitor icon for macOS devices', () => {
    const wrapper = mount(DeviceList, { 
      props: { devices: [makeDevice({ platform: 'macOS' })] },
      global: globalMocks
    })
    const icon = wrapper.find('.u-icon')
    expect(icon.attributes('data-name')).toBe('i-lucide-monitor')
  })

  it('shows "Available" for device with no connection state', () => {
    const wrapper = mount(DeviceList, {
      props: { devices: [makeDevice({ id: 'av', peerId: 'p1' })] },
      global: globalMocks
    })
    expect(wrapper.text()).toContain('Available')
  })

  it('shows "Connected" for a connected peer', () => {
    const d = makeDevice({ id: 'conn', peerId: 'p-conn' })
    const wrapper = mount(DeviceList, {
      props: {
        devices: [d],
        connectedPeers: new Set(['p-conn']),
      },
      global: globalMocks
    })
    expect(wrapper.text()).toContain('Connected')
  })

  it('shows "Connecting" when connection state is "connecting"', () => {
    const d = makeDevice({ id: 'ing', peerId: 'p-ing' })
    const wrapper = mount(DeviceList, {
      props: {
        devices: [d],
        connectionStates: new Map<string, ConnectionState>([['p-ing', 'connecting']]),
      },
      global: globalMocks
    })
    expect(wrapper.text()).toContain('Connecting')
  })

  it('shows "Failed" when connection state is "error"', () => {
    const d = makeDevice({ id: 'err', peerId: 'p-err' })
    const wrapper = mount(DeviceList, {
      props: {
        devices: [d],
        connectionStates: new Map<string, ConnectionState>([['p-err', 'error']]),
      },
      global: globalMocks
    })
    expect(wrapper.text()).toContain('Failed')
  })

  it('shows "CONNECT" button for unconnected device with peerId', () => {
    const wrapper = mount(DeviceList, {
      props: { devices: [makeDevice({ peerId: 'p1' })] },
      global: globalMocks
    })
    expect(wrapper.find('.u-button').text()).toBe('CONNECT')
  })

  it('shows "DISCONNECT" button for connected device', () => {
    const d = makeDevice({ peerId: 'p-disc' })
    const wrapper = mount(DeviceList, {
      props: {
        devices: [d],
        connectedPeers: new Set(['p-disc']),
      },
      global: globalMocks
    })
    expect(wrapper.find('.u-button').text()).toBe('DISCONNECT')
  })

  it('disables connect button when no peerId', () => {
    const wrapper = mount(DeviceList, {
      props: { devices: [makeDevice({ peerId: undefined })] },
      global: globalMocks
    })
    expect(wrapper.find('.u-button').attributes('disabled')).toBeDefined()
  })

  it('emits "select" when device card is clicked', async () => {
    const d = makeDevice({ id: 'sel-1' })
    const wrapper = mount(DeviceList, { 
      props: { devices: [d] },
      global: globalMocks
    })
    await wrapper.find('.cursor-pointer').trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([d])
  })

  it('emits "connect" when connect button is clicked', async () => {
    const d = makeDevice({ id: 'btn-1', peerId: 'p-btn' })
    const wrapper = mount(DeviceList, { 
      props: { devices: [d] },
      global: globalMocks
    })
    await wrapper.find('.u-button').trigger('click')
    expect(wrapper.emitted('connect')?.[0]).toEqual([d])
  })
})
