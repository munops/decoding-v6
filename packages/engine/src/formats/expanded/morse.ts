import type { Detector } from '../../types'
import { found } from '../common'
const entries: [string, string][] = [
  ['.-', 'A'],
  ['-...', 'B'],
  ['-.-.', 'C'],
  ['-..', 'D'],
  ['.', 'E'],
  ['..-.', 'F'],
  ['--.', 'G'],
  ['....', 'H'],
  ['..', 'I'],
  ['.---', 'J'],
  ['-.-', 'K'],
  ['.-..', 'L'],
  ['--', 'M'],
  ['-.', 'N'],
  ['---', 'O'],
  ['.--.', 'P'],
  ['--.-', 'Q'],
  ['.-.', 'R'],
  ['...', 'S'],
  ['-', 'T'],
  ['..-', 'U'],
  ['...-', 'V'],
  ['.--', 'W'],
  ['-..-', 'X'],
  ['-.--', 'Y'],
  ['--..', 'Z'],
  ['-----', '0'],
  ['.----', '1'],
  ['..---', '2'],
  ['...--', '3'],
  ['....-', '4'],
  ['.....', '5'],
  ['-....', '6'],
  ['--...', '7'],
  ['---..', '8'],
  ['----.', '9'],
  ['..-..', '\u00c9'],
  ['.-.-.-', '.'],
  ['--..--', ','],
  ['---...', ':'],
  ['..--..', '?'],
  ['.----.', "'"],
  ['-....-', '-'],
  ['-..-.', '/'],
  ['-.--.', '('],
  ['-.--.-', ')'],
  ['.-..-.', '"'],
  ['-...-', '='],
  ['.-.-.', '+'],
  ['.--.-.', '@'],
  ['...---...', 'SOS'],
]
const alphabet = new Map(entries)
export const morse: Detector = {
  id: 'morse',
  detect(input) {
    if (typeof input !== 'string' || input.length > 65536) return null
    const explicit = /^Morse\s*:/i.test(input.trim()),
      source = input
        .trim()
        .replace(/^Morse\s*:\s*/i, '')
        .replace(/[\u00b7\u2022]/g, '.')
        .replace(/[\u2212\u2013\u2014]/g, '-')
        .trim()
    if (!source || !/^[.\-\s/]+$/.test(source)) return null
    const words = source.split(/\s*\/\s*|\s{3,}|[\r\n]+/)
    if (words.some((word) => !word.trim())) return null
    let count = 0
    const decoded: string[] = []
    for (const word of words) {
      let text = ''
      for (const symbol of word.trim().split(/\s+/)) {
        const letter = alphabet.get(symbol)
        if (!letter || ++count > 8192) return null
        text += letter
      }
      decoded.push(text)
    }
    if (!explicit && count < 2 && source !== '...---...') return null
    const value = decoded.join(' ')
    return found('morse', 'International Morse code', value, explicit ? 0.999 : 0.92, {
      decoded: value,
    })
  },
}
