import { binaryGrammar } from './binary-grammar'
import type { Detector } from '../types'
import { found, parserUnavailable, unavailableDetection } from './common'
export const cbor: Detector = {
  id: 'cbor',
  async detect(input, context) {
    if (typeof input === 'string' || input.length < 2) return null
    const tagged = input[0] === 0xd9 && input[1] === 0xd9 && input[2] === 0xf7
    const first = input[0]!
    if (!tagged && !(first >= 0x80 && first <= 0xbf)) return null
    if (!binaryGrammar(input, 'cbor')) return null
    if (!context.codecs?.cbor)
      return tagged
        ? found(
            'cbor',
            'CBOR self-described data',
            { tag: 55799, note: 'This surface recognizes CBOR but does not have a local parser.' },
            0.999,
          )
        : found(
            'cbor',
            'CBOR candidate',
            { bytes: input.length, note: 'Open the web parser for the full tree.' },
            0.68,
          )
    try {
      return found(
        'cbor',
        tagged ? 'CBOR self-described data' : 'CBOR candidate',
        await context.codecs.cbor(input),
        tagged ? 0.999 : 0.68,
        { metadata: { tag: tagged ? 55799 : undefined } },
      )
    } catch (error) {
      if (parserUnavailable(error))
        return unavailableDetection('cbor', 'CBOR candidate', input, tagged ? 0.999 : 0.68)
      return null
    }
  },
}
