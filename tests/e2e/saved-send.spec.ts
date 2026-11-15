import { expect, test } from '@playwright/test'
async function records(page: import('@playwright/test').Page) {
  return page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('decoding-local-workspace')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    return new Promise<
      Array<{ structure: unknown; valueMode?: string; createdAt: string; expiresAt: string }>
    >((resolve, reject) => {
      const request = database
        .transaction('redacted-records')
        .objectStore('redacted-records')
        .getAll()
      request.onsuccess = () => {
        database.close()
        resolve(request.result)
      }
      request.onerror = () => reject(request.error)
    })
  })
}
for (const width of [390, 1440]) {
  test(`save defaults and explicit values remain masked and local at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: width === 390 ? 780 : 900 })
    const requests: string[] = []
    page.on('request', (request) => requests.push(`${request.url()} ${request.postData() ?? ''}`))
    await page.goto('/')
    await page
      .getByLabel('Paste text or drop a file')
      .fill('{"visible":"save-local-visible","token":"SAVE_SECRET_CANARY_724"}')
    await expect(page.locator('.answer-final .output-view')).toContainText('save-local-visible')
    await page.locator('.workflow-save').getByRole('button', { name: 'Save', exact: true }).click()
    await expect(page.locator('.save-panel').getByLabel('What to keep')).toHaveValue('structure')
    await expect(page.locator('.save-panel').getByLabel('Keep for')).toHaveValue('7d')
    await page.locator('.save-panel').getByLabel('Name', { exact: true }).fill('Structure sample')
    await page.locator('.save-panel button[type=submit]').click()
    await expect.poll(async () => (await records(page)).length).toBe(1)
    expect((await records(page))[0]?.structure).toEqual({
      visible: '[string]',
      token: '[redacted]',
    })
    await page.locator('.workflow-save').getByRole('button', { name: 'Save', exact: true }).click()
    await page.locator('.save-panel').getByLabel('Name', { exact: true }).fill('Value sample')
    await page.locator('.save-panel').getByLabel('What to keep').selectOption('values')
    await expect(page.locator('.save-panel')).toContainText('other people using this device')
    await page.locator('.save-panel button[type=submit]').click()
    await expect.poll(async () => (await records(page)).length).toBe(2)
    const value = (await records(page)).find((record) => record.valueMode === 'values')!
    expect(value.structure).toEqual({ visible: 'save-local-visible', token: '[redacted]' })
    expect(Date.parse(value.expiresAt) - Date.parse(value.createdAt)).toBeGreaterThanOrEqual(
      604800000 - 100,
    )
    expect(Date.parse(value.expiresAt) - Date.parse(value.createdAt)).toBeLessThanOrEqual(
      604800000 + 100,
    )
    expect(
      requests.some(
        (request) =>
          request.includes('SAVE_SECRET_CANARY_724') || request.includes('save-local-visible'),
      ),
    ).toBe(false)
    await page.goto('/workspace/')
    await expect(page.locator('.workspace-record')).toHaveCount(2)
    await expect(page.locator('.workspace-manual')).not.toHaveAttribute('open', '')
    await page.getByLabel('Find saved records').fill('Value sample')
    await expect(page.locator('.workspace-record')).toHaveCount(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`saved-${width}.png`) })
    page.once('dialog', (dialog) => void dialog.accept())
    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Back up this device', exact: true }).click()
    const backupPath = await (await download).path()
    page.once('dialog', (dialog) => void dialog.accept())
    await page.getByRole('button', { name: 'Clear workspace', exact: true }).click()
    await expect.poll(async () => (await records(page)).length).toBe(0)
    page.once('dialog', (dialog) => void dialog.accept())
    await page.getByLabel('Restore backup').setInputFiles(backupPath!)
    await expect.poll(async () => (await records(page)).length).toBe(2)
    expect(
      (await records(page)).find((record) => record.valueMode === 'values')?.structure,
    ).toEqual({ visible: 'save-local-visible', token: '[redacted]' })
    page.once('dialog', (dialog) => void dialog.accept())
    await page.getByRole('button', { name: 'Clear workspace', exact: true }).click()
    await expect.poll(async () => (await records(page)).length).toBe(0)
    expect(requests.some((request) => request.includes('SAVE_SECRET_CANARY_724'))).toBe(false)
  })
}
for (const width of [390, 1440]) {
  test(`sharing starts without values and confirms unmasking at ${width}px`, async ({
    page,
    context,
  }, testInfo) => {
    await page.setViewportSize({ width, height: width === 390 ? 780 : 900 })
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await page.goto('/')
    await page
      .getByLabel('Paste text or drop a file')
      .fill('{"visible":"share-local-visible","token":"SHARE_SECRET_CANARY_522"}')
    await expect(page.locator('.answer-final .output-view')).toContainText('share-local-visible')
    await page
      .locator('.result-action-bar')
      .getByRole('button', { name: 'Share', exact: true })
      .click()
    await expect(page.locator('.send-panel select')).toHaveValue('summary')
    await page.locator('.send-panel').getByRole('button', { name: 'Copy', exact: true }).click()
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('JSON')
    expect(await page.evaluate(() => navigator.clipboard.readText())).not.toContain(
      'share-local-visible',
    )
    await page.locator('.send-panel select').selectOption('value')
    await expect(page.locator('.send-panel pre')).toContainText('[redacted]')
    await expect(page.locator('.send-panel pre')).not.toContainText('SHARE_SECRET_CANARY_522')
    await page.locator('.send-panel').getByRole('button', { name: 'Copy', exact: true }).click()
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toContain('share-local-visible')
    const masked = await page.evaluate(() => navigator.clipboard.readText())
    expect(masked).toContain('share-local-visible')
    expect(masked).not.toContain('SHARE_SECRET_CANARY_522')
    page.once('dialog', (dialog) => void dialog.accept())
    await page.getByLabel('Include values without masking').check()
    await expect(page.locator('.send-panel pre')).toContainText('SHARE_SECRET_CANARY_522')
    await page.locator('.send-panel').getByRole('button', { name: 'Copy', exact: true }).click()
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toContain('SHARE_SECRET_CANARY_522')
    await page.locator('.send-panel select').selectOption('commands')
    await expect(page.locator('.send-panel pre')).not.toContainText('SHARE_SECRET_CANARY_522')
    await page.locator('.send-panel').getByRole('button', { name: 'Copy', exact: true }).click()
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('VALUE')
    const commands = await page.evaluate(() => navigator.clipboard.readText())
    expect(commands).toContain('VALUE')
    expect(commands).not.toContain('SHARE_SECRET_CANARY_522')
    const overflowing = await page
      .locator('.send-panel pre')
      .evaluate((node) => node.scrollHeight > node.clientHeight)
    if (overflowing) {
      await page.locator('.send-panel pre').focus()
      await page.locator('.send-panel pre').press('PageDown')
      await expect
        .poll(() => page.locator('.send-panel pre').evaluate((node) => node.scrollTop))
        .toBeGreaterThan(0)
    }
    expect(page.url()).not.toContain('share-local-visible')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`send-${width}.png`) })
  })
}
