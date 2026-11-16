import { expect, test } from '@playwright/test'

test('pure tools update immediately, hand the final value to decoding, and keep Korean locale', async ({
  page,
}) => {
  await page.goto('/ko/url-codec/')
  await page.locator('.operation-pane textarea').fill('%ED%95%9C%EA%B8%80%20test')
  await expect(page.locator('.output-pane .output-view')).toHaveText('한글 test')
  await expect(page.getByRole('button', { name: '기기에서 실행' })).toHaveCount(0)
  await page.getByRole('button', { name: '이 결과를 더 풀기', exact: true }).click()
  await page.waitForURL('**/ko/')
  await expect(page.getByLabel('텍스트를 붙여넣거나 파일을 놓으세요')).toHaveValue('한글 test')
  expect(await page.evaluate(() => sessionStorage.getItem('decoding-handoff'))).toBeNull()
})

test('Korean task aliases find repair, QR and formatting tools', async ({ page }) => {
  await page.goto('/ko/tools/')
  const search = page.getByRole('searchbox')
  for (const [term, href] of [
    ['깨짐', '/ko/mojibake-repair/'],
    ['큐알', '/ko/qr-code/'],
    ['줄맞추기', '/ko/json-format/'],
  ]) {
    await search.fill(term!)
    await expect(page.locator(`.tool-card a[href="${href}"]`).first()).toBeVisible()
  }
})

test('classical tools compare shifts and require an explicit Vigenere key', async ({ page }) => {
  await page.goto('/classical-cipher/')
  await page.locator('.operation-pane textarea').fill('Uryyb')
  await expect(page.locator('.output-pane .output-view')).toContainText('Hello')
  await page.locator('.operation-pane textarea').fill('Uryyb')
  await expect(page.locator('.output-pane .output-view')).toContainText('Hello')
  await expect(page.locator('.output-pane .output-view')).toContainText('"shift": 25')
  await page
    .getByRole('combobox', { name: 'Direction', exact: true })
    .first()
    .selectOption('vigenere')
  await page.getByLabel('Your key (letters only)').fill('LEMON')
  await page.locator('.operation-pane textarea').fill('LXFOPVEFRNHR')
  await expect(page.locator('.output-pane .output-view')).toHaveText('ATTACKATDAWN')
})

test('a same-value text edit cancels an older pending tool file read', async ({ page }) => {
  await page.addInitScript(() => {
    const original = File.prototype.arrayBuffer
    File.prototype.arrayBuffer = async function () {
      document.documentElement.dataset.toolFileRead = 'started'
      await new Promise((resolve) => setTimeout(resolve, 500))
      const bytes = await original.call(this)
      document.documentElement.dataset.toolFileRead = 'finished'
      return bytes
    }
  })
  await page.goto('/classical-cipher/')
  await expect(page.locator('.output-pane .output-view')).toContainText('Hello')
  await page.locator('.operation-pane input[type="file"]').setInputFiles({
    name: 'pending.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('late-file-text'),
  })
  await page.waitForFunction(() => document.documentElement.dataset.toolFileRead === 'started')
  await page.locator('.operation-pane textarea').fill('Uryyb')
  await page.waitForFunction(() => document.documentElement.dataset.toolFileRead === 'finished')
  await expect(page.locator('.operation-pane textarea')).toHaveValue('Uryyb')
  await expect(page.locator('.output-pane .output-view')).toContainText('Hello')
})

test('decoder codecs are available immediately after service worker installation', async ({
  page,
  context,
}) => {
  await page.goto('/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await context.setOffline(true)
  const content = Buffer.from('{"offline":true}')
  const n = content.length * 8 + 1
  const zstd = Buffer.from([
    0x28,
    0xb5,
    0x2f,
    0xfd,
    0x20,
    content.length,
    n & 255,
    n >> 8,
    0,
    ...content,
  ]).toString('hex')
  for (const [input, expected] of [
    ['81a16101', '"a": 1'],
    ['d9d9f7a1616101', '"a": 1'],
    ['[package]\nname = "offline-synthetic"\nversion = "1.0.0"', 'offline-synthetic'],
    [zstd, '"offline": true'],
  ]) {
    await page.getByLabel('Paste text or drop a file').fill(input!)
    await expect(page.locator('.answer-final .output-view')).toContainText(expected!)
    await expect(page.locator('.answer-card')).not.toContainText('not cached')
  }
})

test('idle installation caches every current-language tool and its lazy runtime', async ({
  page,
  context,
}) => {
  await page.goto('/ko/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js')
    const registration = await navigator.serviceWorker.ready
    registration.active?.postMessage({ type: 'decoding:cache-tools', locale: 'ko' })
  })
  await expect
    .poll(
      () =>
        page.evaluate(async () => {
          const inventory = await fetch('/offline-assets.json').then((response) => response.json())
          const key = (await caches.keys()).find((key) => key.startsWith('decoding-v6-shell-'))!
          const cache = await caches.open(key)
          const paths: string[] = [
            ...inventory.assets,
            ...inventory.tools.filter((path: string) => path.startsWith('/ko/')),
          ]
          return (
            await Promise.all(paths.map((path) => cache.match(path, { ignoreVary: true })))
          ).every(Boolean)
        }),
      { timeout: 30000 },
    )
    .toBe(true)
  await context.setOffline(true)
  await page.goto('/ko/mojibake-repair/')
  await expect(page.locator('.output-pane .output-view')).toHaveText('한글')
  await page.goto('/ko/classical-cipher/')
  await expect(page.locator('.output-pane .output-view')).toContainText('Hello')
})
