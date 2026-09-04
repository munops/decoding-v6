import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

function evidencePath(testInfo: TestInfo, filename: string) {
  const evidenceDir = process.env.DECODING_INCLUSIVE_UI_EVIDENCE_DIR
  if (!evidenceDir) return testInfo.outputPath(filename)
  mkdirSync(evidenceDir, { recursive: true })
  return resolve(evidenceDir, filename)
}

async function expectCoreRouteWithinCanvas(page: Page) {
  await expect(page.getByRole('heading', { name: /Trace the value/i })).toBeVisible()
  await expect(page.getByLabel('Paste text or drop a file')).toBeVisible()
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
}

test('320px web route keeps the core action visible without horizontal overflow', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 1000 })
  await page.goto('/')
  await expectCoreRouteWithinCanvas(page)
  await page.screenshot({
    path: evidencePath(testInfo, 'home-320.png'),
    fullPage: true,
  })
})

test('390px web route keeps the core action visible without horizontal overflow', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 390, height: 1000 })
  await page.goto('/')
  await expectCoreRouteWithinCanvas(page)
  await page.screenshot({
    path: evidencePath(testInfo, 'home-390.png'),
    fullPage: true,
  })
})

test('1440px web route keeps the core action visible without horizontal overflow', async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await expectCoreRouteWithinCanvas(page)
  await page.screenshot({
    path: evidencePath(testInfo, 'home-1440.png'),
    fullPage: true,
  })
})

test('320px route survives an actual 200 percent root text resize', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 1000 })
  await page.goto('/')
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%'
  })

  await expect(page.getByRole('main')).toBeVisible()
  await expectCoreRouteWithinCanvas(page)
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    rootFontSize: getComputedStyle(document.documentElement).fontSize,
  }))
  expect(dimensions.rootFontSize).toBe('32px')
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
  await page.screenshot({
    path: evidencePath(testInfo, 'home-320-text-200.png'),
    fullPage: true,
  })
})

test('sticky header does not trap prior input controls after a mobile result', async ({ page }) => {
  const cases = [
    { width: 390, height: 844, textScale: 1 },
    { width: 320, height: 844, textScale: 1 },
    { width: 320, height: 844, textScale: 2 },
  ]

  for (const item of cases) {
    await page.setViewportSize({ width: item.width, height: item.height })
    await page.goto('/')
    if (item.textScale === 2) {
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '200%'
      })
    }
    await expectCoreRouteWithinCanvas(page)

    await page.locator('[data-sample-id="nested"]').click()
    await expect(
      page.getByRole('tree', { name: 'Decode chain' }).getByRole('treeitem'),
    ).toHaveCount(2)

    await page.locator('.result-grid').evaluate((element) => {
      window.scrollTo({ top: element.getBoundingClientRect().top + window.scrollY - 82 })
    })
    await page.waitForFunction(
      () => (document.querySelector('.result-grid')?.getBoundingClientRect().top ?? Infinity) <= 83,
    )

    const anchored = await page.evaluate(() => {
      const header = document.querySelector('.site-header')?.getBoundingClientRect()
      const actions = document.querySelector('.input-actions')?.getBoundingClientRect()
      const result = document.querySelector('.result-grid')?.getBoundingClientRect()
      return {
        headerBottom: header?.bottom ?? -1,
        actionsBottom: actions?.bottom ?? -1,
        resultTop: result?.top ?? -1,
      }
    })
    expect(anchored.actionsBottom).toBeLessThanOrEqual(anchored.headerBottom)
    expect(anchored.resultTop).toBeGreaterThanOrEqual(anchored.headerBottom)

    for (const selector of [
      '#decoder-input',
      '.input-actions .file-action',
      '.input-actions button',
    ]) {
      const target = page.locator(selector)
      await target.scrollIntoViewIfNeeded()
      const geometry = await target.evaluate((element) => {
        const targetRect = element.getBoundingClientRect()
        const headerRect = document.querySelector('.site-header')?.getBoundingClientRect()
        const centerX = targetRect.left + targetRect.width / 2
        const centerY = targetRect.top + targetRect.height / 2
        const hit = document.elementFromPoint(centerX, centerY)
        return {
          targetTop: targetRect.top,
          targetBottom: targetRect.bottom,
          headerBottom: headerRect?.bottom ?? 0,
          viewportHeight: window.innerHeight,
          centerHitTarget: Boolean(hit && (hit === element || element.contains(hit))),
        }
      })
      expect(geometry.targetTop).toBeGreaterThanOrEqual(geometry.headerBottom)
      expect(geometry.targetBottom).toBeLessThanOrEqual(geometry.viewportHeight)
      expect(geometry.centerHitTarget).toBe(true)
    }

    const input = page.getByLabel('Paste text or drop a file')
    await input.fill('?')
    await expect(input).toHaveValue('?')
    const clear = page.getByRole('button', { name: 'Clear' })
    await clear.scrollIntoViewIfNeeded()
    await clear.click()
    await expect(input).toHaveValue('')
    await expect(clear).toBeDisabled()
  }
})
