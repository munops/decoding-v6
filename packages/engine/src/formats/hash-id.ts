import type { Detector } from '../types'
import { inputText } from '../utils'
import { found } from './common'
export const hashId: Detector = {
  id: 'hash',
  detect(input) {
    const text = inputText(input).trim()
    const bcrypt = /^\$2[aby]\$(\d\d)\$[./A-Za-z0-9]{53}$/.exec(text),
      argon = /^\$(argon2(?:id|i|d))\$v=(\d+)\$m=(\d+),t=(\d+),p=(\d+)\$/.exec(text),
      crypt = /^\$([156])\$/.exec(text)
    if (bcrypt)
      return found('hash', 'bcrypt', {
        algorithm: 'bcrypt',
        cost: Number(bcrypt[1]),
        reversible: false,
      })
    if (argon)
      return found('hash', 'Argon2', {
        algorithm: argon[1],
        version: argon[2],
        memoryKiB: Number(argon[3]),
        iterations: Number(argon[4]),
        parallelism: Number(argon[5]),
        reversible: false,
      })
    if (crypt)
      return found('hash', 'Unix crypt', {
        algorithm: (
          { '1': 'MD5 crypt', '5': 'SHA-256 crypt', '6': 'SHA-512 crypt' } as Record<string, string>
        )[crypt[1] ?? ''],
        reversible: false,
      })
    if (!/^[\da-f]+$/i.test(text)) return null
    const possible = (
      { 32: 'MD5', 40: 'SHA-1', 64: 'SHA-256', 128: 'SHA-512' } as Record<number, string>
    )[text.length]
    return possible
      ? found(
          'hash',
          'Possible hash',
          {
            possibleAlgorithm: possible,
            basis: 'Length only; this may simply be hexadecimal data.',
            reversible: false,
            note: 'Hashes cannot be decoded back to the original value.',
          },
          0.69,
        )
      : null
  },
}
