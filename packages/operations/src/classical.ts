import { repairGarbled } from '@decoding/engine'
import { optionString, text, textResult, structuredResult } from './shared'
import type { OperationRunner } from './types'
function rotate(source: string, shift: number) {
  return source.replace(/[A-Za-z]/g, (letter) => {
    const base = letter <= 'Z' ? 65 : 97
    return String.fromCharCode(base + ((letter.charCodeAt(0) - base + shift + 26) % 26))
  })
}
export const runClassical: OperationRunner = async (id, input, options) => {
  const source = text(input)
  if (id === 'mojibake-repair') {
    const charset = optionString(options, 'charset', 'auto')
    const repaired = repairGarbled(source, charset === 'auto' ? undefined : charset)
    if (!repaired) throw new Error('MOJIBAKE-NO-REVERSIBLE-PATH')
    return {
      ...textResult(repaired.value),
      metadata: {
        charset: repaired.charset,
        misreadAs: repaired.misreadAs,
        alternatives: repaired.alternatives,
      },
    }
  }
  const mode = optionString(options, 'mode', 'caesar')
  if (mode === 'caesar')
    return structuredResult(
      Array.from({ length: 25 }, (_, i) => ({ shift: i + 1, text: rotate(source, -(i + 1)) })),
    )
  if (mode === 'atbash')
    return textResult(
      source.replace(/[A-Za-z]/g, (letter) =>
        String.fromCharCode((letter <= 'Z' ? 155 : 219) - letter.charCodeAt(0)),
      ),
    )
  if (mode === 'a1z26') {
    if (!/^\s*(?:[1-9]|1\d|2[0-6])(?:[\s,.-]+(?:[1-9]|1\d|2[0-6]))*\s*$/.test(source))
      throw new Error('CIPHER-A1Z26-RANGE')
    return textResult(
      source
        .trim()
        .split(/[\s,.-]+/)
        .map((n) => String.fromCharCode(64 + Number(n)))
        .join(''),
    )
  }
  if (mode === 'vigenere') {
    const key = optionString(options, 'key', '').toUpperCase()
    if (!/^[A-Z]+$/.test(key)) throw new Error('CIPHER-KEY-REQUIRED')
    let at = 0
    const sign = optionString(options, 'direction', 'decode') === 'encode' ? 1 : -1
    return textResult(
      source.replace(/[A-Za-z]/g, (letter) =>
        rotate(letter, sign * (key.charCodeAt(at++ % key.length) - 65)),
      ),
    )
  }
  throw new Error('CIPHER-UNKNOWN-MODE')
}
