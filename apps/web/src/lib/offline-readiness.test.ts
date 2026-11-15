import { afterEach, expect, it, vi } from 'vitest'
import { offlineDecoderReady } from './offline-readiness'
afterEach(() => vi.unstubAllGlobals())
function cacheFixture(sourceRevision: string, complete = true) {
  const cache = {
    match: vi.fn(async (path: string) =>
      path === '/offline-assets.json'
        ? {
            json: async () => ({
              sourceRevision,
              initial: ['/_astro/decoder.js', '/_astro/codec.wasm'],
            }),
          }
        : complete
          ? {}
          : undefined,
    ),
  }
  vi.stubGlobal('navigator', { serviceWorker: {} })
  vi.stubGlobal('window', { caches: {} })
  vi.stubGlobal('document', { querySelector: () => ({ content: 'abcdef1234567' }) })
  vi.stubGlobal('caches', {
    keys: async () => ['decoding-v6-shell-current'],
    open: async () => cache,
  })
  return cache
}
it('accepts only a complete cached initial inventory from this exact build', async () => {
  const cache = cacheFixture('abcdef1234567')
  expect(await offlineDecoderReady(new AbortController().signal)).toBe(true)
  expect(cache.match).toHaveBeenCalledWith('/_astro/codec.wasm', { ignoreVary: true })
})
it.each([
  ['old-build', true],
  ['abcdef1234567', false],
])('rejects stale or incomplete cache: %s %s', async (revision, complete) => {
  cacheFixture(revision, complete)
  let tick = 0
  vi.stubGlobal('performance', { now: () => (tick += 6000) })
  expect(await offlineDecoderReady(new AbortController().signal)).toBe(false)
})
it('does not inspect caches after cancellation', async () => {
  const cache = cacheFixture('abcdef1234567'),
    controller = new AbortController()
  controller.abort()
  expect(await offlineDecoderReady(controller.signal)).toBe(false)
  expect(cache.match).not.toHaveBeenCalled()
})
