import type { DecodeInput, Detection, LintWarning } from '../types'
import { inputText, printableRatio } from '../utils'
export function found(
  detector: string,
  label: string,
  value: unknown,
  confidence = 0.99,
  options: Partial<Pick<Detection, 'decoded' | 'warnings' | 'metadata'>> = {},
): Detection {
  return {
    detector,
    label,
    value,
    confidence,
    summary: label,
    evidence: [
      {
        code: `${detector}-grammar`,
        message: `Matched ${label} grammar and structure`,
        weight: confidence,
      },
    ],
    warnings: [],
    ...options,
  }
}
export function warning(
  ruleId: string,
  message: string,
  severity: LintWarning['severity'] = 'warning',
): LintWarning {
  return { ruleId, message, severity }
}
export function readable(bytes: Uint8Array): DecodeInput {
  return printableRatio(bytes) > 0.85 ? inputText(bytes) : bytes
}
export function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}
export async function digest(bytes: Uint8Array, algorithm = 'SHA-256'): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest(algorithm, new Uint8Array(bytes)))
}
export const sensitiveKey =
  /secret|token|password|authorization|cookie|private|signature|session|credential|api.?key/i
export function maskFields(value: unknown, depth = 0): unknown {
  if (depth > 12) return '[depth limited]'
  if (Array.isArray(value)) return value.slice(0, 64).map((v) => maskFields(v, depth + 1))
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 200)
        .map(([k, v]) => [k, sensitiveKey.test(k) ? '[redacted]' : maskFields(v, depth + 1)]),
    )
  return value
}

/** Scan bounded value fields without retaining them in display summaries. */
export function encodedFields(entries: Array<{ name: string; raw: string }>) {
  return entries
    .slice(0, 64)
    .filter(
      ({ name, raw }) =>
        (!sensitiveKey.test(name) || /^(?:Bearer\s+)?[\w-]+\.[\w-]+\.[\w-]*$/.test(raw)) &&
        (/^(?:Bearer\s+)?[\w-]+\.[\w-]+\.[\w-]*$/.test(raw) ||
          /%[\da-f]{2}/i.test(raw) ||
          (raw.length >= 12 && /^[A-Za-z0-9+/_-]+={0,2}$/.test(raw))),
    )
    .map(({ name, raw }) => ({ path: name, encoded: raw }))
}
