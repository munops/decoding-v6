import type { Detector } from '../../types'
import { identifyMagic } from '../magic-bytes'
import { found, readable, warning } from '../common'
const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'
export function decode45(text: string): Uint8Array {
  if (
    !text.length ||
    text.length > 1_048_576 ||
    text.length % 3 === 1 ||
    !/^[0-9A-Z $%*+\-./:]+$/.test(text)
  )
    throw new Error('invalid-base45')
  const output = new Uint8Array(Math.floor(text.length / 3) * 2 + (text.length % 3 === 2 ? 1 : 0))
  let offset = 0
  for (let index = 0; index < text.length; index += 3) {
    const full = index + 2 < text.length
    const value =
      alphabet.indexOf(text[index]!) +
      45 * alphabet.indexOf(text[index + 1]!) +
      (full ? 2025 * alphabet.indexOf(text[index + 2]!) : 0)
    if (value > (full ? 65535 : 255)) throw new Error('base45-group-overflow')
    if (full) output[offset++] = value >>> 8
    output[offset++] = value & 255
  }
  return output
}
export const base45: Detector = {
  id: 'base45',
  detect(input) {
    if (typeof input !== 'string' || input.length > 1_048_576) return null
    const text = input.replace(/\r?\n$/, '')
    const hcert = text.startsWith('HC1:'),
      payload = hcert ? text.slice(4) : text
    // Unqualified words/numbers cannot establish an encoding. Manual mode still decodes them.
    if (!hcert && (!/[A-Z $%*+\-./:]/.test(payload) || !/[0-9$%*+\-./:]/.test(payload))) return null
    try {
      const bytes = decode45(payload),
        decoded = readable(bytes)
      const compressed =
        (bytes[0] === 0x78 && bytes.length > 2 && ((bytes[0] << 8) | bytes[1]!) % 31 === 0) ||
        (bytes[0] === 0x1f && bytes[1] === 0x8b)
      if (!hcert && typeof decoded !== 'string' && !identifyMagic(bytes) && !compressed) return null
      return found('base45', 'Base45', decoded, hcert ? 0.999 : 0.99, {
        decoded,
        metadata: { hcert, byteCount: bytes.length },
        warnings: hcert
          ? [warning('HCERT-UNVERIFIED', { code: 'warning-hcert-unverified' }, 'info')]
          : [],
      })
    } catch {
      return null
    }
  },
}
