import { syntheticJpeg } from '../../packages/fixtures-public/src/file-samples'
import { expect, test } from '@playwright/test'

test('photo example reads its QR locally before interpreting the embedded address', async ({
  page,
}) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url()))
  await page.goto('/ko/')
  await page.locator('[data-sample-id="qr"]').click()
  await expect(page.locator('.answer-verdict')).toContainText('사진에서 QR을 읽었어요')
  await expect(page.locator('.answer-final .output-view')).toHaveText('https://example.invalid/')
  expect(requests.every((url) => !url.startsWith('https://example.invalid'))).toBe(true)
})

test('a delayed file read cannot replace a more recent pasted value', async ({ page }) => {
  await page.addInitScript(() => {
    const original = File.prototype.arrayBuffer
    File.prototype.arrayBuffer = async function () {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return original.call(this)
    }
  })
  await page.goto('/')
  await page
    .locator('input[type=file]')
    .last()
    .setInputFiles({
      name: 'slow.txt',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('SGVsbG8='),
    })
  await page.getByLabel('Paste text or drop a file').fill('{"recent":true}')
  await expect(page.locator('.answer-final .output-view')).toContainText('recent')
  await page.waitForTimeout(400)
  await expect(page.locator('.answer-final .output-view')).toContainText('recent')
})

test('installed service worker receives a shared file without sending it to the server', async ({
  page,
}) => {
  await page.goto('/')
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
  })
  await page.reload()
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller))
  const response = page.waitForResponse(
    (response) => response.url().endsWith('/share/') && response.request().method() === 'POST',
  )
  await page.evaluate(() => {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = '/share/'
    form.enctype = 'multipart/form-data'
    const input = document.createElement('input')
    input.type = 'file'
    input.name = 'files'
    const transfer = new DataTransfer()
    transfer.items.add(new File(['SGVsbG8='], 'shared-local.txt', { type: 'text/plain' }))
    input.files = transfer.files
    form.append(input)
    document.body.append(form)
    form.submit()
  })
  expect((await response).fromServiceWorker()).toBe(true)
  await page.waitForURL('**/#share')
  await expect(page.locator('.answer-final .output-view')).toHaveText('Hello')
})

test('a real JPEG container exposes local EXIF location without upload', async ({ page }) => {
  const requests: string[] = []
  page.on('request', (request) => requests.push(`${request.url()} ${request.postData() ?? ''}`))
  await page.goto('/')
  const original = await page.evaluate(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 24
    canvas.height = 16
    canvas.getContext('2d')!.fillRect(0, 0, 24, 16)
    return Array.from(atob(canvas.toDataURL('image/jpeg').split(',')[1]!), (c) => c.charCodeAt(0))
  })
  const file = Buffer.concat([
    Buffer.from(original.slice(0, 2)),
    Buffer.from(syntheticJpeg().slice(2, 412)),
    Buffer.from(original.slice(2)),
  ])
  await page
    .locator('input[type=file]')
    .first()
    .setInputFiles({ name: 'synthetic-location.jpg', mimeType: 'image/jpeg', buffer: file })
  await expect(page.locator('.answer-concerns')).toContainText('This photo contains its location')
  await expect(page.locator('.answer-facts')).toContainText('Synth Local')
  await expect(page.locator('.answer-facts')).toContainText('37.5')
  expect(
    requests.some(
      (request) => request.includes('Synth Local') || request.includes(file.toString('base64')),
    ),
  ).toBe(false)
})
