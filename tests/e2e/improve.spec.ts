import { expect, test } from '@playwright/test'

for (const width of [390, 1440]) {
  test(`final Unicode and URL results are visible and copied at ${width}px`, async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width, height: width === 390 ? 780 : 900 })
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/')
    const input = page.getByLabel('Paste text or drop a file')
    await input.fill('7JWI64WV7ZWY7IS47JqUIOyEuOqzhA==')
    const output = page.locator('.inspector-panel .output-view')
    await expect(output).toHaveText('안녕하세요 세계')
    const result = page.locator('.result-grid')
    await expect.poll(async () => (await result.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(0)
    await expect
      .poll(async () => (await result.boundingBox())?.y ?? 10000)
      .toBeLessThan(width === 390 ? 660 : 780)
    const href = 'https://example.com/a b?q=한글&x=1'
    await input.fill(encodeURIComponent(encodeURIComponent(href)))
    await expect(output).toHaveText(href)
    await page.getByRole('button', { name: 'Copy', exact: true }).click()
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(href)
    await expect(page.locator('[data-sponsor-empty]')).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })
}

test('mobile navigation keeps local records and privacy reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await page.goto('/ko/')
  await page.locator('.mobile-nav summary').click()
  await page.locator('.mobile-nav a[href="/ko/workspace/"]').click()
  await expect(page.getByRole('heading', { name: '넣어 둔 것', exact: true })).toBeVisible()
  await page.goto('/ko/data/')
  await expect(page.getByRole('heading', { name: '이 기기에 남은 것', exact: true })).toBeVisible()
})

test('URL codec defaults to reading encoded text and still offers manual direction', async ({
  page,
}) => {
  await page.goto('/url-codec/')
  await page.locator('.operation-pane textarea').first().fill('%ED%95%9C%EA%B8%80%20test')
  await page.getByRole('button', { name: 'Run locally', exact: true }).click()
  await expect(page.locator('.output-pane .output-view')).toHaveText('한글 test')
})

test('offline install includes the decoder and shows an honest missing-page recovery', async ({
  page,
  context,
}) => {
  await page.goto('/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
    if (!navigator.serviceWorker.controller)
      await new Promise<void>((resolve) =>
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
          once: true,
        }),
      )
  })
  await context.setOffline(true)
  await page.reload()
  await page.getByLabel('Paste text or drop a file').fill('7JWI64WV7ZWY7IS47JqUIOyEuOqzhA==')
  await expect(page.locator('.inspector-panel .output-view')).toHaveText('안녕하세요 세계')
  await page.goto('/not-downloaded-yet/')
  await expect(
    page.getByRole('heading', { name: 'This tool has not been downloaded yet.' }),
  ).toBeVisible()
})
