import type { Detector } from '../../types'
import { found } from '../common'
import { ipv4, ipv6 } from '../network'
function address(value: bigint, bits: number): string {
  if (bits === 32)
    return [24n, 16n, 8n, 0n].map((shift) => Number((value >> shift) & 255n)).join('.')
  return Array.from({ length: 8 }, (_, i) =>
    ((value >> BigInt((7 - i) * 16)) & 65535n).toString(16),
  ).join(':')
}
export const cidr: Detector = {
  id: 'cidr',
  detect(input) {
    if (typeof input !== 'string' || input.length > 128) return null
    const match = /^([^/\s]+)\/(0|[1-9]\d{0,2})$/.exec(input.trim())
    if (!match) return null
    const v4 = ipv4(match[1]!),
      v6 = v4 ? null : ipv6(match[1]!)
    if (!v4 && !v6) return null
    if (v4 && v4.join('.') !== match[1]) return null
    const bits = v4 ? 32 : 128,
      prefix = Number(match[2])
    if (prefix > bits) return null
    const integer = v4 ? BigInt(v4.reduce((n, part) => n * 256 + part, 0)) : BigInt(v6!.integer)
    const count = 1n << BigInt(bits - prefix),
      first = (integer / count) * count,
      last = first + count - 1n
    return found(
      'cidr',
      'CIDR address range',
      {
        family: v4 ? 'IPv4' : 'IPv6',
        prefix,
        network: address(first, bits) + '/' + prefix,
        first: address(first, bits),
        last: address(last, bits),
        addresses: count.toString(),
        hostBitsPresent: integer !== first,
      },
      0.999,
    )
  },
}
