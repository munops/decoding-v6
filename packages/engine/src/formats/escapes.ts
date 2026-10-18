import type { Detector } from '../types'
import { inputText } from '../utils'
import { found, warning } from './common'
const entities: Record<string, string> = {
  lt: '<',
  gt: '>',
  amp: '&',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
  copy: '©',
  reg: '®',
  eacute: 'é',
}
export const htmlEntities: Detector = {
  id: 'html-entities',
  detect(input) {
    const text = inputText(input)
    if (!/&(?:#[xX][a-f\d]+|#\d+|[a-z]+);/i.test(text)) return null
    const unknown: string[] = []
    const decoded = text.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (original, name: string) => {
      if (name.startsWith('#')) {
        const n =
          name[1]?.toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : Number(name.slice(1))
        return n <= 0x10ffff && !(n >= 0xd800 && n <= 0xdfff) ? String.fromCodePoint(n) : original
      }
      const decoded = entities[name.toLowerCase()]
      if (decoded === undefined) unknown.push(name)
      return decoded ?? original
    })
    return found('html-entities', 'HTML entities', decoded, 0.995, {
      decoded,
      metadata: { unknownEntities: unknown },
      warnings: unknown.length
        ? [warning('ENTITY-UNKNOWN', 'Unknown entities were kept unchanged.', 'info')]
        : [],
    })
  },
}
export const unicodeEscapes: Detector = {
  id: 'unicode-escapes',
  detect(input) {
    const text = inputText(input)
    if (!/\\(?:u[\da-f]{4}|u\{[\da-f]+}|x[\da-f]{2})|%u[\da-f]{4}/i.test(text)) return null
    const decoded = text.replace(
      /(?:\\u\{([\da-f]+)}|\\u([\da-f]{4})|\\x([\da-f]{2})|%u([\da-f]{4}))/gi,
      (all, ...groups: unknown[]) => {
        const part = groups.slice(0, 4).find((x) => typeof x === 'string') as string
        const n = parseInt(part, 16)
        return n <= 0x10ffff ? String.fromCodePoint(n) : all
      },
    )
    const unpaired = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(
      decoded,
    )
    return found('unicode-escapes', 'Unicode escapes', decoded, 0.995, {
      decoded,
      metadata: {
        codePoints: Array.from(decoded, (c) => `U+${c.codePointAt(0)?.toString(16).toUpperCase()}`),
      },
      warnings: unpaired
        ? [warning('UNICODE-SURROGATE', 'Unpaired surrogate in the decoded string.')]
        : [],
    })
  },
}
