import { runTool } from './ui-helpers'
import { expect, test } from '@playwright/test'

for (const width of [390, 1440]) {
  test(`final Unicode and URL results are visible and copied at ${width}px`, async ({
    page,
    context,
  }, testInfo) => {
    await page.setViewportSize({ width, height: width === 390 ? 780 : 900 })
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/')
    const input = page.getByLabel('Paste text or drop a file')
    await input.fill('7JWI64WV7ZWY7IS47JqUIOyEuOqzhA==')
    const output = page.locator('.answer-final .output-view')
    await expect(output).toHaveText('안녕하세요 세계')
    const result = page.locator('.answer-card')
    await expect.poll(async () => (await result.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(0)
    await expect
      .poll(async () => (await result.boundingBox())?.y ?? 10000)
      .toBeLessThan(width === 390 ? 660 : 780)
    const href = 'https://example.com/a b?q=한글&x=1'
    await input.fill(encodeURIComponent(encodeURIComponent(href)))
    await expect(output).toHaveText(href)
    await page.getByRole('button', { name: 'Copy decoded value', exact: true }).click()
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(href)
    await expect(page.locator('[data-sponsor-empty]')).toHaveCount(0)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`answer-${width}.png`) })
  })
}

test('mobile navigation keeps local records and privacy reachable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 780 })
  await page.goto('/ko/')
  await page.locator('.bottom-tabs a[href="/ko/workspace/"]').click()
  await expect(page.getByRole('heading', { name: '넣어 둔 것', exact: true })).toBeVisible()
  await page.goto('/ko/data/')
  await expect(page.getByRole('heading', { name: '이 기기에 남은 것', exact: true })).toBeVisible()
})

test('URL codec defaults to reading encoded text and still offers manual direction', async ({
  page,
}) => {
  await page.goto('/url-codec/')
  await page.locator('.operation-pane textarea').first().fill('%ED%95%9C%EA%B8%80%20test')
  await runTool(page)
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
  await expect(page.locator('.answer-final .output-view')).toHaveText('안녕하세요 세계')
  await page.goto('/not-downloaded-yet/')
  await expect(
    page.getByRole('heading', { name: 'This tool has not been downloaded yet.' }),
  ).toBeVisible()
})

test('an uncertain hash gets a provisional answer and a reachable advanced view', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByLabel('Paste text or drop a file').fill('a'.repeat(32))
  await expect(page.locator('.answer-verdict')).toContainText('hash')
  await expect(page.locator('.answer-verdict')).toContainText('not certain')
  await expect(page.locator('.advanced-result')).not.toHaveAttribute('open', '')
  await page.locator('.advanced-result > summary').click()
  await expect(page.getByRole('tree', { name: 'Decode chain' })).toBeVisible()
})

test('More exposes explicit appearance choices and seven examples are real controls', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('[data-sample-id]')).toHaveCount(7)
  await page.goto('/more/')
  await page.locator('[data-more-theme]').click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await page.locator('[data-large-text]').click()
  await expect(page.locator('html')).toHaveAttribute('data-text-size', 'large')
  await page.goto('/')
  await expect(page.locator('html')).toHaveAttribute('data-text-size', 'large')
})

for (const width of [390, 1440]) {
  test(`Korean text recovery and mail facts stay local at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 780 : 900 })
    await page.goto('/ko/')
    const input = page.getByLabel('텍스트를 붙여넣거나 파일을 놓으세요')
    const field = (await input.count()) ? input : page.locator('.decoder-input textarea')
    for (const [source, output] of [
      [
        new TextDecoder('windows-1252').decode(new TextEncoder().encode('안녕하세요 세계')),
        '안녕하세요 세계',
      ],
      ['ÇÑ±Û º¯È¯', '한글 변환'],
      ['°¡³ª´Ù', '가나다'],
      ['%C7%D1%B1%DB', '한글'],
      ['한글 파일.txt'.normalize('NFD'), '한글 파일.txt'],
      ['=?UTF-8?B?7ZWc6riA?=', '한글'],
    ]) {
      await field.fill(source!)
      await expect(page.locator('.answer-final .output-view')).toHaveText(output!)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      )
    }
    await field.fill(
      'From: sender@example.test\nTo: local@example.test\nSubject: =?UTF-8?B?7ZWc6riA?=\nReceived: by relay.example.test',
    )
    await expect(page.locator('.answer-card h2')).toContainText('메일 머리말')
    await expect(page.locator('.answer-facts')).toContainText('한글')
  })
}

for (const width of [390, 1440])
  test(`expanded formats keep plain answers and color preview at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 390 ? 780 : 900 })
    await page.goto('/ko/')
    await expect(page.locator('.decoder-shell')).toHaveAttribute('data-hydrated', 'true')
    const field = page.getByLabel('텍스트를 붙여넣거나 파일을 놓으세요')
    await field.fill('01001000 01101001')
    await expect(page.locator('.answer-final .output-view')).toHaveText('Hi')
    await field.fill('355 225 234 352 270 200')
    await expect(page.locator('.answer-final .output-view')).toHaveText('한글')
    await field.fill(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Safari/604.1',
    )
    await expect(page.locator('.answer-verdict')).toContainText('iPhone의 Safari 17.0')
    await expect(page.locator('.answer-facts')).toContainText('운영체제')
    await field.fill('#ff8800')
    await expect(page.locator('.answer-verdict')).toContainText('색을 적은 값')
    const swatch = page.getByRole('img', { name: '색 견본: #ff8800' })
    await expect(swatch).toBeVisible()
    await expect(swatch).toHaveCSS('background-color', 'rgb(255, 136, 0)')
    await expect(page.locator('.answer-final .output-view')).toContainText('hsl(')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  })

for (const width of [390, 1440]) {
  test(`DER possible key contents stay out of results and clipboard at ${width}px`, async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width, height: width === 390 ? 780 : 900 })
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/')
    await expect(page.locator('.decoder-shell')).toHaveAttribute('data-hydrated', 'true')
    const canary = 'DER_PRIVATE_BROWSER_CANARY_3951'
    const body = Buffer.from(canary)
    const buffer = Buffer.concat([Buffer.from([48, body.length + 2, 4, body.length]), body])
    await page
      .locator('input[type="file"]')
      .first()
      .setInputFiles({ name: 'synthetic.der', mimeType: 'application/octet-stream', buffer })
    await expect(page.locator('.answer-verdict')).toContainText('ASN.1 DER')
    await expect(page.locator('.answer-card')).not.toContainText(canary)
    await page.getByRole('button', { name: 'Copy decoded value', exact: true }).click()
    expect(await page.evaluate(() => navigator.clipboard.readText())).not.toContain(canary)
    await page.locator('.advanced-result > summary').click()
    await expect(page.locator('.inspector-panel')).not.toContainText(canary)
    await expect(
      page.locator('.inspector-panel .hex-dump, .inspector-panel .byte-map'),
    ).toHaveCount(0)
    await page.getByLabel('Paste text or drop a file').fill(buffer.toString('base64'))
    await expect(page.locator('.answer-verdict')).toContainText('ASN.1 DER')
    await expect(page.locator('.answer-card')).not.toContainText(buffer.toString('base64'))
  })
}
