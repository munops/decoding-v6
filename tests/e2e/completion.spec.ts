import { createHmac } from 'node:crypto'
import { brotliCompressSync } from 'node:zlib'
import { expect, test } from '@playwright/test'
test.use({ viewport: { width: 390, height: 844 } })
const encoded = (value: string) => Buffer.from(value).toString('base64url')
test('unsigned JWT danger links to an explanation and HS512 verifies locally', async ({ page }) => {
  const key = 'synthetic-local-verification-key',
    header = encoded('{"alg":"HS512"}'),
    payload = encoded('{"sub":"synthetic","exp":1600000000}'),
    signing = `${header}.${payload}`,
    token = `${signing}.${createHmac('sha512', key).update(signing).digest('base64url')}`
  const requests: string[] = []
  page.on('request', (request) => requests.push(request.url() + ' ' + (request.postData() ?? '')))
  await page.goto('/')
  await page.getByLabel('Paste text or drop a file').fill(token)
  await page.locator('.jwt-verifier summary').click()
  await page.getByLabel('Test secret / public key / JWK').fill(key)
  await page.getByRole('button', { name: 'Verify JWT signature', exact: true }).click()
  await expect(page.getByText('Signature verified with this key.')).toBeVisible()
  await page.getByLabel('Test secret / public key / JWK').fill('wrong synthetic key')
  await page.getByRole('button', { name: 'Verify JWT signature', exact: true }).click()
  await expect(page.getByText('Signature does not match this key.')).toBeVisible()
  expect(requests.join('\n')).not.toContain(key)
  expect(
    await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage })),
  ).not.toContain(key)
  await page
    .getByLabel('Paste text or drop a file')
    .fill(`${encoded('{"alg":"none"}')}.${payload}.`)
  await expect(page.locator('.result-alert').filter({ hasText: 'JWT-ALG-NONE' })).toBeVisible()
  await page.locator('.result-alert a').filter({ hasText: 'JWT-ALG-NONE' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Unsigned token')
})
test('result save, reopen, edit, backup, delete and restore preserve redaction', async ({
  page,
}) => {
  await page.goto('/')
  await page
    .getByLabel('Paste text or drop a file')
    .fill('{"token":"synthetic-DO-NOT-STORE","count":42}')
  await page.getByLabel('Paste text or drop a file').blur()
  await page.getByRole('button', { name: 'More', exact: true }).click()
  await page.getByRole('button', { name: 'Save structure', exact: true }).click()
  await expect(page.getByText('Redacted structure saved on this device.')).toBeVisible()
  await page.getByRole('link', { name: 'Open saved records' }).click()
  await page.getByRole('button', { name: 'Open / edit', exact: true }).click()
  await page.getByLabel('Name', { exact: true }).fill('Synthetic incident')
  await page.getByLabel('Note', { exact: true }).fill('Synthetic note')
  await page.getByRole('button', { name: 'Save name and note' }).click()
  await expect(page.locator('.workspace-record')).toContainText('Synthetic incident')
  await page.reload()
  await expect(page.locator('.workspace-record')).toContainText('Synthetic incident')
  await expect(page.locator('.workspace-record')).not.toContainText('synthetic-DO-NOT-STORE')
  const downloadPromise = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Back up this device' }).click()
  const download = await downloadPromise,
    path = await download.path()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(page.locator('.workspace-record')).toHaveCount(0)
  await page.getByLabel('Restore backup').setInputFiles(path!)
  await expect(page.locator('.workspace-record')).toContainText('Synthetic incident')
  await page.getByLabel('Find saved records').fill('no-such-incident')
  await expect(page.getByText('No records match.')).toBeVisible()
  await page.getByRole('button', { name: 'Clear filter' }).click()
  await expect(page.locator('.workspace-record')).toHaveCount(1)
})
test('local Brotli WASM compiles and decodes through a forced binary layer', async ({ page }) => {
  const data = brotliCompressSync(Buffer.from('{"brotli":"synthetic"}'))
  await page.goto('/')
  await page
    .locator('.paste-surface input[type=file]')
    .setInputFiles({ name: 'synthetic.br', mimeType: 'application/octet-stream', buffer: data })
  await page.locator('.manual-format select').first().selectOption('brotli')
  await expect(page.locator('.result-chain')).toContainText('JSON')
  await expect(page.locator('.result-chain')).not.toContainText('MANUAL-DECODE-FAILED')
})
test('private-key ancestors stay hidden in output, bytes and copy', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.addInitScript(() => {
    const NativeWorker = window.Worker
    let hold = false
    addEventListener('synthetic:hold-decoder', () => {
      hold = true
    })
    class HeldWorker extends NativeWorker {
      override postMessage(message: unknown) {
        if (!hold) super.postMessage(message)
      }
    }
    window.Worker = HeldWorker
  })
  await page.goto('/')
  const key = '-----BEGIN PRIVATE KEY-----\nZml4dHVyZUtleUJ5dGVz\n-----END PRIVATE KEY-----'
  await page.getByLabel('Paste text or drop a file').fill(Buffer.from(key).toString('base64'))
  await expect(page.locator('.result-alert')).toContainText('PRIVATE-KEY-EXPOSED')
  await page
    .getByRole('treeitem')
    .first()
    .click({ position: { x: 10, y: 10 } })
  await expect(page.locator('.inspector-panel .output-view')).not.toContainText(
    'Zml4dHVyZUtleUJ5dGVz',
  )
  await expect(page.locator('.hex-dump')).toHaveCount(0)
  await page.getByLabel('Paste text or drop a file').blur()
  await page.getByRole('button', { name: 'Copy', exact: true }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).not.toContain(
    'Zml4dHVyZUtleUJ5dGVz',
  )
  await page.locator('.inspector-panel > button').click()
  await page.evaluate(() => dispatchEvent(new Event('synthetic:hold-decoder')))
  await page.locator('.candidate-list button').first().click()
  await expect(page.locator('.processing')).toBeVisible()
  await expect(page.locator('.inspector-panel .output-view')).not.toContainText(
    'Zml4dHVyZUtleUJ5dGVz',
  )
  await expect(page.locator('.inspector-panel .output-view')).not.toContainText('BEGIN PRIVATE KEY')
})
test('proof page decodes offline without count events and data page reads saved state', async ({
  page,
  context,
}) => {
  const counts: string[] = []
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/e/events') counts.push(request.url())
  })
  await page.goto('/proof/')
  await expect(page.getByText('0 requests observed by this page')).toBeVisible()
  await context.setOffline(true)
  await page.getByLabel('Paste text or drop a file').fill('eyJsb2NhbCI6dHJ1ZX0=')
  await expect(page.locator('.result-chain')).toContainText('JSON')
  expect(counts).toEqual([])
  await context.setOffline(false)
  await page.goto('/data/')
  await expect(page.getByRole('heading', { name: 'Device settings · localStorage' })).toBeVisible()
})
test('render fault can retry with original input and a value-free report', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.addInitScript(() => {
    const NativeWorker = window.Worker
    class FaultWorker extends NativeWorker {
      constructor(url: string | URL, options?: WorkerOptions) {
        super(url, options)
        if (String(url).includes('decoder.worker'))
          this.addEventListener('message', (event) => {
            if (!sessionStorage.getItem('synthetic-fault-once') && event.data.result) {
              sessionStorage.setItem('synthetic-fault-once', 'true')
              event.data.result.root.selected.evidence = null
            }
          })
      }
    }
    window.Worker = FaultWorker
  })
  await page.goto('/')
  const input = 'eyJzeW50aGV0aWMiOnRydWV9'
  await page.getByLabel('Paste text or drop a file').fill(input)
  await expect(page.getByRole('alert')).toContainText('This view could not finish.')
  await page.getByRole('button', { name: 'Copy report without values' }).click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).not.toContain(input)
  await page.getByRole('button', { name: 'Try again', exact: true }).click()
  await expect(page.getByLabel('Paste text or drop a file')).toHaveValue(input)
  await expect(page.locator('.result-chain')).toContainText('JSON')
})
