import { diagnosticField } from '../diagnostics'
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
            return found(
              'saml',
              'SAML response',
              { error: diagnosticField({ code: 'diagnostic-saml-error' }) },
              0.999,
              {
                warnings: [
                  warning('COMPRESSION-LIMIT', { code: 'warning-compression-limit-2' }, 'danger'),
                ],
              },
            )
          text = inputText(expanded)
        } catch (error) {
          if (error instanceof ExpansionLimit)
            return found(
              'saml',
              'SAML candidate',
              { error: diagnosticField({ code: 'diagnostic-saml-error-2' }) },
              0.7,
              {
                warnings: [
                  warning('COMPRESSION-LIMIT', { code: 'warning-compression-limit-3' }, 'danger'),
                ],
              },
            )
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
      return found(
        'saml',
        'SAML response',
        { xml: text, error: diagnosticField({ code: 'diagnostic-saml-error-3' }) },
        0.999,
        {
          warnings: [warning('XML-MALFORMED', { code: 'warning-xml-malformed' })],
        },
      )
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
            ? [warning('SAML-EXPIRED', { code: 'warning-saml-expired' }, 'danger')]
            : []),
          warning(
            'SAML-SIGNATURE-UNVERIFIED',
            { code: 'warning-saml-signature-unverified' },
            'info',
          ),
        ],
      },
    )
  },
}
