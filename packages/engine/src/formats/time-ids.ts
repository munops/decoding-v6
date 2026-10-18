import type { Detection } from '../types'
import { found } from './common'
export function extraTimeId(text: string): Detection | null {
  if (/^[\da-f]{24}$/i.test(text))
    return found(
      'uuid-ulid',
      'MongoDB ObjectId',
      {
        timestamp: new Date(parseInt(text.slice(0, 8), 16) * 1000).toISOString(),
        note: 'Could also be plain hex.',
      },
      0.7,
    )
  if (/^\d{17,20}$/.test(text)) {
    const timestamp = Number(BigInt(text) >> 22n) + 1420070400000
    return found(
      'uuid-ulid',
      'Snowflake (Discord epoch candidate)',
      {
        timestamp: new Date(timestamp).toISOString(),
        epoch: 'Discord 2015-01-01; other Snowflake deployments use different epochs.',
      },
      0.6,
    )
  }
  if (/^[0-9A-Za-z]{27}$/.test(text)) {
    let n = 0n
    for (const c of text)
      n =
        n * 62n +
        BigInt('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.indexOf(c))
    if (n >= 1n << 160n) return null
    const seconds = Number(n >> 128n) + 1400000000
    return found(
      'uuid-ulid',
      'KSUID candidate',
      { timestamp: new Date(seconds * 1000).toISOString() },
      0.7,
    )
  }
  return null
}
