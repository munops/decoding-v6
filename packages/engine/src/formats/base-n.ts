import type { Detector } from '../types'
import { inputText } from '../utils'
import { found, readable, warning, digest, hex } from './common'
export function decode32(text: string): Uint8Array {
  const value = text.toUpperCase(),
    raw = value.replace(/=+$/, '')
  if (
    !/^[A-Z2-7]+={0,6}$/.test(value) ||
    ![0, 2, 4, 5, 7].includes(raw.length % 8) ||
    (value.includes('=') &&
      (value.length % 8 !== 0 ||
        !({ 2: 6, 4: 4, 5: 3, 7: 1 } as Record<number, number>)[raw.length % 8]))
  )
    throw new Error('Invalid Base32 padding or alphabet')
  let bits = 0,
    accumulator = 0
  const bytes: number[] = []
  for (const c of raw) {
    accumulator = (accumulator << 5) | 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(c)
    bits += 5
    if (bits >= 8) {
      bits -= 8
      bytes.push((accumulator >>> bits) & 255)
    }
  }
  if (bits && accumulator & ((1 << bits) - 1)) throw new Error('Nonzero Base32 padding bits')
  return new Uint8Array(bytes)
}
export const base32: Detector = {
  id: 'base32',
  detect(input) {
    const text = inputText(input).trim()
    if (text.length < 8 || !/[A-Z2-7]/.test(text) || /[^A-Z2-7=]/.test(text)) return null
    try {
      const bytes = decode32(text)
      const output = readable(bytes)
      return found('base32', 'Base32', output, typeof output === 'string' ? 0.99 : 0.72, {
        decoded: output,
      })
    } catch {
      return /^[A-Z2-7]+=+$/.test(text)
        ? found('base32', 'Base32', { error: 'Invalid padding position' }, 0.7, {
            warnings: [warning('BASE32-PADDING', 'Invalid Base32 padding position.')],
          })
        : null
    }
  },
}
const alphabet58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
export function decode58(text: string): Uint8Array {
  let n = 0n
  for (const c of text) {
    const d = alphabet58.indexOf(c)
    if (d < 0) throw new Error('Not Base58')
    n = n * 58n + BigInt(d)
  }
  const out: number[] = []
  while (n) {
    out.push(Number(n & 255n))
    n >>= 8n
  }
  for (const c of text) {
    if (c !== '1') break
    out.push(0)
  }
  return new Uint8Array(out.reverse())
}
export const base58: Detector = {
  id: 'base58',
  async detect(input) {
    const text = inputText(input).trim()
    if (
      text.length < 12 ||
      text.length > 16384 ||
      !/^[1-9A-HJ-NP-Za-km-z]+$/.test(text) ||
      !/[0-9]/.test(text)
    )
      return null
    const bytes = decode58(text),
      output = readable(bytes)
    const checked = bytes.length === 25 && [0, 5, 111, 196].includes(bytes[0]!)
    if (checked) {
      const payload = bytes.slice(0, -4),
        checksum = (await digest(await digest(payload))).slice(0, 4)
      return found(
        'base58',
        'Base58Check candidate',
        {
          version: bytes[0],
          payload: hex(payload.slice(1)),
          checksum: hex(checksum) === hex(bytes.slice(-4)) ? 'valid' : 'mismatch',
        },
        0.7,
      )
    }
    return found('base58', 'Base58 (Bitcoin alphabet)', output, 0.7, { decoded: output })
  },
}
export function decode85(text: string): Uint8Array {
  const raw = text.replace(/^<~|~>$/g, '').replace(/\s/g, '')
  const out: number[] = []
  let group: number[] = []
  const flush = (final = false) => {
    const length = group.length
    if (!length) return
    if (length === 1) throw new Error('Truncated Ascii85')
    while (group.length < 5) group.push(84)
    let n = 0
    for (const d of group) n = n * 85 + d
    if (n > 0xffffffff) throw new Error('Ascii85 overflow')
    const bytes = [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255]
    out.push(...bytes.slice(0, final ? length - 1 : 4))
    group = []
  }
  for (const c of raw) {
    if (c === 'z') {
      if (group.length) throw new Error('Invalid z position')
      out.push(0, 0, 0, 0)
      continue
    }
    const d = c.charCodeAt(0) - 33
    if (d < 0 || d > 84) throw new Error('Not Ascii85')
    group.push(d)
    if (group.length === 5) flush()
  }
  flush(true)
  return new Uint8Array(out)
}
export const ascii85: Detector = {
  id: 'ascii85',
  detect(input) {
    const text = inputText(input).trim()
    if (!text.startsWith('<~') || !text.endsWith('~>')) return null
    try {
      const output = readable(decode85(text))
      return found('ascii85', 'Ascii85', output, 0.995, { decoded: output })
    } catch {
      return found('ascii85', 'Ascii85', { error: 'Invalid Ascii85 block' }, 0.7)
    }
  },
}
