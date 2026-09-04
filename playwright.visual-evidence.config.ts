import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  reporter: [['list']],
  workers: 1,
  use: {
    baseURL: process.env.DECODING_VISUAL_EVIDENCE_URL ?? 'https://decod.ing',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
})
