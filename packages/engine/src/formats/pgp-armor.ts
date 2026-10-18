import type { Detector } from '../types'
import { decodeBase64, inputText } from '../utils'
import { found, digest, hex, warning } from './common'
export function crc24(bytes: Uint8Array): number {
  let crc = 0xb704ce
  for (const byte of bytes) {
    crc ^= byte << 16
    for (let i = 0; i < 8; i++) {
      crc <<= 1
      if (crc & 0x1000000) crc ^= 0x1864cfb
    }
  }
  return crc & 0xffffff
}
function firstPacket(bytes: Uint8Array): { tag: number; body: Uint8Array } | null {
  const header = bytes[0]
  if (header === undefined || !(header & 128)) return null
  let offset = 1,
    length = 0,
    tag = 0
  if (header & 64) {
    tag = header & 63
    const n = bytes[offset++]
    if (n === undefined) return null
    if (n < 192) length = n
    else if (n < 224) {
      const second = bytes[offset++]
      if (second === undefined) return null
      length = (n - 192) * 256 + second + 192
    } else if (n === 255) {
      if (offset + 4 > bytes.length) return null
      length = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0)
      offset += 4
    } else return null
  } else {
    tag = (header >> 2) & 15
    const count = 1 << (header & 3)
    if (count === 8) return null
    for (let i = 0; i < count; i++) {
      if (bytes[offset] === undefined) return null
      length = length * 256 + bytes[offset++]!
    }
  }
  if (offset + length > bytes.length) return null
  return { tag, body: bytes.slice(offset, offset + length) }
}
export const pgpArmor: Detector = {
  id: 'pgp-armor',
  async detect(input) {
    const match = /^-----BEGIN PGP ([A-Z ]+)-----\s*\n([\s\S]+?)\n-----END PGP \1-----$/.exec(
      inputText(input).trim(),
    )
    if (!match) return null
    const kind = match[1]!
    if (/PRIVATE|SECRET/.test(kind))
      return found(
        'pgp-armor',
        'PGP private key',
        { kind, note: 'Private key contents hidden; consider rotating this key.' },
        1,
        {
          warnings: [
            warning(
              'PRIVATE-KEY-EXPOSED',
              'A PGP private key was pasted. Contents hidden.',
              'danger',
            ),
          ],
        },
      )
    const lines = (match[2] ?? '').split(/\r?\n/),
      headers = lines.filter((line) => /^[\w-]+:/.test(line)),
      crcLine = lines.find((line) => /^=[A-Za-z0-9+/]{4}$/.test(line)),
      encoded = lines
        .filter((line) => line.trim() && !line.includes(':') && !line.startsWith('='))
        .join('')
    const bytes = decodeBase64(encoded)
    if (!bytes)
      return found('pgp-armor', 'PGP armor', { kind, error: 'Invalid armor Base64' }, 0.99)
    const crc = crcLine ? decodeBase64(crcLine.slice(1)) : null,
      checksum = crc ? crc24(bytes) === ((crc[0]! << 16) | (crc[1]! << 8) | crc[2]!) : null
    const packet = firstPacket(bytes)
    let key: Record<string, unknown> | undefined
    if (
      packet?.tag === 6 &&
      packet.body[0] === 4 &&
      packet.body.length >= 6 &&
      packet.body.length < 65536
    ) {
      const frame = new Uint8Array(packet.body.length + 3)
      frame.set([0x99, packet.body.length >> 8, packet.body.length & 255])
      frame.set(packet.body, 3)
      key = {
        version: 4,
        createdAt: new Date(
          new DataView(packet.body.buffer, packet.body.byteOffset + 1, 4).getUint32(0) * 1000,
        ).toISOString(),
        algorithm: packet.body[5],
        fingerprint: hex(await digest(frame, 'SHA-1')).toUpperCase(),
      }
    }
    return found(
      'pgp-armor',
      'PGP armor',
      {
        kind,
        headers,
        checksum: checksum === null ? 'absent' : checksum ? 'valid' : 'mismatch',
        key,
        ...(/MESSAGE/.test(kind)
          ? { note: 'Encrypted content cannot be read without the key.' }
          : {}),
      },
      0.999,
      {
        warnings:
          checksum === false
            ? [
                warning(
                  'PGP-CHECKSUM',
                  'This block was truncated or changed: CRC24 does not match.',
                  'danger',
                ),
              ]
            : [],
      },
    )
  },
}
