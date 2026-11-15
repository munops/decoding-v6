import type { Detector } from '../../types'
import { redactSecrets } from '../credential-redaction'
import { found } from '../common'
export const logLine: Detector = {
  id: 'log-line',
  detect(input) {
    if (typeof input !== 'string' || input.length > 65536) return null
    let text = input.trim(),
      timestamp = ''
    if (text.includes('\n') || text.includes('\r')) return null
    if (text.startsWith('[')) {
      const close = text.indexOf(']')
      if (close < 0 || close > 50) return null
      timestamp = text.slice(1, close)
      text = text.slice(close + 1)
      if (!/^\s/.test(text)) return null
    } else {
      const match =
        /^(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:[.,]\d{1,9})?(?:Z|[+-]\d{2}:?\d{2})?)\s+/.exec(
          text,
        )
      if (!match) return null
      timestamp = match[1]!
      text = text.slice(match[0].length)
    }
    const date =
      /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2}):(\d{2})(?:[.,](\d{1,9}))?(Z|[+-]\d{2}:?\d{2})?$/.exec(
        timestamp,
      )
    if (!date) return null
    const [year, month, day, hour, minute, second] = date.slice(1, 7).map(Number) as [
      number,
      number,
      number,
      number,
      number,
      number,
    ]
    const calendar = new Date(`${date[1]}-${date[2]}-${date[3]}T00:00:00Z`)
    if (
      calendar.getUTCFullYear() !== year ||
      calendar.getUTCMonth() + 1 !== month ||
      calendar.getUTCDate() !== day ||
      hour > 23 ||
      minute > 59 ||
      second > 59
    )
      return null
    const zone = date[8]
    if (zone && zone !== 'Z') {
      const parts = zone.slice(1).replace(':', '')
      if (Number(parts.slice(0, 2)) > 23 || Number(parts.slice(2)) > 59) return null
    }
    const level =
      /^(?:\[(TRACE|DEBUG|INFO|WARN|WARNING|ERROR|FATAL|CRITICAL)\]|(TRACE|DEBUG|INFO|WARN|WARNING|ERROR|FATAL|CRITICAL))(?::\s*|\s+)(\S[\s\S]*)$/i.exec(
        text.trimStart(),
      )
    if (!level) return null
    const normalized = `${date[1]}-${date[2]}-${date[3]}T${date[4]}:${date[5]}:${date[6]}.${(date[7] ?? '').padEnd(3, '0').slice(0, 3)}${zone?.replace(/([+-]\d{2})(\d{2})$/, '$1:$2') ?? ''}`
    return found(
      'log-line',
      'Timestamped log line',
      {
        timestamp,
        level: (level[1] ?? level[2])!.toUpperCase(),
        message: redactSecrets(level[3]!),
        timezoneExplicit: !!zone,
        ...(zone ? { utc: new Date(normalized).toISOString() } : {}),
      },
      0.97,
    )
  },
}
