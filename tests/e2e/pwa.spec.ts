import { expect, test } from '@playwright/test'

test('ships raster install and share presentation with a no-reload worker update', async ({
  page,
}) => {
  const origins = new Set<string>()
  page.on('request', (request) => origins.add(new URL(request.url()).origin))
  await page.goto('/json-format/')
  await expect(page.locator('[data-sponsor]')).toHaveCount(0)
  await expect(page.locator('link[rel="icon"][type="image/png"]')).toHaveAttribute(
    'href',
    '/favicon-32.png',
  )
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    '/apple-touch-icon.png',
  )
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og\.png$/)
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
    'content',
    'summary_large_image',
  )
  const presentation = await page.evaluate(async () => {
    const manifest = await fetch('/manifest.webmanifest').then((response) => response.json())
    const assets = await Promise.all(
      ['/icon-192.png', '/icon-512.png', '/apple-touch-icon.png', '/og.png'].map(async (path) => {
        const response = await fetch(path)
        const bytes = await response.arrayBuffer()
        const view = new DataView(bytes)
        return {
          path,
          status: response.status,
          contentType: response.headers.get('content-type'),
          width: view.getUint32(16),
          height: view.getUint32(20),
        }
      }),
    )
    const worker = await fetch('/sw.js').then((response) => response.text())
    return { manifest, assets, worker }
  })
  expect(presentation.manifest.icons).toEqual([
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ])
  expect(presentation.assets).toEqual([
    expect.objectContaining({
      path: '/icon-192.png',
      status: 200,
      contentType: 'image/png',
      width: 192,
      height: 192,
    }),
    expect.objectContaining({
      path: '/icon-512.png',
      status: 200,
      contentType: 'image/png',
      width: 512,
      height: 512,
    }),
    expect.objectContaining({
      path: '/apple-touch-icon.png',
      status: 200,
      contentType: 'image/png',
      width: 180,
      height: 180,
    }),
    expect.objectContaining({
      path: '/og.png',
      status: 200,
      contentType: 'image/png',
      width: 1200,
      height: 630,
    }),
  ])
  expect(presentation.worker).toContain('sw.skipWaiting()')
  expect(presentation.worker).toContain('sw.clients.claim()')
  expect(presentation.worker).not.toContain('location.reload')
  expect(presentation.worker).toContain('networkFirst(event.request)')
  expect(presentation.worker).toContain('!url.search')
  expect([...origins]).toEqual(['http://127.0.0.1:4321'])
})

test('an online navigation replaces a stale cached document before rendering', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
    const cache = await caches.open('decoding-v6-shell-v3')
    await cache.put(
      '/',
      new Response('<h1>stale shell must not render</h1>', {
        headers: { 'Content-Type': 'text/html' },
      }),
    )
  })
  await page.reload()
  await expect(page.getByRole('heading', { name: /Paste anything/i })).toBeVisible()
  await expect(page.getByText('stale shell must not render')).toHaveCount(0)
  await expect(page.getByLabel('Paste text or drop a file')).toBeVisible()
})

test('core shell and decoder reload offline after explicit service worker install', async ({
  context,
  page,
}) => {
  await page.goto('/')
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
    if (registration.installing)
      await new Promise((resolve) =>
        registration.installing?.addEventListener('statechange', resolve, { once: true }),
      )
  })
  await page.goto('/tools/')
  await expect(page.getByText('47 of 47 tools')).toBeVisible()
  await context.setOffline(true)
  await page.reload()
  await expect(page.getByText('47 of 47 tools')).toBeVisible()
  await context.setOffline(false)
})
