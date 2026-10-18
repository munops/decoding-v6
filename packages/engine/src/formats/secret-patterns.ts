import type { Detector } from '../types'
import { inputText } from '../utils'
import { found, warning } from './common'
const patterns = [
  /\bAKIA[A-Z0-9]{16}\b/g,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
  /\bsk_(?:live|test)_[A-Za-z0-9]{12,}\b/g,
  /\bxox[baprs]-[A-Za-z0-9-]{12,}\b/g,
  /\bAIza[A-Za-z0-9_-]{20,}\b/g,
]
export function redactSecrets(text: string): string {
  let masked = text
  for (const pattern of patterns)
    masked = masked.replace(pattern, (token) => `${token.slice(0, 4)}[redacted]`)
  return masked
}
export const secretPatterns: Detector = {
  id: 'secret-patterns',
  detect(input) {
    const text = inputText(input),
      masked = redactSecrets(text)
    if (masked === text) return null
    const matches = patterns.flatMap((pattern) =>
      [...text.matchAll(pattern)].map((m) => ({
        prefix: m[0].slice(0, 4),
        test: m[0].startsWith('sk_test_'),
      })),
    )
    return found('secret-patterns', 'Secret-like credential pattern', masked, 1, {
      warnings: matches.map((m) =>
        warning(
          'SECRET-EXPOSED',
          `${m.prefix}… matches a public credential prefix. Revoke/rotate exposed credentials. No match does not prove safety.`,
          m.test ? 'info' : 'danger',
        ),
      ),
      metadata: {
        rotationUrl:
          'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository',
      },
    })
  },
}
