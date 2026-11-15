import { expect, test } from '@playwright/test'
const topics = [
  'what-encoding-is-this',
  'fix-garbled-text',
  'decode-mail-subject',
  'normalize-korean-filename',
  'decode-qr-before-opening',
  'where-does-this-link-go',
  'is-it-safe-to-paste-jwt',
  'how-to-tell-if-a-string-is-base64',
]
for (const locale of ['en', 'ko'])
  for (const width of [390, 1440]) {
    test(`eight search entry pages remain actionable in ${locale} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: width === 390 ? 780 : 900 })
      for (const topic of topics) {
        await page.goto(`${locale === 'ko' ? '/ko' : ''}/${topic}/`)
        await expect(page.locator('.decoder-shell')).toHaveAttribute('data-hydrated', 'true')
        await expect(page.locator('#decoder-input')).toBeVisible()
        const schemas = await page.locator('script[type="application/ld+json"]').allTextContents()
        expect(schemas.map((text) => JSON.parse(text)['@type'])).toEqual(
          expect.arrayContaining(['FAQPage', 'BreadcrumbList']),
        )
        await expect(page.locator('.language-options a')).toHaveCount(2)
        if (topic !== 'decode-qr-before-opening')
          await expect(page.locator('.answer-card')).toBeVisible()
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        )
        expect(await page.title()).not.toMatch(/developer/i)
      }
    })
  }
const humanAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
test('Korean first visit redirects, and explicit English wins on later root visits', async ({
  browser,
}) => {
  const context = await browser.newContext({ locale: 'ko-KR', userAgent: humanAgent })
  try {
    const page = await context.newPage()
    await page.goto('/')
    await expect(page).toHaveURL(/\/ko\/$/)
    await page.locator('.language-menu summary').click()
    await page.locator('[data-locale-choice="en"]').click()
    await expect(page).toHaveURL(/\/$/)
    await expect(page).toHaveTitle('decod.ing — Paste anything. See what it is.')
    await page.reload()
    await expect(page).not.toHaveURL(/\/ko\/$/)
  } finally {
    await context.close()
  }
})
test('Korean-language crawler keeps the requested English URL', async ({ browser }) => {
  const context = await browser.newContext({
    locale: 'ko-KR',
    userAgent: 'Googlebot/2.1 (+http://www.google.com/bot.html)',
  })
  try {
    const page = await context.newPage()
    await page.goto('/')
    await expect(page.locator('.decoder-shell')).toHaveAttribute('data-hydrated', 'true')
    await expect(page).not.toHaveURL(/\/ko\/$/)
  } finally {
    await context.close()
  }
})
test('English remains selectable when local preference storage is blocked', async ({ browser }) => {
  const context = await browser.newContext({ locale: 'ko-KR', userAgent: humanAgent })
  try {
    await context.addInitScript(() =>
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new DOMException('Blocked', 'SecurityError')
        },
      }),
    )
    const page = await context.newPage()
    await page.goto('/')
    await expect(page).toHaveURL(/\/ko\/$/)
    await page.locator('.language-menu summary').click()
    await page.locator('[data-locale-choice="en"]').click()
    await expect(page).toHaveURL(/\?lang=en$/)
    await expect(page).toHaveTitle('decod.ing — Paste anything. See what it is.')
  } finally {
    await context.close()
  }
})
test('home, tool and format metadata point at distinct same-origin image kinds', async ({
  page,
}) => {
  const urls: string[] = []
  for (const [path, kind] of [
    ['/', 'home'],
    ['/json-format/', 'tool'],
    ['/detect/base64/', 'format'],
  ]) {
    await page.goto(path!)
    const image = await page.locator('meta[property="og:image"]').getAttribute('content')
    expect(image).toBe(`https://decod.ing/images/og/${kind}-en.png`)
    urls.push(image!)
    const category = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(category.join('')).not.toContain('DeveloperApplication')
  }
  expect(new Set(urls).size).toBe(3)
})
