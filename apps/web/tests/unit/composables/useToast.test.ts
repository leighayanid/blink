import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// Reset module between test groups so singleton state is fresh.
describe('useToast', () => {
  let useToast: typeof import('../../../app/composables/useToast').useToast

  beforeEach(async () => {
    vi.resetModules()
    vi.useFakeTimers()
    const mod = await import('../../../app/composables/useToast')
    useToast = mod.useToast
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('showToast adds a toast with correct fields', () => {
    const { toasts, showToast } = useToast()
    showToast('info', 'Hello!', 3000)
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].type).toBe('info')
    expect(toasts.value[0].message).toBe('Hello!')
    expect(toasts.value[0].duration).toBe(3000)
  })

  it('showToast returns the generated id', () => {
    const { toasts, showToast } = useToast()
    const id = showToast('success', 'Done')
    expect(toasts.value[0].id).toBe(id)
  })

  it('removeToast removes the correct toast', () => {
    const { toasts, showToast, removeToast } = useToast()
    const id1 = showToast('info', 'First', 0)
    const id2 = showToast('error', 'Second', 0)
    removeToast(id1)
    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].id).toBe(id2)
  })

  it('removeToast is a no-op for unknown id', () => {
    const { toasts, showToast, removeToast } = useToast()
    showToast('info', 'msg', 0)
    removeToast('nonexistent')
    expect(toasts.value).toHaveLength(1)
  })

  it('auto-removes toast after duration', () => {
    const { toasts, showToast } = useToast()
    showToast('info', 'gone', 1000)
    expect(toasts.value).toHaveLength(1)
    vi.advanceTimersByTime(1000)
    expect(toasts.value).toHaveLength(0)
  })

  it('does NOT auto-remove when duration is 0', () => {
    const { toasts, showToast } = useToast()
    showToast('info', 'persistent', 0)
    vi.advanceTimersByTime(10000)
    expect(toasts.value).toHaveLength(1)
  })

  it('success() helper creates a success toast', () => {
    const { toasts, success } = useToast()
    success('All good')
    expect(toasts.value[0].type).toBe('success')
    expect(toasts.value[0].message).toBe('All good')
  })

  it('error() helper creates an error toast', () => {
    const { toasts, error } = useToast()
    error('Oops')
    expect(toasts.value[0].type).toBe('error')
  })

  it('info() helper creates an info toast', () => {
    const { toasts, info } = useToast()
    info('FYI')
    expect(toasts.value[0].type).toBe('info')
  })

  it('warning() helper creates a warning toast', () => {
    const { toasts, warning } = useToast()
    warning('Watch out')
    expect(toasts.value[0].type).toBe('warning')
  })

  it('multiple toasts stack independently', () => {
    const { toasts, showToast } = useToast()
    showToast('info', 'A', 0)
    showToast('success', 'B', 0)
    showToast('error', 'C', 0)
    expect(toasts.value).toHaveLength(3)
  })
})
