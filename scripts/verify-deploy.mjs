import { chromium } from '@playwright/test'

const baseURL = process.argv
  .slice(2)
  .find((argument) => argument !== '--')
  ?.replace(/\/$/, '')

if (!baseURL) {
  throw new Error('Usage: node scripts/verify-deploy.mjs <base-url>')
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({
  viewport: { width: 390, height: 844 },
  locale: 'en-US',
  colorScheme: 'light',
  reducedMotion: 'reduce',
})
const canary = 'DECODING_DEPLOY_CANARY_6b4761e7_secret'
const canaryLeaks = []
const externalOrigins = new Set()

page.on('request', (request) => {
  const requestURL = new URL(request.url())
  if (requestURL.origin !== new URL(baseURL).origin) externalOrigins.add(requestURL.origin)

  const material = [
    request.url(),
    request.postData() ?? '',
    JSON.stringify(request.headers()),
  ].join('\n')
  if (material.includes(canary) || material.includes(encodeURIComponent(canary))) {
    canaryLeaks.push(`${request.method()} ${request.url()}`)
  }
})

try {
  // The aggregate-only counters use fetch({ keepalive: true }). Chromium can keep those
  // completed same-origin requests in Playwright's pending set, so networkidle is not a
  // reliable readiness signal. Load plus the explicit product assertions below is stricter.
  await page.goto(`${baseURL}/`, { waitUntil: 'load' })
  const linkedAssets = await page.evaluate(async () => {
    const paths = [...document.querySelectorAll('link[rel="stylesheet"][href], script[src]')].map(
      (element) => element.getAttribute(element.tagName === 'LINK' ? 'href' : 'src'),
    )
    return Promise.all(
      paths.filter(Boolean).map(async (path) => {
        const response = await fetch(path)
        return {
          path,
          status: response.status,
          contentType: response.headers.get('content-type') ?? '',
        }
      }),
    )
  })
  const brokenAssets = linkedAssets.filter(
    (asset) =>
      asset.status !== 200 ||
      (asset.path.endsWith('.css') && !asset.contentType.includes('text/css')) ||
      (asset.path.endsWith('.js') && !asset.contentType.includes('javascript')),
  )
  if (brokenAssets.length > 0)
    throw new Error(`Broken linked assets: ${JSON.stringify(brokenAssets)}`)
  const launchpad = page.getByRole('group', { name: 'Try a safe synthetic case' })
  await launchpad.waitFor()
  if ((await launchpad.getByRole('button').count()) !== 3) {
    throw new Error('Expected exactly three synthetic triage cases')
  }
  await page.getByText('Input stays on this device. No account, upload, or AI.').waitFor()
  if ((await page.getByText('0 input bytes uploaded').count()) !== 0) {
    throw new Error('Expected the obsolete duplicate upload claim to be absent')
  }
  if ((await page.locator('.copy-feedback-settings').count()) !== 0) {
    throw new Error('Expected copy feedback settings only after a result exists')
  }
  const firstVisitGeometry = await page.evaluate(() => {
    const inputSurface = document.querySelector('.paste-surface')?.getBoundingClientRect()
    const samples = [...document.querySelectorAll('[data-sample-id]')].map((element) =>
      element.getBoundingClientRect(),
    )
    return {
      surfaceBottom: inputSurface?.bottom ?? Number.POSITIVE_INFINITY,
      sampleOverflow: samples.some(
        (bounds) => bounds.left < 0 || bounds.right > document.documentElement.clientWidth,
      ),
    }
  })
  if (firstVisitGeometry.surfaceBottom > 844 || firstVisitGeometry.sampleOverflow) {
    throw new Error(`First-visit geometry failed: ${JSON.stringify(firstVisitGeometry)}`)
  }
  await launchpad.getByRole('button', { name: 'Nested Base64 → JSON' }).click()
  await page.getByRole('tree', { name: 'Decode chain' }).getByRole('treeitem').nth(1).waitFor()

  await page.getByLabel('Paste text or drop a file').fill(btoa(JSON.stringify({ secret: canary })))
  await page.getByText('Base64', { exact: false }).first().waitFor()
  await page.getByText('JSON', { exact: false }).first().waitFor()
  await page.locator('.copy-feedback-settings').waitFor()

  const storage = await page.evaluate(async () => {
    const databases = 'databases' in indexedDB ? await indexedDB.databases() : []
    return JSON.stringify({
      localStorage: { ...localStorage },
      sessionStorage: { ...sessionStorage },
      databases,
      history: history.state,
    })
  })

  if (storage.includes(canary)) throw new Error('Synthetic canary was persisted in browser storage')
  if (canaryLeaks.length > 0) throw new Error(`Synthetic canary leaked: ${canaryLeaks.join(', ')}`)

  await page.goto(`${baseURL}/tools/`, { waitUntil: 'load' })
  await page.getByText('47 of 47 tools').waitFor()
  if ((await page.locator('.tool-card').count()) !== 47)
    throw new Error('Expected exactly 47 tools')

  await page.goto(`${baseURL}/json-format/`, { waitUntil: 'load' })
  await page.locator('.operation-pane textarea').first().fill('{"answer":42,"local":true}')
  await page.getByRole('button', { name: 'Run locally' }).click()
  await page
    .locator('.output-view')
    .getByText(/"answer": 42/)
    .waitFor()

  for (const route of ['/privacy/', '/terms/', '/support/']) {
    const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'load' })
    if (response?.status() !== 200) throw new Error(`Expected 200 for ${route}`)
    if ((await page.locator('main h1').count()) !== 1)
      throw new Error(`Expected one h1 for ${route}`)
  }

  if (externalOrigins.size > 0) {
    throw new Error(`Unexpected external request origins: ${[...externalOrigins].join(', ')}`)
  }

  console.log(
    JSON.stringify(
      {
        baseURL,
        syntheticTriageCases: 3,
        autoDetection: 'passed',
        toolCount: 47,
        localOperation: 'passed',
        canaryEgress: 'none',
        canaryStorage: 'none',
        externalRequestOrigins: [],
        linkedAssets: 'passed',
        trustRoutes: ['privacy', 'terms', 'support'],
      },
      null,
      2,
    ),
  )
} finally {
  await browser.close()
}
