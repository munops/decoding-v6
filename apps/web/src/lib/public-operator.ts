import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
const require = createRequire(
  new URL('../../../../packages/operations/package.json', import.meta.url),
)
const { parse } = require('yaml') as { parse: (text: string) => Record<string, unknown> }
const identity = parse(
  readFileSync(
    resolve(
      process.env.DECODING_WORKSPACE_ROOT ?? '/Users/minhan/Desktop/workspace',
      'hq/bootstrap/identity.yaml',
    ),
    'utf8',
  ),
)
if (
  typeof identity.brand_display_name !== 'string' ||
  typeof identity.brand_korean_name !== 'string'
)
  throw new Error('Public operator identity unavailable')
/** Allowlist only the centrally owned public brand. Never export legal-owner PII. */
export const publicOperator = {
  name: identity.brand_display_name,
  koreanName: identity.brand_korean_name,
}
