import type { Detector } from '../../types'
import { found } from '../common'
export const mac: Detector = {
  id: 'mac',
  detect(input) {
    if (typeof input !== 'string' || input.length > 64) return null
    const text = input.trim()
    if (
      !/^(?:[\da-f]{2}(:)[\da-f]{2}(?:\1[\da-f]{2}){4}|[\da-f]{2}(-)[\da-f]{2}(?:\2[\da-f]{2}){4}|[\da-f]{4}(?:\.[\da-f]{4}){2})$/i.test(
        text,
      )
    )
      return null
    const bytes = text
        .replace(/[:.-]/g, '')
        .match(/../g)!
        .map((part) => parseInt(part, 16)),
      first = bytes[0]!
    return found(
      'mac',
      '48-bit MAC address',
      {
        address: bytes.map((byte) => byte.toString(16).padStart(2, '0')).join(':'),
        bits: 48,
        group: !!(first & 1),
        local: !!(first & 2),
        broadcast: bytes.every((byte) => byte === 255),
      },
      0.995,
    )
  },
}
