import type { Detector } from '../types'
import { inputText } from '../utils'
import { found, warning } from './common'
const names: Record<string, number> = {
  JAN: 1,
  FEB: 2,
  MAR: 3,
  APR: 4,
  MAY: 5,
  JUN: 6,
  JUL: 7,
  AUG: 8,
  SEP: 9,
  OCT: 10,
  NOV: 11,
  DEC: 12,
  SUN: 0,
  MON: 1,
  TUE: 2,
  WED: 3,
  THU: 4,
  FRI: 5,
  SAT: 6,
}
function field(text: string, min: number, max: number): number[] {
  const set = new Set<number>()
  for (const part of text
    .toUpperCase()
    .replace(/[A-Z]{3}/g, (x) => String(names[x] ?? x))
    .split(',')) {
    const [range, stepText] = part.split('/'),
      step = stepText === undefined ? 1 : Number(stepText)
    if (!Number.isInteger(step) || step < 1) throw new Error('Invalid step')
    const ends = range === '*' ? [min, max] : (range?.split('-').map(Number) ?? [])
    const first = ends[0],
      last = ends[1] ?? (stepText !== undefined ? max : first)
    if (
      first === undefined ||
      last === undefined ||
      !Number.isInteger(first) ||
      !Number.isInteger(last) ||
      first < min ||
      last > max ||
      last < first
    )
      throw new Error('Invalid field range')
    for (let n = first; n <= last; n += step) set.add(n)
  }
  return [...set].sort((a, b) => a - b)
}
export const cron: Detector = {
  id: 'cron',
  detect(input, context) {
    const text = inputText(input).trim(),
      parts = text.split(/\s+/)
    if (
      ![5, 6].includes(parts.length) &&
      parts.length >= 2 &&
      parts.length <= 8 &&
      parts.every((part) => /^[\d*,/-]+$/.test(part)) &&
      text.includes('*')
    )
      return found(
        'cron',
        'Cron schedule',
        { error: 'Expected 5 or 6 cron fields.', fields: parts.length },
        0.99,
      )
    if (
      ![5, 6].includes(parts.length) ||
      !parts.every((x) => /^[\dA-Z*,/-]+$/i.test(x)) ||
      !/[\d*]/.test(text)
    )
      return null
    try {
      const [sec, min, hour, day, month, dow] = parts.length === 5 ? ['0', ...parts] : parts
      const seconds = field(sec!, 0, 59),
        minutes = field(min!, 0, 59),
        hours = field(hour!, 0, 23),
        days = field(day!, 1, 31),
        months = field(month!, 1, 12),
        weekdays = field(dow!, 0, 7).map((x) => (x === 7 ? 0 : x))
      const next: string[] = []
      const date = new Date(context.now)
      date.setUTCHours(0, 0, 0, 0)
      for (let d = 0; d < 366 * 6 && next.length < 5; d++, date.setUTCDate(date.getUTCDate() + 1)) {
        if (!months.includes(date.getUTCMonth() + 1)) continue
        const dom = days.includes(date.getUTCDate()),
          week = weekdays.includes(date.getUTCDay())
        if (!(day === '*' ? week : dow === '*' ? dom : dom || week)) continue
        for (const h of hours) {
          for (const m of minutes) {
            for (const s of seconds) {
              const ms = date.getTime() + h * 3600000 + m * 60000 + s * 1000
              if (ms > context.now.getTime()) next.push(new Date(ms).toISOString())
              if (next.length === 5) break
            }
            if (next.length === 5) break
          }
          if (next.length === 5) break
        }
      }
      return found(
        'cron',
        'Cron schedule',
        { expression: text, timezone: 'UTC', nextRuns: next },
        0.999,
        {
          metadata: { detail: 'cron' },
          warnings:
            next.length < 5
              ? [warning('CRON-RANGE', 'Fewer than five runs found in the next six years.', 'info')]
              : [],
        },
      )
    } catch {
      return found('cron', 'Cron schedule', { error: 'Invalid 5- or 6-field cron expression' }, 0.7)
    }
  },
}
