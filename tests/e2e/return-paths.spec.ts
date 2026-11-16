import { expect, test } from '@playwright/test'

test('a cold page marks examples unavailable until their actions are ready', async ({ page }) => {
  let release!: () => void
  const ready = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/_astro/*.js', async (route) => {
    await ready
    await route.continue()
  })
  // Module loading delays DOMContentLoaded; inspect SSR before releasing that load.
  await page.goto('/ko/', { waitUntil: 'commit' })
  await expect(page.locator('[data-sample-id="broken"]')).toBeDisabled()
  release()
  await page.locator('[data-sample-id="broken"]').click()
  await expect(page.locator('.answer-final .output-view')).toContainText('안녕하세요')
})

test('QR examples stay labelled and late generation cannot replace the visitor’s text', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const toBlob = HTMLCanvasElement.prototype.toBlob
    HTMLCanvasElement.prototype.toBlob = function (callback, ...args) {
      return toBlob.call(
        this,
        (blob) => {
          setTimeout(() => callback(blob), 700)
        },
        ...args,
      )
    }
  })
  await page.goto('/ko/')
  await page.locator('[data-sample-id="qr"]').click()
  await expect(page.locator('.answer-final')).toBeVisible()
  await expect(page.locator('.example-context')).toBeVisible()
  await page.locator('[data-sample-id="qr"]').click()
  await page.locator('#decoder-input').fill(Buffer.from('keep-my-text').toString('base64'))
  await expect(page.locator('.answer-final .output-view')).toContainText('keep-my-text')
  await page.waitForTimeout(900) // Outlive the intentionally delayed QR generation.
  await expect(page.locator('.answer-final .output-view')).toContainText('keep-my-text')
  await expect(page.locator('.example-context')).toHaveCount(0)
})

test('example becomes an empty focused input for the visitor’s own value', async ({ page }) => {
  await page.goto('/ko/fix-garbled-text/')
  await expect(page.locator('.answer-final .output-view')).not.toBeEmpty()
  await expect(page.locator('.example-context')).toContainText('예시')
  await page.locator('.example-context button').click()
  await expect(page.locator('#decoder-input')).toHaveValue('')
  await expect(page.locator('#decoder-input')).toBeFocused()
  await expect(page.locator('.example-context')).toHaveCount(0)
  await expect(page.locator('.answer-final')).toHaveCount(0)
  await page.locator('#decoder-input').fill(Buffer.from('visitor-owned-value').toString('base64'))
  await expect(page.locator('.answer-final .output-view')).toContainText('visitor-owned-value')
  await expect(page.locator('.example-context')).toHaveCount(0)
})

for (const failure of ['empty', 'throw']) {
  test(`failed QR generation (${failure}) never relabels a previous result`, async ({ page }) => {
    await page.addInitScript((mode) => {
      HTMLCanvasElement.prototype.toBlob = function (callback) {
        if (mode === 'throw') throw new Error('synthetic canvas failure')
        callback(null)
      }
    }, failure)
    await page.goto('/ko/')
    await page.locator('[data-sample-id="broken"]').click()
    await expect(page.locator('.answer-final .output-view')).toContainText('안녕하세요')
    await page.locator('[data-sample-id="qr"]').click()
    await expect(page.locator('.decoder-frame > .notice.warning')).toBeVisible()
    await expect(page.locator('.example-context')).toHaveCount(0)
    await expect(page.locator('.answer-final .output-view')).toContainText('안녕하세요')
  })
}

test('home connects all existing situational guides without changing the input URL', async ({
  page,
}) => {
  await page.goto('/ko/')
  await expect(page.locator('.task-guides a')).toHaveCount(8)
  await page.locator('[data-sample-id="broken"]').click()
  await expect(page.locator('.answer-final .output-view')).toContainText('안녕하세요')
  await expect(page.locator('.example-context')).toBeVisible()
  expect(new URL(page.url()).search).toBe('')
  await page.locator('.task-guides a[href="/ko/decode-mail-subject/"]').click()
  await expect(page.locator('.answer-final .output-view')).not.toBeEmpty()
  await expect(page.locator('.task-guides a')).toHaveCount(7)
})

test('all favorites survive reload and direct tool arrivals appear back at home', async ({
  page,
}) => {
  await page.goto('/ko/tools/')
  await expect(page.locator('.catalog-shell')).toHaveAttribute('data-hydrated', 'true')
  expect(
    await page.locator('input[type="search"]').evaluate((el) => el === document.activeElement),
  ).toBe(false)
  for (let i = 0; i < 15; i++) await page.locator('.favorite-button').nth(i).click()
  await page.reload()
  await expect(page.locator('section[aria-labelledby="favorite-tools"] a')).toHaveCount(15)
  await page.goto('/ko/json-format/')
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('decoding-recent-tools')))
    .toContain('json-format')
  await page.goto('/ko/')
  await expect(page.locator('.tool-shortcuts a[href="/ko/json-format/"]')).toBeVisible()
  await expect(page.locator('.tool-shortcuts .recent-links a')).not.toHaveCount(0)
})

test('denied preference storage does not break starring or using a tool', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('denied', 'SecurityError')
    }
  })
  await page.goto('/ko/tools/')
  await page.locator('.favorite-button').first().click()
  await expect(page.locator('.favorite-button').first()).toHaveAttribute('aria-pressed', 'true')
  await expect(
    page.getByRole('status').filter({ hasText: '설정을 저장하지 못했어요' }),
  ).toBeVisible()
  await page.goto('/ko/json-format/')
  await expect(
    page.locator('.notice').filter({ hasText: '설정을 저장하지 못했어요' }),
  ).toBeVisible()
  await expect(page.locator('.tool-workbench')).toBeVisible()
  expect(errors).toEqual([])
})
