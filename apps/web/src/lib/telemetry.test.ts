import { afterEach, describe, expect, it, vi } from 'vitest'

const memory = () => {
  const entries = new Map<string, string>()
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, text: string) => entries.set(key, text),
    removeItem: (key: string) => entries.delete(key),
  }
}
afterEach(() => {
  vi.unstubAllGlobals()
  vi.resetModules()
})
describe('anonymous counts', () => {
  it('sends only allowlisted names, and opt-out stops requests immediately', async () => {
    const request = vi.fn().mockResolvedValue({})
    vi.stubGlobal('fetch', request)
    vi.stubGlobal('localStorage', memory())
    vi.stubGlobal('location', { pathname: '/' })
    const telemetry = await import('./telemetry')
    telemetry.countOpen('decode_completed')
    telemetry.countOpen('decode_completed')
    expect(request).toHaveBeenCalledTimes(1)
    expect(JSON.parse(request.mock.calls[0]?.[1].body)).toEqual({ name: 'decode_completed' })
    expect(telemetry.setCountingDisabled(true)).toBe(true)
    telemetry.countOpen('share_action')
    expect(request).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('decoding-count-optout')).toBe('true')
  })
  it('expires date without extending it, and never sends date or storage contents', async () => {
    const request = vi.fn().mockResolvedValue({})
    vi.stubGlobal('fetch', request)
    vi.stubGlobal('localStorage', memory())
    vi.stubGlobal('location', { pathname: '/' })
    const telemetry = await import('./telemetry')
    telemetry.countReturn(new Date('2025-01-01T00:00:00Z'))
    telemetry.countReturn(new Date('2025-01-09T00:00:00Z'))
    expect(localStorage.getItem('decoding-first-visit')).toBe('2025-01-01')
    expect(JSON.parse(request.mock.calls[0]?.[1].body)).toEqual({ name: 'return_7d' })
    telemetry.countReturn(new Date('2026-03-01T00:00:00Z'))
    expect(localStorage.getItem('decoding-first-visit')).toBe('2026-03-01')
    localStorage.setItem('decoding-first-visit', '2025-01-31')
    telemetry.countReturn(new Date('2026-02-28T00:00:00Z'))
    expect(localStorage.getItem('decoding-first-visit')).toBe('2026-02-28')
  })
  it('keeps opt-out effective in memory when browser storage is blocked', async () => {
    const request = vi.fn().mockResolvedValue({})
    vi.stubGlobal('fetch', request)
    vi.stubGlobal('location', { pathname: '/' })
    vi.stubGlobal('localStorage', {
      getItem() {
        throw new Error('blocked')
      },
      setItem() {
        throw new Error('blocked')
      },
    })
    const telemetry = await import('./telemetry')
    expect(telemetry.setCountingDisabled(true)).toBe(false)
    telemetry.countOpen('app_open')
    expect(request).not.toHaveBeenCalled()
  })
  it('never sends an event from the proof page', async () => {
    const request = vi.fn()
    vi.stubGlobal('fetch', request)
    vi.stubGlobal('localStorage', memory())
    vi.stubGlobal('location', { pathname: '/proof/' })
    const telemetry = await import('./telemetry')
    telemetry.countOpen('app_open')
    telemetry.countReturn()
    expect(request).not.toHaveBeenCalled()
    expect(localStorage.getItem('decoding-first-visit')).toBeNull()
  })
})
