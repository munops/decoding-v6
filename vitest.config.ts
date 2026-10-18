import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      'packages/**/*.test.ts',
      'apps/cli/**/*.test.ts',
      'apps/web/**/*.test.ts',
      'apps/edge/**/*.test.ts',
    ],
    coverage: { reporter: ['text', 'json-summary'] },
  },
})
