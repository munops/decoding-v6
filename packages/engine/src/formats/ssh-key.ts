import type { Detector } from '../types'
import { decodeBase64, encodeBase64, inputText } from '../utils'
import { found, digest, warning } from './common'
export const sshKey: Detector = {
  id: 'ssh-key',
  async detect(input) {
    const match =
      /^(ssh-(?:rsa|ed25519)|ecdsa-sha2-nistp(?:256|384|521))\s+([A-Za-z0-9+/=]+)(?:\s+(.*))?$/.exec(
        inputText(input).trim(),
      )
    if (!match) return null
    const bytes = decodeBase64(match[2] ?? '')
    if (!bytes) return null
    try {
      let offset = 0
      const take = () => {
        if (offset + 4 > bytes.length) throw new Error('Truncated key')
        const n = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0)
        offset += 4
        if (n > bytes.length - offset) throw new Error('Truncated key')
        const piece = bytes.slice(offset, offset + n)
        offset += n
        return piece
      }
      const kind = inputText(take())
      if (kind !== match[1]) throw new Error('Key type mismatch')
      let bits: number
      if (kind === 'ssh-rsa') {
        take()
        const modulus = take()
        bits = (modulus.length - (modulus[0] === 0 ? 1 : 0)) * 8
      } else if (kind === 'ssh-ed25519') {
        if (take().length !== 32) throw new Error('Truncated Ed25519 key')
        bits = 256
      } else {
        const curve = inputText(take())
        const point = take()
        bits = Number(curve.slice(5))
        if (point.length !== 1 + 2 * Math.ceil(bits / 8)) throw new Error('Truncated curve point')
      }
      if (offset !== bytes.length) throw new Error('Trailing key bytes')
      return found(
        'ssh-key',
        'OpenSSH public key',
        {
          kind,
          bits,
          comment: match[3] ?? '',
          fingerprint: `SHA256:${encodeBase64(await digest(bytes)).replace(/=+$/, '')}`,
        },
        0.999,
      )
    } catch {
      return found(
        'ssh-key',
        'OpenSSH public key',
        { error: 'Truncated or malformed public key' },
        0.99,
        {
          warnings: [
            warning('SSH-TRUNCATED', 'This public key is truncated or has an invalid structure.'),
          ],
        },
      )
    }
  },
}
