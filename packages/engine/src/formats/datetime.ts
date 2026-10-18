import type { Detector } from '../types'
import { inputText } from '../utils'
import { found, warning } from './common'
export const datetime: Detector = {
  id: 'datetime',
  detect(input, context) {
    const text = inputText(input).trim()
    if (
      !/^\d{4}-\d\d-\d\d(?:T|$| )/.test(text) &&
      !/^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),? \d{1,2} [A-Z][a-z]{2} \d{4} /i.test(text)
    )
      return null
    const date = new Date(text)
    const iso = /^(\d{4})-(\d\d)-(\d\d)/.exec(text)
    const invalid =
      iso && Number(iso[3]) > new Date(Date.UTC(Number(iso[1]), Number(iso[2]), 0)).getUTCDate()
    if (!Number.isFinite(date.getTime()) || invalid)
      return found('datetime', 'Date and time', { error: 'This date does not exist' }, 0.99, {
        warnings: [warning('DATE-INVALID', 'This calendar date does not exist.')],
      })
    return found('datetime', 'Date and time', {
      utc: date.toISOString(),
      local: date.toLocaleString(),
      unixSeconds: date.getTime() / 1000,
      daysFromNow: Math.round((date.getTime() - context.now.getTime()) / 86400000),
    })
  },
}
