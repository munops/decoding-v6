/** Read only the existing service-worker cache. This helper makes no network request. */
export async function offlineDecoderReady(signal: AbortSignal): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('caches' in window)) return false
  const until = performance.now() + 10000
  const revision = document.querySelector<HTMLMetaElement>(
    'meta[name="application-build"]',
  )?.content
  if (!revision || !/^[a-f0-9]{7,40}$/i.test(revision)) return false
  while (!signal.aborted && performance.now() < until) {
    try {
      for (const key of await caches.keys()) {
        if (!key.startsWith('decoding-v6-shell-')) continue
        const cache = await caches.open(key),
          response = await cache.match('/offline-assets.json')
        if (!response) continue
        const inventory = (await response.json()) as { initial?: unknown; sourceRevision?: string }
        if (
          inventory.sourceRevision !== revision ||
          !Array.isArray(inventory.initial) ||
          inventory.initial.length > 2000 ||
          !inventory.initial.length
        )
          continue
        const paths = inventory.initial.filter(
          (path): path is string => typeof path === 'string' && path.startsWith('/_astro/'),
        )
        if (paths.length !== inventory.initial.length) continue
        if (
          (await Promise.all(paths.map((path) => cache.match(path, { ignoreVary: true })))).every(
            Boolean,
          )
        )
          return true
      }
    } catch {
      return false
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  return false
}
