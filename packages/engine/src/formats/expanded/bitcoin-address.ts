import type { Detector } from '../../types'
import { found, warning } from '../common'
import { decode58, inspectBase58Address, base58AddressVersions } from '../base-n'
// BIP173/BIP350: checksum variant is bound to the witness version, not just the alphabet.
const alphabet = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
function polymod(values: number[]) {
  let result = 1
  for (const value of values) {
    const top = result >>> 25
    result = ((result & 0x1ffffff) << 5) ^ value
    for (let bit = 0; bit < 5; bit++)
      if ((top >>> bit) & 1)
        result ^= [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3][bit]!
  }
  return result
}
export function witnessAddress(text: string) {
  if (text !== text.toLowerCase() && text !== text.toUpperCase()) return null
  const lower = text.toLowerCase(),
    separator = lower.lastIndexOf('1'),
    hrp = lower.slice(0, separator)
  if (!['bc', 'tb', 'bcrt'].includes(hrp) || lower.length > 90) return null
  const data = [...lower.slice(separator + 1)].map((char) => alphabet.indexOf(char))
  if (data.length < 7 || data.some((value) => value < 0)) return null
  const expanded = [
    ...[...hrp].map((char) => char.charCodeAt(0) >>> 5),
    0,
    ...[...hrp].map((char) => char.charCodeAt(0) & 31),
  ]
  const version = data[0]!,
    checksum = polymod([...expanded, ...data])
  if (version > 16 || checksum !== (version === 0 ? 1 : 0x2bc830a3)) return null
  let accumulator = 0,
    bits = 0
  const program: number[] = []
  for (const value of data.slice(1, -6)) {
    accumulator = (accumulator << 5) | value
    bits += 5
    while (bits >= 8) {
      bits -= 8
      program.push((accumulator >>> bits) & 255)
    }
    accumulator &= (1 << bits) - 1
  }
  if (
    bits >= 5 ||
    accumulator !== 0 ||
    program.length < 2 ||
    program.length > 40 ||
    (version === 0 && ![20, 32].includes(program.length))
  )
    return null
  return {
    address: lower,
    network: hrp === 'bc' ? 'mainnet' : hrp === 'tb' ? 'testnet' : 'regtest',
    encoding: version === 0 ? 'Bech32' : 'Bech32m',
    witnessVersion: version,
    programBytes: program.length,
    checksum: 'valid',
  }
}
export const bitcoinAddress: Detector = {
  id: 'bitcoin-address',
  async detect(input) {
    if (typeof input !== 'string' || input.length > 100) return null
    const text = input.trim()
    let value: Record<string, unknown> | null = null
    if (/^(?:bc|tb|bcrt)1/i.test(text)) value = witnessAddress(text)
    else if (/^[123mn][1-9A-HJ-NP-Za-km-z]{25,34}$/.test(text)) {
      const checked = await inspectBase58Address(decode58(text))
      if (checked?.checksum === 'valid')
        value = {
          address: text,
          ...base58AddressVersions[checked.version],
          encoding: 'Base58Check',
          checksum: 'valid',
        }
    }
    return value
      ? found('bitcoin-address', 'Bitcoin address format', value, 0.999, {
          warnings: [warning('WALLET-UNVERIFIED', { code: 'warning-wallet-unverified' }, 'info')],
        })
      : null
  },
}
