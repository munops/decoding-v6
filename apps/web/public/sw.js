/// <reference lib="webworker" />
/* global ServiceWorkerGlobalScope */

const sw = /** @type {ServiceWorkerGlobalScope} */ (self)
const CACHE = 'decoding-v6-shell-v6'
const shares = new Map()
const CORE = [
  '/',
  '/tools/',
  '/privacy/',
  '/terms/',
  '/support/',
  '/methodology/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/favicon-32.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/offline/',
  ...['ko', 'ja', 'zh-cn', 'es', 'pt-br', 'de', 'fr'].map((locale) => `/${locale}/offline/`),
]

function cacheable(request) {
  const url = new URL(request.url)
  return request.method === 'GET' && url.origin === sw.location.origin && !url.search
}

function isNavigation(request) {
  return request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')
}

function isImmutableAsset(request) {
  return new URL(request.url).pathname.startsWith('/_astro/')
}

async function remember(request, response) {
  if (response.ok && cacheable(request)) {
    const cache = await caches.open(CACHE)
    await cache.put(request, response.clone())
  }
  return response
}

async function networkFirst(request) {
  try {
    return await remember(request, await fetch(request))
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    if (isNavigation(request)) {
      const locale = /^\/(ko|ja|zh-cn|es|pt-br|de|fr)\//.exec(new URL(request.url).pathname)?.[1]
      const fallback = await caches.match(locale ? `/${locale}/offline/` : '/offline/')
      return fallback
        ? new Response(await fallback.text(), {
            status: 503,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          })
        : Response.error()
    }
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
  }
}

async function cacheFirst(request) {
  // Hashed same-origin assets are representation-invariant; dev servers add Vary: Origin.
  const cached = await caches.match(request, { ignoreVary: true })
  if (cached) return cached
  try {
    return await remember(request, await fetch(request))
  } catch {
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
  }
}

sw.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE).then(async (cache) => {
        await cache.addAll(CORE)
        const inventory = await fetch('/offline-assets.json').then((response) => response.json())
        await cache.addAll(inventory.initial)
      }),
      sw.skipWaiting(),
    ]),
  )
})

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches
        .keys()
        .then((keys) =>
          Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
        ),
      sw.clients.claim(),
    ]),
  )
})

sw.addEventListener('message', (event) => {
  if (event.data?.type === 'decoding:cache-tools') {
    const locale = ['ko', 'ja', 'zh-cn', 'es', 'pt-br', 'de', 'fr'].includes(event.data.locale)
      ? event.data.locale
      : 'en'
    event.waitUntil(
      (async () => {
        const inventory = await fetch('/offline-assets.json').then((response) => response.json())
        const cache = await caches.open(CACHE)
        for (const path of inventory.assets) {
          if (!(await cache.match(path, { ignoreVary: true }))) {
            try {
              await cache.add(path)
            } catch {
              /* Retry on the next connected visit. */
            }
          }
        }
        for (const path of inventory.tools) {
          const pathLocale = /^\/(ko|ja|zh-cn|es|pt-br|de|fr)\//.exec(path)?.[1] ?? 'en'
          if (pathLocale === locale && !(await cache.match(path)))
            try {
              await cache.add(path)
            } catch {
              /* Retry on the next connected visit. */
            }
        }
      })(),
    )
    return
  }
  if (event.data?.type !== 'decoding:take-share') return
  const id = event.source?.id
  const share = id ? shares.get(id) : null
  if (id) shares.delete(id)
  event.ports[0]?.postMessage(share ?? null)
})

sw.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (
    url.origin === sw.location.origin &&
    url.pathname === '/share/' &&
    event.request.method === 'POST'
  ) {
    event.respondWith(
      (async () => {
        try {
          const form = await event.request.formData()
          const text = [form.get('text'), form.get('url')]
            .filter((value) => typeof value === 'string')
            .join('\n')
          const file = form
            .getAll('files')
            .find((item) => item instanceof File && item.size > 0 && item.size <= 10 * 1024 * 1024)
          if (event.resultingClientId && (text || file) && text.length <= 10 * 1024 * 1024) {
            if (shares.size >= 16) shares.delete(shares.keys().next().value)
            shares.set(event.resultingClientId, { text, ...(file ? { file } : {}) })
            setTimeout(() => shares.delete(event.resultingClientId), 60000)
          }
        } catch {
          /* The home screen offers explicit paste recovery. */
        }
        return Response.redirect(new URL('/#share', sw.location.origin), 303)
      })(),
    )
    return
  }
  if (!cacheable(event.request)) return
  event.respondWith(
    isNavigation(event.request) || !isImmutableAsset(event.request)
      ? networkFirst(event.request)
      : cacheFirst(event.request),
  )
})
