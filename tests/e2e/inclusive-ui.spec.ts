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
