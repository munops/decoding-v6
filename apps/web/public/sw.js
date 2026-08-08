/// <reference lib="webworker" />
/* global ServiceWorkerGlobalScope */

const sw = /** @type {ServiceWorkerGlobalScope} */ (self)
const CACHE = 'decoding-v6-shell-v3'
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
    if (isNavigation(request)) return (await caches.match('/')) ?? Response.error()
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    return await remember(request, await fetch(request))
  } catch {
    return new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } })
  }
}

sw.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([caches.open(CACHE).then((cache) => cache.addAll(CORE)), sw.skipWaiting()]),
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

sw.addEventListener('fetch', (event) => {
  if (!cacheable(event.request)) return
  event.respondWith(
    isNavigation(event.request) || !isImmutableAsset(event.request)
      ? networkFirst(event.request)
      : cacheFirst(event.request),
  )
})
