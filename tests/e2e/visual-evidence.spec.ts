import { openAdvanced } from './ui-helpers'
import { expect, test, type Browser, type Page } from '@playwright/test'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'

const evidenceDir = process.env.DECODING_VISUAL_EVIDENCE_DIR
const expectedRevision = process.env.DECODING_EXPECTED_REVISION
const deployedBaseURL = process.env.PLAYWRIGHT_BASE_URL?.replace(/\/$/, '')
const cleanFingerprint = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'

type Capture = {
  path: string
  state: string
  viewport: { width: number; height: number }
}

async function openCleanPage(
  browser: Browser,
  viewport: { width: number; height: number },
): Promise<{ page: Page; close: () => Promise<void> }> {
  const context = await browser.newContext({
    viewport,
    locale: 'en-US',
    colorScheme: 'light',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
  })
  const page = await context.newPage()
  return { page, close: () => context.close() }
}

async function assertFirstVisit(page: Page, viewport: { width: number; height: number }) {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  if (deployedBaseURL) {
    expect(new URL(page.url()).origin).toBe(new URL(deployedBaseURL).origin)
  }
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('heading', { name: /Paste an unfamiliar value here/i })).toBeVisible()
  await expect(page.getByText('Only on this device', { exact: true })).toBeVisible()
  await expect(page.getByText('0 input bytes uploaded')).toHaveCount(0)
  // This preference existed before the handoff; its details stay collapsed on entry.
  await expect(page.locator('.copy-feedback-settings')).toHaveJSProperty('open', false)
  await expect(page.locator('[data-sample-id]')).toHaveCount(7)

  const input = page.getByLabel('Paste text or drop a file')
  await expect(input).toBeVisible()
  const inputBounds = await input.boundingBox()
  expect(inputBounds).not.toBeNull()
  expect(inputBounds?.y).toBeLessThan(viewport.height)
  expect((inputBounds?.y ?? 0) + (inputBounds?.height ?? 0)).toBeLessThanOrEqual(viewport.height)

  for (const sample of await page.locator('[data-sample-id]').all()) {
    await sample.scrollIntoViewIfNeeded()
    const bounds = await sample.boundingBox()
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width)
    expect(bounds!.height).toBeGreaterThanOrEqual(44)
  }
  await page.locator('.triage-sample-grid').evaluate((element) => {
    element.scrollLeft = 0
    scrollTo(0, 0)
  })

  const geometry = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    mainImages: document.querySelectorAll('main img').length,
    primaryInputs: document.querySelectorAll('#decoder-input').length,
    wrappedClickables: [
      ...document.querySelectorAll<HTMLElement>(
        '.site-header nav a, .input-actions .button, footer a',
      ),
    ]
      .filter((element) => element.offsetParent !== null)
      .filter((element) => {
        const range = document.createRange()
        range.selectNodeContents(element)
        const verticalRuns = [...range.getClientRects()]
          .map((rect) => ({ top: rect.top, bottom: rect.bottom }))
          .sort((left, right) => left.top - right.top)
          .reduce<Array<{ top: number; bottom: number }>>((runs, rect) => {
            const previous = runs.at(-1)
            // Badges and inline icons have a different top edge but overlap the text line.
            // Merge overlapping vertical intervals so the gate catches real wrapping only.
            if (previous && rect.top <= previous.bottom + 1) {
              previous.bottom = Math.max(previous.bottom, rect.bottom)
            } else {
              runs.push({ ...rect })
            }
            return runs
          }, [])
        return verticalRuns.length > 1
      })
      .map((element) => element.textContent?.trim()),
    storage: {
      local: Object.keys(localStorage),
      session: sessionStorage.length,
    },
  }))
  expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1)
  expect(geometry.mainImages).toBe(0)
  expect(geometry.primaryInputs).toBe(1)
  expect(geometry.wrappedClickables).toEqual([])
  expect(geometry.storage.session).toBe(0)
  expect(
    geometry.storage.local.filter(
      (key) =>
        !['decoding-home-seen', 'decoding-home-locale', 'decoding-first-visit'].includes(key),
    ),
  ).toEqual([])
  await expect(page.locator('#decoder-input')).toHaveValue('')
}

async function capture(page: Page, filename: string, state: string, captures: Capture[]) {
  if (!evidenceDir) throw new Error('DECODING_VISUAL_EVIDENCE_DIR is required')
  const viewport = page.viewportSize()
  if (!viewport) throw new Error('A fixed viewport is required for visual evidence')
  const path = resolve(evidenceDir, filename)
  await page.screenshot({ path, fullPage: false, animations: 'disabled' })
  captures.push({ path, state, viewport })
}

test('captures deployed clean-profile, core, unsupported, and material error states', async ({
  browser,
  request,
}) => {
  test.skip(!evidenceDir, 'Run only through the explicit visual-evidence capture command')
  mkdirSync(evidenceDir!, { recursive: true })

  expect(expectedRevision).toBeTruthy()
  let healthBody: { ok: boolean; service: string; revision: string } | null = null
  if (deployedBaseURL) {
    expect(deployedBaseURL).toBe('https://decod.ing')
    const health = await request.get(`${deployedBaseURL}/healthz`)
    expect(health.ok()).toBe(true)
    healthBody = await health.json()
    expect(healthBody).toMatchObject({
      ok: true,
      service: 'decoding-v6',
      revision: expectedRevision,
    })
  }

  const captures: Capture[] = []
  for (const viewport of [
    { width: 320, height: 844 },
    { width: 390, height: 844 },
    { width: 1440, height: 1000 },
  ]) {
    const { page, close } = await openCleanPage(browser, viewport)
    await assertFirstVisit(page, viewport)
    await expect(page.locator('meta[name="application-build"]')).toHaveAttribute(
      'content',
      expectedRevision!,
    )
    await capture(page, `home-first-${viewport.width}.png`, 'first_visit_clean', captures)
    await close()
  }

  {
    const viewport = { width: 1920, height: 1080 }
    const { page, close } = await openCleanPage(browser, viewport)
    await assertFirstVisit(page, viewport)
    await close()
  }

  {
    const { page, close } = await openCleanPage(browser, { width: 390, height: 844 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const sample = page.locator('[data-sample-id="nested"]')
    const defaultStyle = await sample.evaluate((element) => {
      const style = getComputedStyle(element)
      return { borderColor: style.borderColor, transitionProperty: style.transitionProperty }
    })
    expect(defaultStyle.transitionProperty).not.toContain('all')
    await sample.hover()
    const hoverStyle = await sample.evaluate((element) => ({
      borderColor: getComputedStyle(element).borderColor,
      transform: getComputedStyle(element).transform,
    }))
    expect(hoverStyle.borderColor).not.toBe(defaultStyle.borderColor)
    expect(hoverStyle.transform).not.toBe('none')

    await page.keyboard.press('Tab')
    await sample.focus()
    const focusStyle = await sample.evaluate((element) => {
      const style = getComputedStyle(element)
      return { outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth }
    })
    expect(focusStyle.outlineStyle).not.toBe('none')
    expect(Number.parseFloat(focusStyle.outlineWidth)).toBeGreaterThanOrEqual(3)

    await sample.click()
    await expect(page.locator('.answer-verdict')).toContainText('3 layers')
    await expect(page.locator('.answer-final .output-view')).toContainText('A-20391')
    await openAdvanced(page)
    await expect(
      page.getByRole('tree', { name: 'Decode chain' }).getByRole('treeitem'),
    ).toHaveCount(3)
    await page.locator('.answer-card').scrollIntoViewIfNeeded()
    await capture(page, 'home-core-synthetic-390.png', 'core_synthetic_decode', captures)
    await close()
  }

  {
    const { page, close } = await openCleanPage(browser, { width: 390, height: 844 })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const clear = page.getByRole('button', { name: 'Clear' })
    await expect(clear).toBeDisabled()
    await page.getByLabel('Paste text or drop a file').fill('?')
    await expect(page.locator('.answer-card')).toBeVisible()
    await expect(page.locator('.answer-card')).toContainText('We could not identify this value.')
    await page.locator('.answer-card').scrollIntoViewIfNeeded()
    await capture(page, 'home-unsupported-390.png', 'unsupported', captures)
    await close()
  }

  {
    const { page, close } = await openCleanPage(browser, { width: 390, height: 844 })
    await page.route('**/_astro/decoder.worker-*.js', async (route) => route.abort('failed'))
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.getByLabel('Paste text or drop a file').fill('eyJsb2NhbCI6dHJ1ZSwidG9vbHMiOjQ3fQ==')
    await expect(page.getByText('Unable to decode this input.')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible()
    await page.getByText('Unable to decode this input.').scrollIntoViewIfNeeded()
    await capture(page, 'home-worker-error-390.png', 'worker_error', captures)
    await close()
  }

  {
    const { page, close } = await openCleanPage(browser, { width: 390, height: 844 })
    await page.route('**/_astro/decoder.worker-*.js', async (route) => {
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 750))
      await route.continue()
    })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.getByLabel('Paste text or drop a file').fill('eyJsb2NhbCI6dHJ1ZSwidG9vbHMiOjQ3fQ==')
    await expect(page.getByText('Checking formats locally…')).toBeVisible()
    const motion = await page.locator('[data-sample-id="nested"]').evaluate((element) => ({
      duration: getComputedStyle(element).transitionDuration,
      animation: getComputedStyle(element).animationName,
    }))
    expect(motion.duration.split(',').every((value) => Number.parseFloat(value) === 0)).toBe(true)
    expect(motion.animation).toBe('none')
    await close()
  }

  const receipt = {
    schemaVersion: 1,
    checkedAt: new Date().toISOString(),
    target: deployedBaseURL ?? 'local-static-preview',
    navigationOrigin: deployedBaseURL,
    captureSourceIdentity: {
      kind: deployedBaseURL ? 'deployed_capture' : 'local_static_capture',
      baseHead: expectedRevision,
      dirtyFingerprint: cleanFingerprint,
    },
    health: healthBody,
    cleanProfile: {
      locale: 'en-US',
      colorScheme: 'light',
      reducedMotion: 'reduce',
      serviceWorkers: 'block',
      isolatedContexts: true,
    },
    captures: captures.map((item) => {
      const bytes = readFileSync(item.path)
      return {
        path: basename(item.path),
        state: item.state,
        viewport: item.viewport,
        pixels: {
          width: bytes.readUInt32BE(16),
          height: bytes.readUInt32BE(20),
        },
        sha256: createHash('sha256').update(bytes).digest('hex'),
      }
    }),
  }
  writeFileSync(
    resolve(evidenceDir!, 'capture-receipt.json'),
    `${JSON.stringify(receipt, null, 2)}\n`,
  )
})
