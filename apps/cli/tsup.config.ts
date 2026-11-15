import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  noExternal: [/.*/],
  esbuildOptions(options) {
    options.legalComments = 'eof'
  },
  dts: true,
  clean: true,
  banner: {
    js: '#!/usr/bin/env node\nimport { createRequire as decodingCreateRequire } from "node:module"; const require = decodingCreateRequire(import.meta.url);',
  },
})
