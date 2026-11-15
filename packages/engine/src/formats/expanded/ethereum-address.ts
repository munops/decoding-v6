import type { Detector } from '../../types'
import { found, warning } from '../common'
// ERC-55 hashes exactly 40 lowercase ASCII hex digits with original Keccak-256,
// whose suffix is 0x01. NIST SHA3-256 uses 0x06 and is not interchangeable.
const mask = (1n << 64n) - 1n
const rotations = [
  0, 1, 62, 28, 27, 36, 44, 6, 55, 20, 3, 10, 43, 25, 39, 41, 45, 15, 21, 8, 18, 2, 61, 56, 14,
]
const rounds = [
  0x1n,
  0x8082n,
  0x800000000000808an,
  0x8000000080008000n,
  0x808bn,
  0x80000001n,
  0x8000000080008081n,
  0x8000000000008009n,
  0x8an,
  0x88n,
  0x80008009n,
  0x8000000an,
  0x8000808bn,
  0x800000000000008bn,
  0x8000000000008089n,
  0x8000000000008003n,
  0x8000000000008002n,
  0x8000000000000080n,
  0x800an,
  0x800000008000000an,
  0x8000000080008081n,
  0x8000000000008080n,
  0x80000001n,
  0x8000000080008008n,
]
const rotate = (value: bigint, bits: number) =>
  ((value << BigInt(bits)) | (value >> BigInt(64 - bits))) & mask
export function addressKeccak(hex: string): string {
  if (!/^[0-9a-f]{40}$/.test(hex)) throw new Error('invalid-address-hex')
  const block = new Uint8Array(136)
  block.set(new TextEncoder().encode(hex))
  block[40] = 1
  block[135] = 128
  const state: bigint[] = Array(25).fill(0n)
  for (let index = 0; index < block.length; index++)
    state[index >>> 3]! |= BigInt(block[index]!) << BigInt((index & 7) * 8)
  for (const constant of rounds) {
    const columns = Array.from(
      { length: 5 },
      (_, x) => state[x]! ^ state[x + 5]! ^ state[x + 10]! ^ state[x + 15]! ^ state[x + 20]!,
    )
    for (let x = 0; x < 5; x++) {
      const delta = columns[(x + 4) % 5]! ^ rotate(columns[(x + 1) % 5]!, 1)
      for (let y = 0; y < 5; y++) state[x + 5 * y]! ^= delta
    }
    const shuffled: bigint[] = Array(25).fill(0n)
    for (let x = 0; x < 5; x++)
      for (let y = 0; y < 5; y++)
        shuffled[y + 5 * ((2 * x + 3 * y) % 5)] = rotate(state[x + 5 * y]!, rotations[x + 5 * y]!)
    for (let x = 0; x < 5; x++)
      for (let y = 0; y < 5; y++)
        state[x + 5 * y] =
          shuffled[x + 5 * y]! ^
          (~shuffled[((x + 1) % 5) + 5 * y]! & shuffled[((x + 2) % 5) + 5 * y]!)
    state[0]! ^= constant
  }
  return Array.from({ length: 32 }, (_, index) =>
    Number((state[index >>> 3]! >> BigInt((index & 7) * 8)) & 255n)
      .toString(16)
      .padStart(2, '0'),
  ).join('')
}
export function ethereumChecksum(address: string): string {
  const lower = address.replace(/^0x/, '').toLowerCase(),
    hash = addressKeccak(lower)
  return (
    '0x' +
    [...lower]
      .map((char, index) => (parseInt(hash[index]!, 16) >= 8 ? char.toUpperCase() : char))
      .join('')
  )
}
export const ethereumAddress: Detector = {
  id: 'ethereum-address',
  detect(input) {
    if (typeof input !== 'string' || input.length > 100) return null
    const address = input.trim()
    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) return null
    const raw = address.slice(2),
      mixed = /[a-f]/.test(raw) && /[A-F]/.test(raw),
      canonical = ethereumChecksum(address)
    if (mixed && canonical !== address) return null
    return found(
      'ethereum-address',
      'Ethereum / EVM address format',
      {
        address,
        checksummedAddress: canonical,
        addressFormat: 'Ethereum / EVM',
        checksum: mixed ? 'valid' : 'not supplied',
      },
      mixed ? 0.999 : 0.99,
      {
        warnings: [
          warning('WALLET-UNVERIFIED', { code: 'warning-wallet-unverified' }, 'info'),
          ...(!mixed
            ? [
                warning(
                  'WALLET-CHECKSUM-ABSENT',
                  { code: 'warning-wallet-checksum-absent' },
                  'info',
                ),
              ]
            : []),
        ],
        metadata: { verifiedChecksum: mixed },
      },
    )
  },
}
