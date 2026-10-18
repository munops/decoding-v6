import type { Detector } from '../types'
import { inputText } from '../utils'
import { found } from './common'
export function ipv4(text: string): number[] | null {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(text)) return null
  const p = text.split('.').map(Number)
  return p.every((n) => n <= 255) ? p : null
}
export const network: Detector = {
  id: 'ip',
  detect(input) {
    const text = inputText(input).trim()
    let parts = ipv4(text)
    const integer = /^\d{1,10}$/.test(text)
      ? Number(text)
      : /^0x[\da-f]{1,8}$/i.test(text)
        ? parseInt(text.slice(2), 16)
        : null
    if (!parts && integer !== null && integer >= 0 && integer <= 0xffffffff)
      parts = [integer >>> 24, (integer >>> 16) & 255, (integer >>> 8) & 255, integer & 255]
    if (parts) {
      const [a, b] = parts
      const type =
        a === 127
          ? 'loopback'
          : a === 169 && b === 254
            ? 'link-local'
            : a === 10 ||
                (a === 172 && b !== undefined && b >= 16 && b <= 31) ||
                (a === 192 && b === 168)
              ? 'private'
              : a === 0
                ? 'unspecified'
                : a !== undefined && a >= 224
                  ? 'multicast/reserved'
                  : 'public'
      const n = parts.reduce((n, x) => n * 256 + x, 0)
      return found(
        'ip',
        'IPv4',
        {
          address: parts.join('.'),
          scope: type,
          integer: n,
          hex: `0x${n.toString(16).padStart(8, '0')}`,
        },
        integer === null ? 0.999 : 0.65,
      )
    }
    if (!text.includes(':') || !/^[\da-f:.]+$/i.test(text)) return null
    try {
      const host = new URL(`http://[${text}]/`).hostname.slice(1, -1)
      const kind =
        host === '::1'
          ? 'loopback'
          : host === '::'
            ? 'unspecified'
            : /^(fc|fd)/i.test(host)
              ? 'private'
              : /^fe[89ab]/i.test(host)
                ? 'link-local'
                : /^ff/i.test(host)
                  ? 'multicast'
                  : 'public'
      const halves = host.split('::'),
        left = halves[0]?.split(':').filter(Boolean) ?? [],
        right = halves[1]?.split(':').filter(Boolean) ?? []
      const words =
        halves.length === 2
          ? [...left, ...Array(8 - left.length - right.length).fill('0'), ...right]
          : left
      const expanded = words.map((x) => x.padStart(4, '0')).join(':')
      return found('ip', 'IPv6', {
        address: host,
        expanded,
        scope: kind,
        integer: BigInt(`0x${expanded.replaceAll(':', '')}`).toString(),
      })
    } catch {
      return null
    }
  },
}
