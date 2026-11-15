import { expect, test } from '@playwright/test'
for (const locale of ['en', 'ko'])
  for (const width of [390, 1440]) {
    test(`local proof ${locale} at ${width}px`, async ({ page, context }, testInfo) => {
      await page.setViewportSize({ width, height: width === 390 ? 780 : 900 })
      await context.grantPermissions(['clipboard-read', 'clipboard-write'])
      const events: string[] = []
      page.on('request', (request) => {
        if (new URL(request.url()).pathname === '/api/event') events.push(request.postData() ?? '')
      })
      await page.goto(`${locale === 'ko' ? '/ko' : ''}/proof/`)
      await expect(page.locator('.answer-final .output-view')).toHaveText('Hello, local world!')
      const matches = page.locator('[data-proof-matches]')
      await expect(matches).toHaveText('0')
      await expect(page.locator('[data-proof-seconds]')).not.toHaveText('0')
      await expect(page.locator('[data-offline-ready]')).toHaveAttribute(
        'data-offline-ready',
        'true',
        { timeout: 20000 },
      )
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
      const toggles = page.locator('[data-count-toggle]')
      await toggles.first().uncheck()
      await expect(toggles.last()).not.toBeChecked()
      await toggles.last().check()
      await expect(toggles.first()).toBeChecked()
      expect(events).toEqual([])
      await page.screenshot({
        path: testInfo.outputPath(`proof-${locale}-${width}.png`),
        fullPage: true,
      })
      await context.setOffline(true)
      await page.locator('#decoder-input').fill('7JWI64WV7ZWY7IS47JqUIOyEuOqzhA==')
      await expect(page.locator('.answer-final .output-view')).toHaveText('안녕하세요 세계')
      await expect(matches).toHaveText('0')
      await page
        .getByRole('button', {
          name: locale === 'ko' ? '풀린 값 복사' : 'Copy decoded value',
          exact: true,
        })
        .click()
      await expect
        .poll(() => page.evaluate(() => navigator.clipboard.readText()))
        .toBe('안녕하세요 세계')
    })
  }
test('positive control detects a synthetic request intercepted before transport', async ({
  page,
}) => {
  await page.route('**/__proof_positive_control__', (route) =>
    route.fulfill({ status: 204, body: '' }),
  )
  await page.goto('/proof/')
  await expect(page.locator('[data-proof-matches]')).toHaveText('0')
  await page.evaluate(async () => {
    await fetch('/__proof_positive_control__', { method: 'POST', body: 'Hello, local world!' })
  })
  await expect(page.locator('[data-proof-matches]')).toHaveText('1')
  await page.locator('#decoder-input').fill('short')
  await expect(page.locator('[data-proof-matches]')).toHaveText('—')
})
