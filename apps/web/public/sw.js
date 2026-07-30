/// <reference lib="webworker" />
/* global ServiceWorkerGlobalScope */

const sw = /** @type {ServiceWorkerGlobalScope} */ (self)
const CACHE = 'decoding-v6-shell-v2'
const CORE = [
  '/',
  '/tools/',
  '/privacy/',
  '/methodology/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/favicon-32.png',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
]

function cacheable(request) {
  const url = new URL(request.url)
  return request.method === 'GET' && url.origin === sw.location.origin && !url.search
}

function cacheResponse(request) {
  return fetch(request).then((response) => {
    if (response.ok && cacheable(request)) {
      const copy = response.clone()
      void caches.open(CACHE).then((cache) => cache.put(request, copy))
    }
    return response
  })
}

sw.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)))
})

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      ),
  )
})

sw.addEventListener('fetch', (event) => {
  if (!cacheable(event.request)) return
  event.respondWith(
    caches
      .match(event.request)
      .then((cached) => cached ?? cacheResponse(event.request))
      .catch(() => caches.match('/')),
  )
})
