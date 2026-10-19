import { binaryGrammar } from './binary-grammar'
import type { Detector } from '../types'
import { found, parserUnavailable, unavailableDetection } from './common'
export const msgpack: Detector = {
  id: 'msgpack',
  async detect(input, context) {
    if (typeof input === 'string' || input.length < 2) return null
    const first = input[0]!
    if (!(
      (first >= 0x80 && first <= 0x9f) ||
      first === 0xdc ||
      first === 0xdd ||
      first === 0xde ||
      first === 0xdf
    ))
      return null
    if (!binaryGrammar(input, 'msgpack')) return null
    if (!context.codecs?.msgpack)
      return found(
        'msgpack',
        'MessagePack candidate',
        {
          bytes: input.length,
          note: 'This surface recognizes MessagePack structure but cannot open the full tree. Use the web decoder.',
        },
        0.7,
      )
    try {
      return found('msgpack', 'MessagePack candidate', await context.codecs.msgpack(input), 0.7)
    } catch (error) {
      if (parserUnavailable(error))
        return unavailableDetection('msgpack', 'MessagePack candidate', input, 0.7)
      return null
    }
  },
}
