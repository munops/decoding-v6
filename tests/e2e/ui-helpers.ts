import type { Page } from '@playwright/test'
export async function openAdvanced(page: Page) {
  const details = page.locator('.advanced-result')
  await details.waitFor({ state: 'visible' })
  if (!(await details.evaluate((element) => (element as HTMLDetailsElement).open)))
    await details.locator(':scope > summary').click()
}
