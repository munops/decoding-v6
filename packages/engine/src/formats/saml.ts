import { boundedInflate, ExpansionLimit } from '../bounded-inflate'
import type { Detector } from '../types'
import { decodeBase64, inputText } from '../utils'
import { found, warning } from './common'
export const saml: Detector = {
  id: 'saml',
  detect(input, context) {
    let text = inputText(input).trim()
    if (!/<(?:[\w-]+:)?(?:Response|Assertion)\b/.test(text)) {
      const bytes = decodeBase64(text)
      if (!bytes) return null
      text = inputText(bytes)
      if (!text.trim().startsWith('<')) {
        try {
          const expanded = boundedInflate(bytes, 'deflate', context.limits)
          if (
            expanded.length > context.limits.maxExpandedBytes ||
            expanded.length > bytes.length * context.limits.maxCompressionRatio
          )
            return found('saml', 'SAML response', { error: 'Expansion limit' }, 0.999, {
              warnings: [
                warning(
                  'COMPRESSION-LIMIT',
                  'SAML decompression exceeded the output limit.',
                  'danger',
                ),
              ],
            })
          text = inputText(expanded)
        } catch (error) {
          if (error instanceof ExpansionLimit)
            return found('saml', 'SAML candidate', { error: 'Expansion stopped' }, 0.7, {
              warnings: [
                warning(
                  'COMPRESSION-LIMIT',
                  'Compressed candidate exceeded the expansion limit.',
                  'danger',
                ),
              ],
            })
          return null
        }
      }
    }
    if (
      !/<(?:[\w-]+:)?(?:Response|Assertion)\b/.test(text) ||
      !/(?:urn:oasis:names:tc:SAML|saml)/i.test(text)
    )
      return null
    if (!/<\/(?:[\w-]+:)?(?:Response|Assertion)\s*>/.test(text))
      return found('saml', 'SAML response', { xml: text, error: 'Malformed XML' }, 0.999, {
        warnings: [warning('XML-MALFORMED', 'The SAML XML is incomplete; raw XML is retained.')],
      })
    const issuer = /<(?:[\w-]+:)?Issuer\b[^>]*>([^<]*)<\//.exec(text)?.[1],
      audience = /<(?:[\w-]+:)?Audience\b[^>]*>([^<]*)<\//.exec(text)?.[1],
      notAfter = /\bNotOnOrAfter=["']([^"']+)["']/.exec(text)?.[1],
      signed = /<(?:[\w-]+:)?Signature\b/.test(text)
    return found(
      'saml',
      'SAML response / assertion',
      {
        issuer,
        audience,
        notOnOrAfter: notAfter,
        signaturePresent: signed,
        signatureVerified: false,
      },
      0.999,
      {
        warnings: [
          ...(notAfter && new Date(notAfter) < context.now
            ? [warning('SAML-EXPIRED', 'SAML assertion has expired.', 'danger')]
            : []),
          warning(
            'SAML-SIGNATURE-UNVERIFIED',
            'Signature presence is not signature verification.',
            'info',
          ),
        ],
      },
    )
  },
}
