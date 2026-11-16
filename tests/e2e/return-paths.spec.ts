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
  await page.locator('#decoder-input').fill(Buffer.from('내 글: 안녕하세요').toString('base64'))
  await expect(page.locator('.answer-final .output-view')).toContainText('내 글: 안녕하세요')
  await page.waitForTimeout(900) // Outlive the intentionally delayed QR generation.
  await expect(page.locator('.answer-final .output-view')).toContainText('내 글: 안녕하세요')
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
  await page.locator('#decoder-input').fill(Buffer.from('내 값: 안녕하세요').toString('base64'))
  await expect(page.locator('.answer-final .output-view')).toContainText('내 값: 안녕하세요')
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

test('recommended readable output and every explicit layer choice use the same copy target', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/ko/')
  await page.locator('#decoder-input').fill('a2VlcC1teS10ZXh0')
  const output = page.locator('.answer-final .output-view')
  await expect(output).toHaveText('keep-my-text')
  await expect(page.locator('.answer-verdict')).not.toContainText('2겹')
  await page.locator('.answer-final-heading button').click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('keep-my-text')
  await page.locator('.result-layer-choices button').nth(1).click()
  await expect(output).toHaveText('91 e7 a9 fa 6c be b5 ec 6d')
  await expect(page.locator('.answer-verdict')).toContainText('2겹')
  await page.locator('.answer-final-heading button').click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    '91 e7 a9 fa 6c be b5 ec 6d',
  )
  await page.locator('.result-layer-choices button').first().click()
  await expect(output).toHaveText('keep-my-text')
})

test('automatic and clicked examples never consume a visitor’s decode completion count', async ({
  page,
}) => {
  const names: string[] = []
  await page.route('**/e/events', async (route) => {
    names.push(JSON.parse(route.request().postData() ?? '{}').name)
    await route.fulfill({ status: 204 })
  })
  await page.goto('/ko/decode-mail-subject/')
  await expect(page.locator('.answer-final')).toBeVisible()
  await page.locator('.triage-sample').first().click()
  await expect(page.locator('.answer-final')).toBeVisible()
  expect(names).not.toContain('decode_completed')
  await page.locator('.example-context button').click()
  await page.locator('#decoder-input').fill(Buffer.from('내 메일 제목').toString('base64'))
  await expect(page.locator('.answer-final .output-view')).toHaveText('내 메일 제목')
  await expect.poll(() => names.includes('decode_completed')).toBe(true)
})

test('the dedicated JWT tool verifies locally and carries the token into inspection', async ({
  page,
}) => {
  await page.goto('/ko/jwt-debugger/')
  await expect(page.locator('.jwt-verifier')).toBeVisible()
  await page.locator('.jwt-verifier summary').click()
  await expect(page.locator('.jwt-verifier textarea')).toBeVisible()
  const token = await page.locator('.operation-pane textarea').first().inputValue()
  await page.getByRole('button', { name: '이 토큰의 근거와 주의점 보기' }).click()
  await expect(page.locator('#decoder-input')).toHaveValue(token)
  await expect(page.locator('.answer-verdict')).toContainText('토큰')
})

test('an old JWT verification cannot validate a newly edited key', async ({ page }) => {
  await page.addInitScript(() => {
    const original = crypto.subtle.verify.bind(crypto.subtle)
    crypto.subtle.verify = async (...args: Parameters<SubtleCrypto['verify']>) => {
      const result = await original(...args)
      dispatchEvent(new Event('synthetic:verification-pending'))
      await new Promise((resolve) =>
        addEventListener('synthetic:release-verification', resolve, { once: true }),
      )
      return result
    }
  })
  const { createHmac } = await import('node:crypto')
  const key = 'synthetic-verification-key'
  const signing = `${Buffer.from('{"alg":"HS256"}').toString('base64url')}.${Buffer.from('{"sub":"test"}').toString('base64url')}`
  const token = `${signing}.${createHmac('sha256', key).update(signing).digest('base64url')}`
  await page.goto('/jwt-debugger/')
  await page.locator('.operation-pane textarea').first().fill(token)
  await page.locator('.jwt-verifier summary').click()
  await page.locator('.jwt-verifier textarea').fill(key)
  await page.evaluate(() =>
    addEventListener('synthetic:verification-pending', () => {
      document.documentElement.dataset.verificationPending = 'true'
    }),
  )
  await page.locator('.jwt-verifier button').click()
  await expect(page.locator('html')).toHaveAttribute('data-verification-pending', 'true')
  await page.locator('.jwt-verifier textarea').fill('different synthetic key')
  await page.evaluate(() => dispatchEvent(new Event('synthetic:release-verification')))
  await expect(page.locator('.jwt-verifier [role="status"]')).toBeEmpty()
  await expect(page.locator('.jwt-verifier button')).toBeEnabled()
})

test('situational input reaches copied text and lost input reaches honest recovery', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  for (const [route, input] of [
    ['/ko/decode-mail-subject/', '=?UTF-8?B?7JWI64WV7ZWY7IS47JqU?='],
    ['/ko/fix-garbled-text/', 'ì•ˆë…•í•˜ì„¸ìš”'],
  ]) {
    await page.goto(route!)
    await page.locator('#decoder-input').fill(input!)
    await expect(page.locator('.answer-final .output-view')).toHaveText('안녕하세요')
    await page.locator('.answer-final-heading button').click()
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('안녕하세요')
  }
  await page.locator('#decoder-input').fill('����')
  await expect(page.locator('.answer-verdict')).toContainText('되돌릴 수 없어요')
  await page.locator('#decoder-input').fill('abcde')
  await expect(page.locator('.next-step')).toContainText('원문을 끝까지 복사')
})

test('layer choices reflow at small widths and enlarged text', async ({ page }) => {
  for (const [width, textSize] of [
    [320, '100%'],
    [390, '200%'],
  ] as const) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/ko/')
    await page.evaluate((size) => {
      document.documentElement.style.fontSize = size
    }, textSize)
    await page.locator('#decoder-input').fill('a2VlcC1teS10ZXh0')
    await expect(page.locator('.answer-final .output-view')).toHaveText('keep-my-text')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    for (const button of await page.locator('.result-layer-choices button').all()) {
      expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    }
  }
})
