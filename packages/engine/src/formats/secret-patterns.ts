import { credentialPatterns as patterns, redactSecrets } from './credential-redaction'
export { redactSecrets } from './credential-redaction'
import type { Detector } from '../types'
import { inputText } from '../utils'
import { found, warning } from './common'
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
    if (!matches.length) return null
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
