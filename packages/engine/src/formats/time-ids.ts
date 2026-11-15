import { diagnosticField } from '../diagnostics'
import type { Detection } from '../types'
import { found } from './common'
export function extraTimeId(text: string): Detection | null {
  if (/^[\da-f]{24}$/i.test(text))
    return found(
      'uuid-ulid',
      'MongoDB ObjectId',
      {
        timestamp: new Date(parseInt(text.slice(0, 8), 16) * 1000).toISOString(),
        note: diagnosticField({ code: 'diagnostic-time-ids-note' }),
      },
      0.7,
    )
  const explicit = /^Discord(?: Snowflake)?\s*:\s*(\d{1,20})$/i.exec(text)
  if (explicit || /^\d{17,20}$/.test(text)) {
    const id = BigInt(explicit?.[1] ?? text)
    if (id > 0xffffffffffffffffn) return null
    const timestamp = Number(id >> 22n) + 1420070400000
    return found(
      'uuid-ulid',
      'Snowflake (Discord epoch candidate)',
      {
        timestamp: new Date(timestamp).toISOString(),
        epoch: diagnosticField({ code: 'diagnostic-snowflake-epoch' }),
        epochStart: '2015-01-01T00:00:00.000Z',
        worker: Number((id >> 17n) & 31n),
        process: Number((id >> 12n) & 31n),
        increment: Number(id & 4095n),
        explicitEpoch: !!explicit,
      },
      explicit ? 0.999 : 0.6,
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
