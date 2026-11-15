import { diagnosticField } from '../diagnostics'
import type { Detector } from '../types'
import { decodeBase64, inputText } from '../utils'
import { found, warning } from './common'
export const dataUri: Detector = {
  id: 'data-uri',
  detect(input, context) {
    const match = /^data:([^,]*),([\s\S]*)$/.exec(inputText(input).trim())
    if (!match) return null
    const mime = match[1]?.split(';')[0] || 'text/plain'
    try {
      const bytes = /;base64(?:;|$)/i.test(match[1] ?? '')
        ? decodeBase64(match[2] ?? '')
        : new TextEncoder().encode(decodeURIComponent(match[2] ?? ''))
      if (!bytes) throw new Error('Invalid data URI')
      if (bytes.length > context.limits.maxInputBytes)
        return found(
          'data-uri',
          'Data URI',
          { mime, error: diagnosticField({ code: 'diagnostic-data-uri-error' }) },
          0.999,
          {
            warnings: [warning('INPUT-LIMIT', { code: 'warning-input-limit' })],
          },
        )
      return found('data-uri', 'Data URI', { mime, bytes: bytes.length }, 0.999, { decoded: bytes })
    } catch {
      return found(
        'data-uri',
        'Data URI',
        { mime, error: diagnosticField({ code: 'diagnostic-data-uri-error-2' }) },
        0.99,
      )
    }
  },
}
