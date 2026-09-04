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

test('mobile first action stays above the fold without a competing filled control', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.getByLabel('Paste text or drop a file')).toBeVisible()
  const metrics = await page.evaluate(() => {
    const channels = (value: string) =>
      [...value.matchAll(/[\d.]+/g)].slice(0, 3).map((match) => Number(match[0]) / 255)
    const luminance = (value: string) => {
      const [red = 0, green = 0, blue = 0] = channels(value).map((channel) =>
        channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
      )
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue
    }
    const contrast = (foreground: string, background: string) => {
      const light = Math.max(luminance(foreground), luminance(background))
      const dark = Math.min(luminance(foreground), luminance(background))
      return (light + 0.05) / (dark + 0.05)
    }
    const pasteSurface = document.querySelector<HTMLElement>('.paste-surface')
    const fileAction = document.querySelector<HTMLElement>('.input-actions .file-action')
    const clear = document.querySelector<HTMLButtonElement>('.input-actions button:disabled')
    const sampleLabel = document.querySelector<HTMLElement>('.triage-launchpad > .eyebrow')
    const samples = [...document.querySelectorAll<HTMLElement>('.triage-sample')].map((sample) => {
      const bounds = sample.getBoundingClientRect()
      return { top: bounds.top, width: bounds.width }
    })
    const clearStyle = clear ? getComputedStyle(clear) : null
    const surfaceStyle = pasteSurface ? getComputedStyle(pasteSurface) : null
    return {
      pasteTop: pasteSurface?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY,
      heroRepeatsDeviceClaim: document
        .querySelector('.hero-copy > p')
        ?.textContent?.toLowerCase()
        .includes('on this device'),
      fileBackground: fileAction ? getComputedStyle(fileAction).backgroundColor : '',
      clearOpacity: clearStyle?.opacity,
      clearContrast:
        clearStyle && surfaceStyle ? contrast(clearStyle.color, surfaceStyle.backgroundColor) : 0,
      sampleLabelTransform: sampleLabel ? getComputedStyle(sampleLabel).textTransform : '',
      samples,
    }
  })
  expect(metrics.pasteTop).toBeLessThanOrEqual(300)
  expect(metrics.heroRepeatsDeviceClaim).toBe(false)
  expect(metrics.fileBackground).toBe('rgba(0, 0, 0, 0)')
  expect(metrics.clearOpacity).toBe('1')
  expect(metrics.clearContrast).toBeGreaterThanOrEqual(4.5)
  expect(metrics.sampleLabelTransform).toBe('none')
  expect(new Set(metrics.samples.map((sample) => Math.round(sample.top))).size).toBe(1)
  expect(Math.max(...metrics.samples.map((sample) => sample.width))).toBeLessThanOrEqual(
    Math.min(...metrics.samples.map((sample) => sample.width)) + 1,
  )
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

test('Korean copy keeps whole words and readable type at 320, 390, and 1440 pixels', async ({
  page,
}) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const route of ['/ko/', '/ko/tools/', '/ko/json-format/', '/ko/methodology/']) {
      await page.goto(route)
      const result = await page.evaluate(() => {
        const elements = [
          ...document.querySelectorAll<HTMLElement>(
            'h1, .hero-copy > p, .page-hero > p, .tool-hero > div > p, .prose .lead',
          ),
        ]
        const splitWords: string[] = []
        for (const element of elements) {
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
          let node: Node | null
          while ((node = walker.nextNode())) {
            const text = node.textContent ?? ''
            for (const match of text.matchAll(/\S+/gu)) {
              if (!/[가-힣]/u.test(match[0])) continue
              const range = document.createRange()
              range.setStart(node, match.index ?? 0)
              range.setEnd(node, (match.index ?? 0) + match[0].length)
              if (range.getClientRects().length > 1) splitWords.push(match[0])
            }
          }
        }
        const h1 = document.querySelector<HTMLElement>('h1')
        const h1Style = h1 ? getComputedStyle(h1) : null
        const h1LineTops = new Set<number>()
        if (h1) {
          const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT)
          const range = document.createRange()
          let node: Node | null
          while ((node = walker.nextNode())) {
            for (let index = 0; index < (node.textContent?.length ?? 0); index += 1) {
              if (/\s/u.test(node.textContent?.[index] ?? '')) continue
              range.setStart(node, index)
              range.setEnd(node, index + 1)
              h1LineTops.add(Math.round(range.getBoundingClientRect().top))
            }
          }
        }
        return {
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          outOfBounds: elements
            .filter((element) => {
              const bounds = element.getBoundingClientRect()
              return bounds.left < -1 || bounds.right > document.documentElement.clientWidth + 1
            })
            .map((element) => element.textContent?.trim()),
          splitWords,
          wordBreak: h1Style?.wordBreak,
          overflowWrap: h1Style?.overflowWrap,
          h1LineCount: h1LineTops.size,
          lineHeightRatio:
            h1Style && Number.parseFloat(h1Style.fontSize)
              ? Number.parseFloat(h1Style.lineHeight) / Number.parseFloat(h1Style.fontSize)
              : 0,
          letterSpacingRatio:
            h1Style && Number.parseFloat(h1Style.fontSize)
              ? Number.parseFloat(h1Style.letterSpacing) / Number.parseFloat(h1Style.fontSize)
              : -1,
        }
      })
      expect(result.scrollWidth).toBeLessThanOrEqual(result.clientWidth + 1)
      expect(result.outOfBounds).toEqual([])
      expect(result.splitWords).toEqual([])
      expect(result.wordBreak).toBe('keep-all')
      expect(result.overflowWrap).toBe('break-word')
      expect(result.lineHeightRatio).toBeGreaterThanOrEqual(1.15)
      expect(result.letterSpacingRatio).toBeGreaterThanOrEqual(-0.03)
      if (route === '/ko/' && width <= 390) expect(result.h1LineCount).toBe(2)
    }
  }
})
