import type { Detector } from '../types'
import { inputText } from '../utils'
import { found, hex } from './common'
export function protobufFields(
  bytes: Uint8Array,
  depth = 0,
): Array<{ field: number; wire: number; value: unknown }> {
  if (depth > 8 || !bytes.length) throw new Error('Not a complete message')
  let offset = 0
  const out: Array<{ field: number; wire: number; value: unknown }> = []
  const varint = () => {
    let n = 0n
    for (let shift = 0; shift < 70; shift += 7) {
      const b = bytes[offset++]
      if (b === undefined) throw new Error('Truncated varint')
      if (shift === 63 && b > 1) throw new Error('Varint overflow')
      n |= BigInt(b & 127) << BigInt(shift)
      if (!(b & 128)) return n
    }
    throw new Error('Varint overflow')
  }
  while (offset < bytes.length) {
    if (out.length >= 64) throw new Error('Field limit')
    const tag = varint(),
      field = Number(tag >> 3n),
      wire = Number(tag & 7n)
    if (field < 1 || field > 0x1fffffff || ![0, 1, 2, 5].includes(wire))
      throw new Error('Invalid field tag')
    let value: unknown
    if (wire === 0) value = varint().toString()
    else {
      const count = wire === 1 ? 8 : wire === 5 ? 4 : Number(varint())
      if (!Number.isSafeInteger(count) || count < 0 || count > bytes.length - offset)
        throw new Error('Truncated field')
      const chunk = bytes.slice(offset, offset + count)
      offset += count
      if (wire === 2) {
        try {
          value = { nested: protobufFields(chunk, depth + 1) }
        } catch {
          const text = inputText(chunk)
          value = chunk.every((byte) => [9, 10, 13].includes(byte) || (byte >= 32 && byte <= 126))
            ? { text }
            : { hex: hex(chunk) }
        }
      } else
        value = {
          hex: hex(chunk),
          littleEndian:
            wire === 5
              ? new DataView(chunk.buffer, chunk.byteOffset, 4).getUint32(0, true).toString()
              : new DataView(chunk.buffer, chunk.byteOffset, 8).getBigUint64(0, true).toString(),
        }
    }
    out.push({ field, wire, value })
  }
  return out
}
export const protobuf: Detector = {
  id: 'protobuf',
  detect(input) {
    if (typeof input === 'string') return null
    try {
      return found(
        'protobuf',
        'Protobuf wire candidate',
        {
          fields: protobufFields(input),
          note: 'No schema. Field names and semantic types are unknown.',
        },
        0.68,
      )
    } catch {
      return null
    }
  },
}
