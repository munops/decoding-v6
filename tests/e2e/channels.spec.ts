import { chromium, expect, test } from '@playwright/test'
import { resolve } from 'node:path'

test('unpacked extension decodes locally and keeps values out of requests and storage', async ({}, testInfo) => {
  const extension = resolve('apps/extension/dist')
  const context = await chromium.launchPersistentContext(testInfo.outputPath('extension-profile'), {
    channel: 'chromium',
    headless: true,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`],
    viewport: { width: 1280, height: 800 },
  })
  try {
    const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'))
    const id = new URL(worker.url()).host
    const requests: string[] = []
    context.on('request', (request) =>
      requests.push(`${request.url()} ${request.postData() ?? ''}`),
    )
    const page = await context.newPage()
    await page.goto(`chrome-extension://${id}/result.html`)
    const decoded = 'channel-canary-83: 안녕하세요'
    const encoded = Buffer.from(decoded).toString('base64')
    await page.locator('#input').fill(encoded)
    await expect(page.locator('#output')).toHaveText(decoded)
    await expect(page.locator('#summary')).toContainText('Base64')
    expect(
      requests.every((request) => !request.includes(decoded) && !request.includes(encoded)),
    ).toBe(true)
    expect(requests.every((request) => request.startsWith('chrome-extension://'))).toBe(true)
    const storage = await page.evaluate(async () => {
      const api = (
        globalThis as unknown as {
          chrome: {
            storage: {
              local: { get: (key: null) => Promise<unknown> }
              session: { get: (key: null) => Promise<unknown> }
            }
          }
        }
      ).chrome
      return [
        await api.storage.local.get(null),
        await api.storage.session.get(null),
        localStorage.length,
        sessionStorage.length,
      ]
    })
    expect(JSON.stringify(storage)).not.toContain('channel-canary')
    expect(storage).toEqual([{}, {}, 0, 0])
    await page.locator('#input').fill('7JWI64WV7ZWY7IS47JqUIOyEuOqzhA==')
    await expect(page.locator('#output')).toHaveText('안녕하세요 세계')
    await page.screenshot({ path: testInfo.outputPath('extension-1280x800.png') })
  } finally {
    await context.close()
  }
})

for (const locale of ['en', 'ko']) {
  for (const slug of ['fix-garbled-text', 'decode-mail-subject', 'normalize-korean-filename']) {
    test(`${locale}/${slug} provides a real initial answer and three examples`, async ({
      page,
    }) => {
      await page.goto(`${locale === 'ko' ? '/ko' : ''}/${slug}/`)
      await expect(page.locator('.answer-final .output-view')).not.toBeEmpty()
      await expect(page.locator('[data-sample-id]')).toHaveCount(3)
      await expect(page.locator('.recovery-content img')).toBeVisible()
      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(3)
    })
  }
}
