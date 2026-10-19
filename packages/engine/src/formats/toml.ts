import type { Detector } from '../types'
import { inputText } from '../utils'
import { found, warning, parserUnavailable, unavailableDetection, parserPosition } from './common'
export const toml: Detector = {
  id: 'toml',
  async detect(input, context) {
    const text = inputText(input).trim()
    if (!/^\s*\[\[?[\w."'-]+\]?\]\s*$/m.test(text) || !/^\s*[\w"'.-]+\s*=/m.test(text)) return null
    if (!context.codecs?.toml)
      return found(
        'toml',
        'TOML',
        { note: 'TOML table and key syntax. Open the web parser once online for the full tree.' },
        0.99,
      )
    try {
      return found('toml', 'TOML', await context.codecs.toml(text), 0.999)
    } catch (error) {
      if (parserUnavailable(error)) return unavailableDetection('toml', 'TOML', input, 0.999)
      return found(
        'toml',
        'TOML',
        {
          error: 'Invalid TOML',
          ...parserPosition(error),
        },
        0.99,
        { warnings: [warning('TOML-INVALID', 'The TOML parser could not read this document.')] },
      )
    }
  },
}
