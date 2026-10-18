import type { Detector } from '../types'
import { decodeBase64, inputText } from '../utils'
import { found, hex, warning } from './common'
type Der = { tag: number; body: Uint8Array; children: Der[] }
function der(bytes: Uint8Array, depth = 0): Der {
  if (depth > 12 || bytes.length < 2) throw new Error('Invalid DER')
  let start = 2,
    length = bytes[1]!
  if (length & 128) {
    const count = length & 127
    if (!count || count > 4 || bytes.length < 2 + count) throw new Error('Invalid DER length')
    length = 0
    for (let i = 0; i < count; i++) length = length * 256 + bytes[2 + i]!
    start += count
  }
  if (start + length !== bytes.length) throw new Error('Truncated DER')
  const body = bytes.slice(start),
    children: Der[] = []
  if (bytes[0]! & 32) {
    let offset = 0
    while (offset < body.length) {
      let header = 2,
        n = body[offset + 1]
      if (n === undefined) throw new Error('Truncated DER')
      if (n & 128) {
        const count = n & 127
        if (!count || count > 4) throw new Error('Invalid DER')
        n = 0
        for (let i = 0; i < count; i++) n = n * 256 + (body[offset + 2 + i] ?? NaN)
        header += count
      }
      if (!Number.isFinite(n) || header + n > body.length - offset) throw new Error('Truncated DER')
      children.push(der(body.slice(offset, offset + header + n), depth + 1))
      offset += header + n
      if (children.length > 128) throw new Error('DER node limit')
    }
  }
  return { tag: bytes[0]!, body, children }
}
export const pem: Detector = {
  id: 'pem',
  detect(input) {
    const text = inputText(input).trim(),
      match = /^-----BEGIN ([A-Z0-9 ]+)-----\s*([\s\S]+?)\s*-----END \1-----$/.exec(text)
    if (!match) return null
    if (match[1]?.startsWith('PGP ')) return null
    const kind = match[1]!,
      privateKey = /PRIVATE KEY/.test(kind)
    if (privateKey)
      return found(
        'pem',
        'PEM private key',
        {
          kind,
          algorithm: /RSA/.test(kind)
            ? 'RSA'
            : /EC/.test(kind)
              ? 'EC'
              : /ENCRYPTED/.test(kind)
                ? 'encrypted private key; not interpreted'
                : 'private key',
          note: 'Private key contents are hidden. Consider rotating this key.',
        },
        1,
        {
          warnings: [
            warning(
              'PRIVATE-KEY-EXPOSED',
              'You pasted a private key. Contents are never displayed. Consider replacing it.',
              'danger',
            ),
          ],
        },
      )
    const bytes = decodeBase64(match[2] ?? '')
    if (!bytes) return found('pem', 'PEM block', { kind, error: 'Invalid Base64' }, 0.99)
    try {
      const root = der(bytes)
      if (root.tag !== 0x30) throw new Error('Expected DER sequence')
      const encoded = hex(bytes),
        algorithm = encoded.includes('06092a864886f70d010101')
          ? 'RSA'
          : encoded.includes('06072a8648ce3d0201')
            ? 'EC'
            : encoded.includes('06032b6570')
              ? 'Ed25519'
              : 'unknown'
      let modulus = root.children.find((n) => n.tag === 2 && n.body.length > 32)
      for (const bit of root.children.filter((n) => n.tag === 3 && n.body[0] === 0)) {
        try {
          modulus =
            der(bit.body.slice(1)).children.find((n) => n.tag === 2 && n.body.length > 32) ??
            modulus
        } catch {
          /* other key encoding */
        }
      }
      const keyBits = modulus
        ? (modulus.body[0] === 0 ? modulus.body.length - 1 : modulus.body.length) * 8
        : algorithm === 'Ed25519'
          ? 256
          : undefined
      return found(
        'pem',
        kind === 'CERTIFICATE' ? 'PEM X.509 certificate' : 'PEM public key / CSR',
        { kind, algorithm, keyBits, derBytes: bytes.length },
        0.999,
        { metadata: { detail: kind === 'CERTIFICATE' ? 'x509' : undefined } },
      )
    } catch {
      return found(
        'pem',
        'PEM block',
        { kind, error: 'Certificate/key DER parsing failed' },
        0.99,
        {
          warnings: [
            warning('PEM-DER-INVALID', 'PEM armor is present but the DER content is invalid.'),
          ],
        },
      )
    }
  },
}
