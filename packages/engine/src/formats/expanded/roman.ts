import type { Detector } from '../../types'
import { found } from '../common'
export const roman: Detector = {
  id: 'roman',
  detect(input) {
    if (typeof input !== 'string' || input.length > 64) return null
    const explicit = /^Roman\s*:/i.test(input.trim()),
      text = input
        .trim()
        .replace(/^Roman\s*:\s*/i, '')
        .normalize('NFKC')
        .toUpperCase()
    if (!text || !/^M{0,3}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3})$/.test(text))
      return null
    const digits: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
    let number = 0
    for (let i = 0; i < text.length; i++) {
      const value = digits[text[i]!]!
      number += value < (digits[text[i + 1]!] ?? 0) ? -value : value
    }
    return found(
      'roman',
      'Roman numeral candidate',
      { roman: text, decimal: number, explicit },
      explicit ? 0.999 : 0.65,
    )
  },
}
