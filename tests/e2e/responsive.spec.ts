import { expect, test, type TestInfo } from '@playwright/test'
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'

function screenshotPath(testInfo: TestInfo, filename: string) {
  const evidenceDir = process.env.DECODING_LANDING_EVIDENCE_DIR
  if (!evidenceDir) return testInfo.outputPath(filename)
  mkdirSync(evidenceDir, { recursive: true })
  return resolve(evidenceDir, filename)
}

test('home and catalog remain usable without horizontal overflow', async ({ page }) => {
  for (const route of ['/', '/tools/', '/json-format/']) {
    await page.goto(route)
    const dimensions = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1)
  }
})

test('recursive chain stage badges remain readable without horizontal overflow', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByLabel('Paste text or drop a file').fill('eyJsb2NhbCI6dHJ1ZSwidG9vbHMiOjQ3fQ==')
  const chain = page.getByRole('tree', { name: 'Decode chain' })
  await expect(chain.getByRole('treeitem')).toHaveCount(2)
  await expect(chain.getByText('Step 1')).toBeVisible()
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1)
})

test('desktop first viewport exposes the real paste surface', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile')
  await page.goto('/')
  const input = page.getByLabel('Paste text or drop a file')
  await expect(input).toBeVisible()
  const bounds = await input.boundingBox()
  const viewport = page.viewportSize()
  expect(bounds).not.toBeNull()
  expect(viewport).not.toBeNull()
  expect(bounds?.y).toBeLessThan(viewport?.height ?? 0)
  expect((bounds?.y ?? 0) + 80).toBeLessThan(viewport?.height ?? 0)
})

test('a 200 percent desktop-equivalent viewport keeps core routes within the canvas', async ({
  page,
}) => {
  await page.setViewportSize({ width: 720, height: 900 })
  for (const route of ['/', '/tools/', '/json-format/', '/workspace/']) {
    await page.goto(route)
    const dimensions = await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1)
  }
})

test('captures representative desktop and mobile visual evidence', async ({ page }, testInfo) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Trace the value/i })).toBeVisible()
  await page.screenshot({
    path: screenshotPath(testInfo, `home-${testInfo.project.name}.png`),
    fullPage: true,
  })
  await page.goto('/tools/')
  await page.screenshot({
    path: screenshotPath(testInfo, `tools-${testInfo.project.name}.png`),
    fullPage: true,
  })
})
