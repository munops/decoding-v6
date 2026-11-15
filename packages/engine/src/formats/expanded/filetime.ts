import type { Detector } from '../../types'
import { found } from '../common'
export const filetime: Detector = {
  id: 'filetime',
  detect(input) {
    if (typeof input !== 'string' || input.length > 80) return null
    const text = input.trim(),
      explicit = /^FILETIME\s*:/i.test(text),
      digits = text.replace(/^FILETIME\s*:\s*/i, '')
    if (
      !(explicit ? /^(?:0x[\da-f]{1,16}|\d{1,20})$/i : /^(?:\d{17,18}|0x[\da-f]{16})$/i).test(
        digits,
      )
    )
      return null
    const ticks = BigInt(digits)
    if (ticks > 0xffffffffffffffffn) return null
    const milliseconds = Number(ticks / 10000n) - 11644473600000
    if (milliseconds < -11644473600000 || milliseconds > 253402300799999) return null
    // An unqualified counter is plausible only in the contemporary timestamp window.
    if (!explicit && (milliseconds < 0 || milliseconds > 4102444800000)) return null
    return found(
      'filetime',
      'Windows FILETIME',
      {
        ticks: ticks.toString(),
        timestamp: new Date(milliseconds).toISOString(),
        subMillisecondTicks: Number(ticks % 10000n),
        epoch: '1601-01-01T00:00:00Z',
        tickNanoseconds: 100,
        explicit,
      },
      explicit ? 0.999 : 0.65,
    )
  },
}
