import { diagnosticField } from '../diagnostics'
import type { Detector } from '../types'
import { decodeBase64, inputText } from '../utils'
import { found } from './common'
export const jwe: Detector = {
  id: 'jwe',
  detect(input) {
    const parts = inputText(input).trim().split('.')
    if (parts.length !== 5 || !parts[0] || !parts[2] || !parts[3] || !parts[4]) return null
    try {
      const bytes = decodeBase64(parts[0])
      if (!bytes) return null
      const header = JSON.parse(inputText(bytes)) as Record<string, unknown>
      if (typeof header.alg !== 'string' || typeof header.enc !== 'string') return null
      return found(
        'jwe',
        'JWE encrypted token',
        { header, note: diagnosticField({ code: 'diagnostic-jwe-note' }) },
        0.999,
      )
    } catch {
      return null
    }
  },
}
