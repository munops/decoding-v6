import { describe, expect, it, vi } from 'vitest'
import { decode } from '@decoding/engine'
import { createProofObservation } from './proof-observation'
function fixture() {
  let time = 0
  const request = vi.fn().mockResolvedValue({ ok: true })
  const scope = {
    fetch: request,
    Request,
    navigator: {},
    XMLHttpRequest: undefined,
    PerformanceObserver: undefined,
  } as unknown as Window & typeof globalThis
  const observer = createProofObservation(() => time)
  const stop = observer.start(scope)
  return {
    observer,
    scope,
    request,
    stop,
    advance: () => {
      time += 2300
    },
  }
}
describe('memory-only current-value observation', () => {
  it('detects URL, readable body, headers and common encodings without exposing values', async () => {
    const { observer, stop, advance } = fixture()
    observer.setInput('synthetic + credential')
    await observer.observeApi('/plain', 'unrelated')
    expect(observer.snapshot().matches).toBe(0)
    await observer.observeApi('/?q=synthetic%20%2B%20credential')
    await observer.observeApi('/body', JSON.stringify({ text: 'synthetic + credential' }))
    await observer.observeApi('/headers', undefined, { authorization: 'synthetic + credential' })
    observer.observeResource('/asset?text=synthetic%20%2B%20credential')
    advance()
    expect(observer.snapshot()).toMatchObject({ matches: 4, calls: 4, resources: 1, seconds: 2 })
    expect(JSON.stringify(observer.snapshot())).not.toContain('synthetic')
    stop()
    expect(observer.snapshot()).toMatchObject({ running: false, inputKind: 'none' })
  })
  it('resets for each input, rejects stale result work and deduplicates observed API resources', async () => {
    const { observer, stop } = fixture()
    const revision = observer.setInput('SGVsbG8sIHdvcmxkIQ==')
    observer.addResult(await decode('SGVsbG8sIHdvcmxkIQ=='), revision)
    await observer.observeApi('/body', 'Hello, world!')
    expect(observer.snapshot().matches).toBe(1)
    observer.setInput('another synthetic value')
    observer.addResult(await decode('SGVsbG8sIHdvcmxkIQ=='), revision)
    await observer.observeApi('/body', 'Hello, world!')
    expect(observer.snapshot().matches).toBe(0)
    await observer.observeApi('/?q=another%20synthetic%20value')
    observer.observeResource('/?q=another%20synthetic%20value')
    expect(observer.snapshot().matches).toBe(1)
    stop()
  })
  it('records limits rather than inventing a zero for unsupported bodies and oversized URLs', async () => {
    const { observer, stop } = fixture()
    observer.setInput('short')
    expect(observer.snapshot().inputKind).toBe('short')
    observer.setInput(new Uint8Array(20), 'file')
    expect(observer.snapshot().inputKind).toBe('file')
    observer.setInput('synthetic eligible text')
    await observer.observeApi('/body', { opaque: true })
    await observer.observeApi('/' + 'a'.repeat(65537))
    expect(observer.snapshot().uninspected).toBe(2)
    expect(observer.snapshot().coverage).toMatchObject({
      fetch: true,
      xhr: false,
      beacon: false,
      resources: false,
    })
    stop()
  })
  it('forwards arguments and return identity and restores its own wrapper', () => {
    const { observer, scope, request, stop } = fixture()
    observer.setInput('synthetic eligible text')
    const init = { method: 'POST', body: 'synthetic eligible text' }
    const result = Reflect.apply(scope.fetch, scope, ['/local-test', init])
    expect(request).toHaveBeenCalledWith('/local-test', init)
    expect(result).toBe(request.mock.results[0]!.value)
    stop()
    expect(scope.fetch).toBe(request)
  })
})
