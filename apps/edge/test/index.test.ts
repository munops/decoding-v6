import { describe, expect, it, vi } from 'vitest'
import worker from '../src/index'
describe('local-only edge boundaries', () => {
  it('redirects shared POST without ever reading its body', async () => {
    const request = new Request('https://decod.ing/share/', {
      method: 'POST',
      body: 'SHARE_CANARY_NEVER_READ',
    })
    const read = vi.spyOn(request, 'json'),
      text = vi.spyOn(request, 'text'),
      form = vi.spyOn(request, 'formData')
    const assets = { fetch: vi.fn() }
    const response = await worker.fetch(request, { ASSETS: assets })
    expect(response.status).toBe(303)
    expect(response.headers.get('location')).toBe('/')
    expect(read).not.toHaveBeenCalled()
    expect(text).not.toHaveBeenCalled()
    expect(form).not.toHaveBeenCalled()
    expect(assets.fetch).not.toHaveBeenCalled()
  })
  it('writes only fixed event-name counts, never body fields or request identity', async () => {
    const writeDataPoint = vi.fn(),
      env = { ASSETS: { fetch: vi.fn() }, EVENTS: { writeDataPoint } }
    for (const name of [
      'app_open',
      'landing_view',
      'decode_completed',
      'decode_unsupported',
      'return_7d',
      'share_action',
      'sponsor_interest',
    ]) {
      const response = await worker.fetch(
        new Request('https://decod.ing/e/events', {
          method: 'POST',
          body: JSON.stringify({ name, secret: 'NEVER_STORED_CANARY' }),
          headers: { 'content-type': 'application/json' },
        }),
        env,
      )
      expect(response.status).toBe(200)
    }
    expect(writeDataPoint).toHaveBeenCalledTimes(7)
    expect(JSON.stringify(writeDataPoint.mock.calls)).not.toContain('NEVER_STORED_CANARY')
    await worker.fetch(
      new Request('https://decod.ing/e/events', { method: 'POST', body: '{"name":"unknown"}' }),
      env,
    )
    expect(writeDataPoint).toHaveBeenCalledTimes(7)
  })
})
