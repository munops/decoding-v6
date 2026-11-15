import type { Detector } from '../../types'
import { decodeBase64 } from '../../utils'
import { der, type Der } from '../der'
import { found, warning } from '../common'
// Structural DER subset: definite/minimal lengths, low-number tags, common primitive constraints.
function canonical(bytes: Uint8Array, depth = 0, budget = { nodes: 0 }): void {
  if (++budget.nodes > 2048 || depth > 12 || bytes.length < 2) throw new Error('DER bounds')
  const tag = bytes[0]!,
    lengthByte = bytes[1]!
  if ((tag & 31) === 31 || tag === 0) throw new Error('Unsupported tag')
  let header = 2,
    length = lengthByte
  if (lengthByte & 128) {
    const count = lengthByte & 127
    if (!count || count > 4 || bytes.length < 2 + count || bytes[2] === 0)
      throw new Error('DER length')
    length = 0
    for (let i = 0; i < count; i++) length = length * 256 + bytes[2 + i]!
    if (length < 128) throw new Error('Nonminimal length')
    header += count
  }
  if (header + length !== bytes.length) throw new Error('DER length')
  const body = bytes.subarray(header),
    universal = (tag & 192) === 0,
    number = tag & 31,
    constructed = !!(tag & 32)
  if (universal) {
    if ((number === 16 || number === 17) !== constructed) throw new Error('DER form')
    if (number === 1 && (body.length !== 1 || (body[0] !== 0 && body[0] !== 255)))
      throw new Error('DER boolean')
    if (
      (number === 2 || number === 10) &&
      (!body.length ||
        (body.length > 1 &&
          ((body[0] === 0 && !(body[1]! & 128)) || (body[0] === 255 && !!(body[1]! & 128)))))
    )
      throw new Error('DER integer')
    if (number === 5 && body.length) throw new Error('DER null')
    if (
      number === 3 &&
      (!body.length ||
        body[0]! > 7 ||
        (body.length === 1 && body[0] !== 0) ||
        (body.length > 1 && (body[body.length - 1]! & ((1 << body[0]!) - 1)) !== 0))
    )
      throw new Error('DER bitstring')
    if (number === 6) {
      if (!body.length || body[body.length - 1]! & 128) throw new Error('DER OID')
      let start = true
      for (const byte of body) {
        if (start && byte === 128) throw new Error('DER OID')
        start = !(byte & 128)
      }
    }
    if (number === 12) new TextDecoder('utf-8', { fatal: true }).decode(body)
  }
  if (constructed) {
    let offset = 0
    while (offset < body.length) {
      if (offset + 2 > body.length) throw new Error('DER child')
      let childHeader = 2,
        childLength = body[offset + 1]!
      if (childLength & 128) {
        const count = childLength & 127
        if (!count || count > 4 || offset + 2 + count > body.length) throw new Error('DER child')
        childLength = 0
        for (let i = 0; i < count; i++) childLength = childLength * 256 + body[offset + 2 + i]!
        childHeader += count
      }
      const end = offset + childHeader + childLength
      if (end > body.length) throw new Error('DER child')
      canonical(body.subarray(offset, end), depth + 1, budget)
      offset = end
    }
  }
}
function shape(node: Der): { tag: string; bytes: number; children?: ReturnType<typeof shape>[] } {
  return {
    tag: '0x' + node.tag.toString(16),
    bytes: node.body.length,
    ...(node.children.length ? { children: node.children.map(shape) } : {}),
  }
}
export const asn1Der: Detector = {
  id: 'asn1-der',
  detect(source) {
    const input =
      typeof source === 'string'
        ? /^M[A-P][A-Za-z0-9+/]/.test(source.trim()) && source.length <= 1_400_000
          ? decodeBase64(source.trim())
          : null
        : source
    if (!input || input.length < 4 || input.length > 1_048_576 || input[0] !== 0x30) return null
    try {
      canonical(input)
      const root = der(input)
      if (!root.children.length) return null
      return found(
        'asn1-der',
        'ASN.1 DER structure',
        { bytes: input.length, structure: shape(root) },
        0.97,
        { warnings: [warning('DER-SCHEMA-UNKNOWN', { code: 'warning-der-schema' }, 'info')] },
      )
    } catch {
      return null
    }
  },
}
