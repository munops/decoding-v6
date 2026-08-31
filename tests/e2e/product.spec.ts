import { expect, test } from '@playwright/test'

test('auto-detects a nested Base64 JSON payload locally', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Trace the value/i })).toBeVisible()
  const input = page.getByLabel('Paste text or drop a file')
  await input.fill('eyJsb2NhbCI6dHJ1ZSwidG9vbHMiOjQ3fQ==')
  await expect(page.getByText('Base64', { exact: false }).first()).toBeVisible()
  await expect(page.getByText('JSON', { exact: false }).first()).toBeVisible()
  const chain = page.getByRole('tree', { name: 'Decode chain' })
  const stages = chain.getByRole('treeitem')
  await expect(stages).toHaveCount(2)
  await expect(chain.getByText('Step 1')).toBeVisible()
  await expect(chain.getByText('Step 2')).toBeVisible()
  await expect(chain.getByText(/Input: \d+ bytes/).first()).toBeVisible()
  await stages.first().focus()
  await page.keyboard.press('ArrowDown')
  await expect(stages.nth(1)).toBeFocused()
  await page.keyboard.press('ArrowLeft')
  await expect(stages.first()).toBeFocused()
  await expect(page.getByText('0 input bytes uploaded')).toBeVisible()
})

test('lets a visitor experience three evidence-first synthetic triage cases', async ({ page }) => {
  await page.goto('/')
  const launchpad = page.getByRole('group', { name: 'Try a safe synthetic case' })
  await expect(launchpad.getByRole('button')).toHaveCount(3)
  await expect(page.locator('.hero-proof')).not.toContainText('47')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    /rank plausible formats/i,
  )

  await launchpad.getByRole('button', { name: 'Nested Base64 → JSON' }).click()
  await expect(page.getByLabel('Paste text or drop a file')).toHaveValue(
    'eyJsb2NhbCI6dHJ1ZSwidG9vbHMiOjQ3fQ==',
  )
  await expect(page.getByRole('tree', { name: 'Decode chain' }).getByRole('treeitem')).toHaveCount(
    2,
  )

  await launchpad.getByRole('button', { name: 'Ambiguous Hex or Base64' }).click()
  await expect(page.getByRole('status')).toContainText('More than one format is plausible')
  await expect(
    page.getByRole('listbox', { name: 'Possible formats' }).getByRole('option'),
  ).toHaveCount(2)

  await launchpad.getByRole('button', { name: 'Expired JWT warning' }).click()
  await expect(page.locator('.result-chain .notice.danger')).toContainText('JWT-EXPIRED')
})

test('ships the Reveal Ledger mark and persists an explicit theme choice locally', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('.site-header .brand-symbol')).toBeVisible()
  await expect(page.locator('.site-header .brand-name')).toContainText('decod.ing')
  const toggle = page.getByRole('button', { name: 'Toggle color theme' })
  const initialPressed = await toggle.getAttribute('aria-pressed')
  await toggle.click()
  const expectedTheme = initialPressed === 'true' ? 'light' : 'dark'
  await expect(page.locator('html')).toHaveAttribute('data-theme', expectedTheme)
  await expect(page.evaluate(() => localStorage.getItem('decoding-theme'))).resolves.toBe(
    expectedTheme,
  )
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', expectedTheme)
})

test('keeps ambiguous formats explicit instead of auto-selecting a chain stage', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByLabel('Paste text or drop a file').fill('deadbeef')
  await expect(page.getByRole('status')).toContainText('More than one format is plausible')
  const chain = page.getByRole('tree', { name: 'Decode chain' })
  await expect(chain.getByRole('treeitem')).toHaveCount(1)
  await expect(chain.getByText('Step 1')).toBeVisible()
  await expect(chain.getByText(/Input: 8 bytes/)).toBeVisible()
  const options = page.getByRole('listbox', { name: 'Possible formats' }).getByRole('option')
  await expect(options).toHaveCount(2)
  await expect(options.first()).toContainText(/Hexadecimal bytes|Base64/)
})

test('plays a local copy cue only after an explicit successful copy and persists its control', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.addInitScript(() => {
    type FeedbackWindow = Window & { __copyFeedbackStarts?: number }
    const feedbackWindow = window as FeedbackWindow
    feedbackWindow.__copyFeedbackStarts = 0
    class FakeAudioContext {
      currentTime = 0
      destination = {}
      resume = async () => undefined
      createGain = () => ({
        gain: { setValueAtTime: () => undefined, linearRampToValueAtTime: () => undefined },
        connect: () => undefined,
      })
      createOscillator = () => ({
        frequency: { setValueAtTime: () => undefined },
        type: 'sine',
        connect: () => undefined,
        start: () => {
          feedbackWindow.__copyFeedbackStarts = (feedbackWindow.__copyFeedbackStarts ?? 0) + 1
        },
        stop: () => undefined,
      })
    }
    Object.defineProperty(window, 'AudioContext', { configurable: true, value: FakeAudioContext })
  })
  await page.goto('/')
  await page.getByLabel('Paste text or drop a file').fill('dGVzdA==')
  await page.getByRole('button', { name: 'Copy', exact: true }).click()
  await expect(page.getByText('Selected result copied.')).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { __copyFeedbackStarts?: number }).__copyFeedbackStarts,
      ),
    )
    .toBe(2)

  await page.locator('.copy-feedback-settings summary').click()
  const enabled = page.getByRole('checkbox', { name: 'Play a sound after copying' })
  await enabled.uncheck()
  await page.getByRole('button', { name: 'Copy', exact: true }).click()
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as Window & { __copyFeedbackStarts?: number }).__copyFeedbackStarts,
      ),
    )
    .toBe(2)
  await expect(page.evaluate(() => localStorage.getItem('decoding-copy-feedback'))).resolves.toBe(
    '{"enabled":false,"volume":0.3}',
  )
})

test('lists exactly 47 searchable tools', async ({ page }) => {
  await page.goto('/tools/')
  await expect(page.locator('.catalog-shell')).toHaveAttribute('data-hydrated', 'true')
  await expect(page.getByText('47 of 47 tools')).toBeVisible()
  await expect(page.locator('.tool-card')).toHaveCount(47)
  await page.getByPlaceholder(/format JSON/).fill('certificate')
  await expect(page.locator('.tool-card')).toHaveCount(1)
  await expect(page.getByRole('heading', { name: /Certificate Decoder/ })).toBeVisible()
})

test('command palette focus, favorites, and recent tools store slugs only', async ({ page }) => {
  await page.goto('/tools/')
  const catalog = page.locator('.catalog-shell')
  await expect(catalog).toHaveAttribute('data-hydrated', 'true')
  const search = page.getByPlaceholder(/format JSON/)
  await page.keyboard.press('Control+k')
  await expect(search).toBeFocused()
  await page.getByRole('button', { name: /Add to favorites.*JSON Format \/ Validate/ }).click()
  const stored = await page.evaluate(() => ({
    favorites: localStorage.getItem('decoding-favorite-tools'),
    keys: Object.keys(localStorage),
  }))
  expect(stored.favorites).toBe('["json-format"]')
  expect(stored.keys).toEqual(['decoding-favorite-tools'])
  await page.getByRole('link', { name: /JSON Format \/ Validate/ }).click()
  await page.goto('/tools/')
  await expect(page.getByRole('heading', { name: 'Recent tools' })).toBeVisible()
  await expect(
    page.locator('.recent-links').getByRole('link', { name: 'JSON Format / Validate' }),
  ).toBeVisible()
})

test('runs a dedicated JSON formatter operation', async ({ page }) => {
  await page.goto('/json-format/')
  await expect(page.locator('.tool-workbench')).toHaveAttribute('data-hydrated', 'true')
  await page.locator('.operation-pane textarea').first().fill('{"answer":42,"local":true}')
  await page.getByRole('button', { name: 'Run locally' }).click()
  await expect(page.locator('.output-view')).toContainText('"answer": 42')
  await expect(page.getByText('Valid JSON')).toBeVisible()
})

test('keeps the Korean journey in user-facing language from discovery through result', async ({
  page,
}) => {
  await page.goto('/ko/')
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0)
  await expect(page.locator('link[rel="alternate"][hreflang="ko"]')).toHaveAttribute(
    'href',
    'https://decod.ing/ko/',
  )
  await expect(page.getByText('한국어 번역 검토 중')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: '값의 정체와 근거를 확인하세요.' })).toBeVisible()
  await expect(page.locator('.hero h1 br')).toHaveCount(0)
  await expect(page.getByRole('group', { name: '안전한 예시로 먼저 확인해 보세요' })).toContainText(
    '16진수와 Base64 후보 비교',
  )

  await page.getByLabel('텍스트를 붙여넣거나 파일을 놓으세요').fill('dGVzdA==')
  await expect(page.locator('.evidence-stack').first()).toContainText('Base64에서 쓰는 문자')

  await page.goto('/ko/tools/')
  await expect(page.getByRole('heading', { name: '필요한 변환과 검사를 한곳에서.' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '정리', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'JSON 정리와 문법 확인' })).toBeVisible()
  await expect(page.locator('.tool-card').first()).toContainText(
    'JSON 들여쓰기를 정리하거나 한 줄로 줄이고 문법 오류를 확인합니다.',
  )

  await page.goto('/ko/json-format/')
  await expect(page.getByRole('heading', { name: 'JSON 정리와 문법 확인', level: 1 })).toBeVisible()
  await page.locator('.operation-pane textarea').first().fill('{"answer":42}')
  await page.getByRole('button', { name: '이 기기에서 실행' }).click()
  await expect(page.getByText('JSON 문법을 확인했습니다.')).toBeVisible()
  await expect(page.getByRole('heading', { name: '텍스트 결과' })).toBeVisible()

  await page.goto('/ko/curl-to-code/')
  await expect(page.locator('option[value="javascript"]')).toHaveText('JavaScript')
  await expect(page.getByRole('option', { name: 'javascript', exact: true })).toHaveCount(0)

  await page.goto('/ko/string-case/')
  await expect(page.locator('option[value="camel"]')).toHaveText('camelCase')
  await expect(page.getByRole('option', { name: 'camel', exact: true })).toHaveCount(0)
})

test.describe('Korean locale suggestion', () => {
  test.use({ locale: 'ko-KR' })

  for (const width of [320, 390]) {
    test(`keeps the Korean suggestion separate from the main content at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 })
      await page.goto('/')
      if (width === 320) {
        await page.evaluate(() => {
          document.documentElement.style.fontSize = '200%'
        })
      }

      const suggestion = page.locator('#locale-suggestion')
      await expect(suggestion).toBeVisible()
      await expect(suggestion).toContainText('한국어로 볼 수 있어요.')
      await expect(suggestion.getByRole('link', { name: '한국어로 보기' })).toHaveAttribute(
        'href',
        '/ko/',
      )

      const suggestionBox = await suggestion.boundingBox()
      const mainBox = await page.locator('main').boundingBox()
      expect(suggestionBox).not.toBeNull()
      expect(mainBox).not.toBeNull()
      expect(suggestionBox!.y + suggestionBox!.height).toBeLessThanOrEqual(mainBox!.y)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      )
    })
  }
})

test('renders HTML preview inside a locked sandbox', async ({ page }) => {
  await page.goto('/html-preview/')
  await expect(page.locator('.tool-workbench')).toHaveAttribute('data-hydrated', 'true')
  await page.getByRole('button', { name: 'Run locally' }).click()
  const frame = page.locator('iframe.safe-preview')
  await expect(frame).toHaveAttribute('sandbox', '')
  await expect(frame).toHaveAttribute('srcdoc', /default-src 'none'/)
})

test('publishes reachable terms and safe support routes from the global footer', async ({
  page,
}) => {
  await page.goto('/')
  const footer = page.locator('.site-footer')
  await expect(footer.getByRole('link', { name: 'Terms' })).toHaveAttribute('href', '/terms/')
  await expect(footer.getByRole('link', { name: 'Support' })).toHaveAttribute('href', '/support/')

  await page.goto('/terms/')
  await expect(page.getByRole('heading', { name: /Use the tool responsibly/i })).toBeVisible()
  await expect(page.getByText(/Effective 8 August 2026/)).toBeVisible()
  await expect(page.locator('#locale-suggestion')).toHaveCount(0)
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(0)

  await page.goto('/support/')
  await expect(page.getByRole('heading', { name: /Describe the behavior/i })).toBeVisible()
  await expect(page.getByText(/Never attach production payloads/i)).toBeVisible()
  await expect(page.locator('#locale-suggestion')).toHaveCount(0)
  await expect(page.getByRole('link', { name: /GitHub issue tracker/i })).toHaveAttribute(
    'href',
    'https://github.com/whoo3474/decoding-v6/issues',
  )
})

test.describe('Japanese locale', () => {
  test.use({ locale: 'ja-JP' })

  test('suggests Japanese without redirecting and runs the localized tool UI', async ({ page }) => {
    await page.goto('/')
    const suggestion = page.locator('#locale-suggestion')
    await expect(page).toHaveURL('/')
    await expect(suggestion).toBeVisible()
    await expect(suggestion.getByRole('link', { name: 'Open' })).toHaveAttribute('href', '/ja/')

    await page.goto('/ja/json-format/')
    await expect(page.locator('html')).toHaveAttribute('lang', 'ja')
    await expect(page.getByRole('button', { name: 'ローカルで実行' })).toBeVisible()
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
      'href',
      'https://decod.ing/json-format/',
    )
  })
})
