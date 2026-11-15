import type { Detector } from '../../types'
import { found, maskFields, warning } from '../common'
export const jsonLines: Detector = {
  id: 'json-lines',
  detect(input) {
    if (
      typeof input !== 'string' ||
      input.length > 262144 ||
      !input.includes('\n') ||
      input.startsWith('\ufeff')
    )
      return null
    const lines = input.replace(/\r?\n$/, '').split('\n')
    if (lines.length < 2 || lines.length > 4096 || lines.some((line) => !line.trim())) return null
    try {
      let imprecise = false
      const records = lines.map(
        (line) =>
          JSON.parse(line, (_key, value: unknown) => {
            if (
              typeof value === 'number' &&
              (!Number.isFinite(value) || (Number.isInteger(value) && !Number.isSafeInteger(value)))
            )
              imprecise = true
            return value
          }) as unknown,
      )
      return found(
        'json-lines',
        'JSON Lines',
        { lines: records.length, records: maskFields(records) },
        0.995,
        {
          warnings: imprecise
            ? [warning('JSON-NUMBER-PRECISION', { code: 'warning-json-number-precision' })]
            : [],
        },
      )
    } catch {
      return null
    }
  },
}
