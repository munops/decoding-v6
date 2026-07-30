import { expect, test } from '@playwright/test'

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

test('captures representative desktop and mobile visual evidence', async ({ page }, testInfo) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Paste anything/i })).toBeVisible()
  await page.screenshot({
    path: testInfo.outputPath(`home-${testInfo.project.name}.png`),
    fullPage: true,
  })
  await page.goto('/tools/')
  await page.screenshot({
    path: testInfo.outputPath(`tools-${testInfo.project.name}.png`),
    fullPage: true,
  })
})
