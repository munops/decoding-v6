import type { Detector } from '../../types'
import { decodeBase64 } from '../../utils'
import { found, warning } from '../common'
// DataInput modified UTF-8, decoded as UTF-16 code units; never constructs Java objects.
export function modifiedUtf8(bytes: Uint8Array): string {
  let result = ''
  for (let i = 0; i < bytes.length; i++) {
    const first = bytes[i]!
    let unit: number
    if (first > 0 && first < 128) unit = first
    else if ((first & 224) === 192) {
      const second = bytes[++i]
      if (second === undefined || (second & 192) !== 128) throw new Error('MUTF8')
      unit = ((first & 31) << 6) | (second & 63)
      if (unit < 128 && !(first === 192 && second === 128)) throw new Error('MUTF8')
    } else if ((first & 240) === 224) {
      const second = bytes[++i],
        third = bytes[++i]
      if (
        second === undefined ||
        third === undefined ||
        (second & 192) !== 128 ||
        (third & 192) !== 128
      )
        throw new Error('MUTF8')
      unit = ((first & 15) << 12) | ((second & 63) << 6) | (third & 63)
      if (unit < 2048) throw new Error('MUTF8')
    } else throw new Error('MUTF8')
    result += String.fromCharCode(unit)
  }
  return result
}
export const javaSerialization: Detector = {
  id: 'java-serialization',
  detect(input) {
    const bytes =
      typeof input === 'string'
        ? /^rO0AB/.test(input.trim()) && input.length <= 1_400_000
          ? decodeBase64(input.trim())
          : null
        : input
    if (
      !bytes ||
      bytes.length < 5 ||
      bytes.length > 1_048_576 ||
      bytes[0] !== 172 ||
      bytes[1] !== 237 ||
      bytes[2] !== 0 ||
      bytes[3] !== 5
    )
      return null
    const token = bytes[4]!
    if (token < 0x70 || token > 0x7e || token === 0x78) return null
    let decoded: string | undefined
    if (token === 0x74 || token === 0x7c) {
      const header = token === 0x74 ? 7 : 13
      if (bytes.length < header) return null
      let length = 0n
      for (const byte of bytes.slice(5, header)) length = length * 256n + BigInt(byte)
      if (length > 1_048_576n || length > BigInt(bytes.length - header)) return null
      try {
        const text = modifiedUtf8(bytes.slice(header, header + Number(length)))
        if (header + Number(length) === bytes.length) decoded = text
      } catch {
        return null
      }
    } else if (token !== 0x70 && token !== 0x79 && bytes.length < 6) return null
    return found(
      'java-serialization',
      'Java serialization stream',
      {
        magic: 'ACED',
        version: 5,
        bytes: bytes.length,
        firstToken: '0x' + token.toString(16),
        ...(decoded === undefined ? {} : { text: decoded }),
      },
      0.995,
      {
        ...(decoded === undefined ? {} : { decoded }),
        warnings: [warning('JAVA-STREAM-INSPECTION', { code: 'warning-java-inspection' }, 'info')],
      },
    )
  },
}
