import type { Page } from '@playwright/test'
/** Native file actions need the attached handlers; synthetic setInputFiles bypasses disabled. */
export async function decoderReady(page: Page) {
  await page.locator('.decoder-shell[data-hydrated="true"]').waitFor()
}
export async function openAdvanced(page: Page) {
  const details = page.locator('.advanced-result')
  await details.waitFor({ state: 'visible' })
  if (!(await details.evaluate((element) => (element as HTMLDetailsElement).open)))
    await details.locator(':scope > summary').click()
}

/** Pure tools update automatically; parser/generator tools keep an explicit run gesture. */
export async function runTool(page: import('@playwright/test').Page) {
  const run = page.getByRole('button', { name: 'Run locally', exact: true })
  if (await run.count()) await run.click()
}
