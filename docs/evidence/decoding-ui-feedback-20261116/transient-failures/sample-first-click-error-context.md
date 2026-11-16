# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/product.spec.ts >> offers seven examples and reaches a real layered answer
- Location: tests/e2e/product.spec.ts:27:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('.answer-verdict')
Expected substring: "3 layers"
Timeout: 8000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 8000ms
  - waiting for locator('.answer-verdict')

```

```yaml
- link "Skip to content":
  - /url: "#main"
- banner:
  - link "decod.ing home":
    - /url: /
    - text: decod.ing
  - navigation "Primary":
    - link "Decode":
      - /url: /
    - link "Tools":
      - /url: /tools/
    - link "Saved":
      - /url: /workspace/
    - link "More":
      - /url: /more/
  - group: English
  - button "Toggle color theme"
  - text: Local only
- main:
  - heading "Paste an unfamiliar value here." [level=1]
  - paragraph:
    - text: Unknown text, garbled letters, long links or a QR photo. Find out what it is and decode every layer on this device.
    - link "Check local processing":
      - /url: /proof/
  - region "Universal decoder":
    - link "Only on this device":
      - /url: /proof/
    - text: Paste text or drop a file
    - button "Clear" [disabled]
    - textbox "Paste text or drop a file":
      - /placeholder: Tap here and paste
    - button "Paste"
    - text: Photo / QR
    - button "Photo / QR"
    - text: Open file
    - button "Open file"
    - text: Max 10 MiB
    - group "Does one of these look familiar? Try an example.":
      - text: Does one of these look familiar? Try an example.
      - button "Garbled text":
        - strong: Garbled text
      - button "Long link":
        - strong: Long link
      - button "Login token":
        - strong: Login token
      - button "Several layers":
        - strong: Several layers
      - button "Mail subject":
        - strong: Mail subject
      - button "Ten-digit number":
        - strong: Ten-digit number
      - button "QR photo":
        - strong: QR photo
    - group: Copy feedback
- contentinfo:
  - link "decod.ing":
    - /url: /
  - paragraph: Unknown text. Clear answers. On this device.
  - link "Device data":
    - /url: /data/
  - link "Check local processing":
    - /url: /proof/
  - link "Bookmarklet":
    - /url: /bookmarklet/
  - link "Sponsor":
    - /url: /sponsor/
  - link "49 Tools":
    - /url: /tools/
  - link "Privacy":
    - /url: /privacy/
  - link "Terms":
    - /url: /terms/
  - link "Support":
    - /url: /support/
  - link "Method":
    - /url: /methodology/
  - link "Desktop":
    - /url: /download/
  - link "Changelog":
    - /url: /changelog/
  - link "About":
    - /url: /about/
  - paragraph: No account. No upload. No generative AI. No tracking ads. MUNOPS (문옵스) · Build e0afc68 · 63 formats
  - checkbox "Count actions only" [checked]
  - text: Count actions only
```

# Test source

```ts
  1   | import { runTool } from './ui-helpers'
  2   | import { openAdvanced } from './ui-helpers'
  3   | import { expect, test } from '@playwright/test'
  4   | 
  5   | test('auto-detects a nested Base64 JSON payload locally', async ({ page }) => {
  6   |   await page.goto('/')
  7   |   await expect(page.getByRole('heading', { name: /Paste an unfamiliar value here/i })).toBeVisible()
  8   |   const input = page.getByLabel('Paste text or drop a file')
  9   |   await input.fill('eyJsb2NhbCI6dHJ1ZSwidG9vbHMiOjQ3fQ==')
  10  |   await expect(page.getByText('Base64', { exact: false }).first()).toBeVisible()
  11  |   await expect(page.getByText('JSON', { exact: false }).first()).toBeVisible()
  12  |   await openAdvanced(page)
  13  |   const chain = page.getByRole('tree', { name: 'Decode chain' })
  14  |   const stages = chain.getByRole('treeitem')
  15  |   await expect(stages).toHaveCount(2)
  16  |   await expect(chain.getByLabel(/^Step 1:/)).toBeVisible()
  17  |   await expect(chain.getByLabel(/^Step 2:/)).toBeVisible()
  18  |   await expect(chain.getByText(/Input: \d+ bytes/).first()).toBeVisible()
  19  |   await stages.first().focus()
  20  |   await page.keyboard.press('ArrowDown')
  21  |   await expect(stages.nth(1)).toBeFocused()
  22  |   await page.keyboard.press('ArrowLeft')
  23  |   await expect(stages.first()).toBeFocused()
  24  |   await expect(page.getByText('Only on this device', { exact: true })).toBeVisible()
  25  | })
  26  | 
  27  | test('offers seven examples and reaches a real layered answer', async ({ page }) => {
  28  |   await page.goto('/')
  29  |   await expect(page.locator('[data-sample-id]')).toHaveCount(7)
  30  |   await page.locator('[data-sample-id="nested"]').click()
> 31  |   await expect(page.locator('.answer-verdict')).toContainText('3 layers')
      |                                                 ^ Error: expect(locator).toContainText(expected) failed
  32  |   await expect(page.locator('.answer-final .output-view')).toContainText('A-20391')
  33  |   await page.locator('[data-sample-id="expired-jwt"]').click()
  34  |   await expect(page.locator('.answer-concerns')).toContainText('expired')
  35  | })
  36  | 
  37  | test('ships the Reveal Ledger mark and persists an explicit theme choice locally', async ({
  38  |   page,
  39  | }) => {
  40  |   await page.goto('/')
  41  |   await expect(page.locator('.site-header .brand-symbol')).toBeVisible()
  42  |   await expect(page.locator('.site-header .brand-name')).toContainText('decod.ing')
  43  |   const toggle = page.getByRole('button', { name: 'Toggle color theme' })
  44  |   const initialPressed = await toggle.getAttribute('aria-pressed')
  45  |   await toggle.click()
  46  |   const expectedTheme = initialPressed === 'true' ? 'light' : 'dark'
  47  |   await expect(page.locator('html')).toHaveAttribute('data-theme', expectedTheme)
  48  |   await expect(page.evaluate(() => localStorage.getItem('decoding-theme'))).resolves.toBe(
  49  |     expectedTheme,
  50  |   )
  51  |   await page.reload()
  52  |   await expect(page.locator('html')).toHaveAttribute('data-theme', expectedTheme)
  53  | })
  54  | 
  55  | test('keeps ambiguous formats explicit instead of auto-selecting a chain stage', async ({
  56  |   page,
  57  | }) => {
  58  |   await page.goto('/')
  59  |   await page.getByLabel('Paste text or drop a file').fill('deadbeef')
  60  |   await expect(page.locator('.answer-verdict')).toContainText('not certain')
  61  |   await openAdvanced(page)
  62  |   const chain = page.getByRole('tree', { name: 'Decode chain' })
  63  |   await expect(chain.getByLabel(/^Step 1:/)).toBeVisible()
  64  |   await expect(chain.getByText(/Input: 8 bytes/)).toBeVisible()
  65  |   await page.getByRole('button', { name: 'Possible formats', exact: true }).click()
  66  |   const options = page.getByRole('listbox', { name: 'Possible formats' }).getByRole('option')
  67  |   await expect(options).toHaveCount(2)
  68  |   await expect(options.first()).toContainText(/Hexadecimal bytes|Base64/)
  69  | })
  70  | 
  71  | test('plays a local copy cue only after an explicit successful copy and persists its control', async ({
  72  |   page,
  73  |   context,
  74  | }) => {
  75  |   await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  76  |   await page.addInitScript(() => {
  77  |     type FeedbackWindow = Window & { __copyFeedbackStarts?: number }
  78  |     const feedbackWindow = window as FeedbackWindow
  79  |     feedbackWindow.__copyFeedbackStarts = 0
  80  |     class FakeAudioContext {
  81  |       currentTime = 0
  82  |       destination = {}
  83  |       resume = async () => undefined
  84  |       createGain = () => ({
  85  |         gain: { setValueAtTime: () => undefined, linearRampToValueAtTime: () => undefined },
  86  |         connect: () => undefined,
  87  |       })
  88  |       createOscillator = () => ({
  89  |         frequency: { setValueAtTime: () => undefined },
  90  |         type: 'sine',
  91  |         connect: () => undefined,
  92  |         start: () => {
  93  |           feedbackWindow.__copyFeedbackStarts = (feedbackWindow.__copyFeedbackStarts ?? 0) + 1
  94  |         },
  95  |         stop: () => undefined,
  96  |       })
  97  |     }
  98  |     Object.defineProperty(window, 'AudioContext', { configurable: true, value: FakeAudioContext })
  99  |   })
  100 |   await page.goto('/')
  101 |   await page.getByLabel('Paste text or drop a file').fill('dGVzdA==')
  102 |   await page.getByLabel('Paste text or drop a file').blur()
  103 |   await page.getByRole('button', { name: 'Copy', exact: true }).click()
  104 |   await expect(page.getByText('Selected result copied.')).toBeVisible()
  105 |   await expect
  106 |     .poll(() =>
  107 |       page.evaluate(
  108 |         () => (window as Window & { __copyFeedbackStarts?: number }).__copyFeedbackStarts,
  109 |       ),
  110 |     )
  111 |     .toBe(2)
  112 | 
  113 |   await page.locator('.copy-feedback-settings summary').click()
  114 |   const enabled = page.getByRole('checkbox', { name: 'Play a sound after copying' })
  115 |   await enabled.uncheck()
  116 |   await page.getByRole('button', { name: 'Copy', exact: true }).click()
  117 |   await expect
  118 |     .poll(() =>
  119 |       page.evaluate(
  120 |         () => (window as Window & { __copyFeedbackStarts?: number }).__copyFeedbackStarts,
  121 |       ),
  122 |     )
  123 |     .toBe(2)
  124 |   await expect(page.evaluate(() => localStorage.getItem('decoding-copy-feedback'))).resolves.toBe(
  125 |     '{"enabled":false,"volume":0.3}',
  126 |   )
  127 | })
  128 | 
  129 | test('lists all searchable tools', async ({ page }) => {
  130 |   await page.goto('/tools/')
  131 |   await expect(page.locator('.catalog-shell')).toHaveAttribute('data-hydrated', 'true')
```