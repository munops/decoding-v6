import type { Detector } from '../../types'
import { found, readable } from '../common'
/** This is a byte notation, not a claim that every binary-looking integer encodes text. */
export function byteNotation(id: string, radix: 2 | 8): Detector {
  const width = radix === 2 ? 8 : 3,
    prefix = radix === 2 ? '0b' : '0o'
  return {
    id,
    detect(input) {
      if (typeof input !== 'string') return null
      const text = input.trim()
      if (!text || !(radix === 2 ? /^[01]/ : /^[0-3]/).test(text)) return null
      const explicit = text.toLowerCase().includes(prefix)
      const separated = /\s/.test(text)
      const groups = separated
        ? text.split(/\s+/)
        : explicit
          ? [text]
          : (text.match(new RegExp(`.{1,${width}}`, 'g')) ?? [])
      if (!groups.length || (!separated && !explicit && text.length < width * 2)) return null
      const grammar = radix === 2 ? /^(?:0[bB])?[01]{8}$/ : /^(?:0[oO])?[0-3][0-7]{2}$/
      if (!groups.every((group) => grammar.test(group))) return null
      const bytes = Uint8Array.from(groups, (group) =>
        parseInt(group.replace(/^0[bo]/i, ''), radix),
      )
      const decoded = readable(bytes)
      return found(
        id,
        radix === 2 ? 'Binary bytes' : 'Octal bytes',
        decoded,
        explicit || separated ? 0.99 : 0.8,
        { decoded, metadata: { radix, byteCount: bytes.length, explicit } },
      )
    },
  }
}
export const binaryBytes = byteNotation('binary-bytes', 2)

export const octalBytes = byteNotation('octal-bytes', 8)
