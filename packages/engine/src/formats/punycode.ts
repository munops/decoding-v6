import type { Detector } from '../types'
import { inputText } from '../utils'
import { found, warning } from './common'
function unpunycode(label: string): string {
  const data = label.slice(4)
  let n = 128,
    i = 0,
    bias = 72,
    index = 0
  const output: number[] = []
  const delimiter = data.lastIndexOf('-')
  if (delimiter >= 0) {
    for (const c of data.slice(0, delimiter)) output.push(c.charCodeAt(0))
    index = delimiter + 1
  }
  const adapt = (delta: number, points: number, first: boolean) => {
    delta = first ? Math.floor(delta / 700) : delta >> 1
    delta += Math.floor(delta / points)
    let k = 0
    while (delta > 455) {
      delta = Math.floor(delta / 35)
      k += 36
    }
    return k + Math.floor((36 * delta) / (delta + 38))
  }
  while (index < data.length) {
    const old = i
    let weight = 1
    for (let k = 36; ; k += 36) {
      const c = data[index++]?.toLowerCase()
      if (!c) throw new Error('Truncated Punycode')
      const cp = c.charCodeAt(0),
        d = cp >= 97 && cp <= 122 ? cp - 97 : cp >= 48 && cp <= 57 ? cp - 22 : 36
      if (d >= 36) throw new Error('Invalid Punycode')
      i += d * weight
      if (!Number.isSafeInteger(i)) throw new Error('Punycode overflow')
      const threshold = k <= bias ? 1 : k >= bias + 26 ? 26 : k - bias
      if (d < threshold) break
      weight *= 36 - threshold
    }
    const count = output.length + 1
    bias = adapt(i - old, count, old === 0)
    n += Math.floor(i / count)
    i %= count
    if (n > 0x10ffff || (n >= 0xd800 && n <= 0xdfff)) throw new Error('Invalid code point')
    output.splice(i, 0, n)
    i++
  }
  return String.fromCodePoint(...output)
}
export const punycode: Detector = {
  id: 'punycode',
  detect(input) {
    const text = inputText(input).trim()
    if (!/(?:^|\.)xn--/i.test(text) || /[\s/]/.test(text)) return null
    try {
      const domain = text
        .split('.')
        .map((label) => (/^xn--/i.test(label) ? unpunycode(label) : label))
        .join('.')
      const nonLatin = /[\p{Script=Cyrillic}\p{Script=Greek}]/u.test(domain),
        mixed = nonLatin && /[a-z]/i.test(domain)
      return found(
        'punycode',
        'Punycode / IDN',
        { unicode: domain, ascii: text, mixedScripts: mixed },
        0.999,
        {
          warnings: nonLatin
            ? [
                warning(
                  'IDN-CONFUSABLE',
                  'This domain uses Greek/Cyrillic characters that can resemble Latin letters. Inspect every label.',
                ),
              ]
            : [],
        },
      )
    } catch {
      return found('punycode', 'Punycode / IDN', { error: 'Undecodable Punycode label' }, 0.99)
    }
  },
}
