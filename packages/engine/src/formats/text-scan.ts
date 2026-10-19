import type { Detector } from '../types'
import { inputText } from '../utils'
import { found } from './common'
export const textScan: Detector = {
  id: 'text-scan',
  detect(input) {
    const text = inputText(input)
    if (!/\s/.test(text) || text.length < 8 || /^\s*[{[<]/.test(text)) return null
    const matches = [
      ...text.matchAll(
        /\b(?:eyJ[\w-]+\.[\w-]+\.[\w-]*|https?:\/\/[^\s<>]+|(?:\d{1,3}\.){3}\d{1,3}|[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}|[A-Za-z0-9+/]{16,}={1,2})(?![\w-])/gi,
      ),
    ]
      .slice(0, 64)
      .map((m) => ({ offset: m.index, encoded: m[0] }))
    return matches.length
      ? found(
          'text-scan',
          'Encoded values in text',
          { matches: matches.map((m) => ({ offset: m.offset, length: m.encoded.length })) },
          0.7,
          { metadata: { embedded: matches } },
        )
      : null
  },
}
