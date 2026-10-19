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

export function parserUnavailable(error: unknown): boolean {
  return error instanceof Error && error.name === 'LocalParserUnavailableError'
}
export function unavailableDetection(
  id: string,
  label: string,
  input: DecodeInput,
  confidence: number,
): Detection {
  return found(
    id,
    label,
    {
      error: 'Local parser is not cached. Connect, then choose Try again.',
      ...(typeof input === 'string' ? {} : { bytes: input.length }),
    },
    confidence,
    {
      warnings: [
        warning(
          'LOCAL-PARSER-UNAVAILABLE',
          'Open this local parser once online, then retry. Earlier layers and raw bytes are kept.',
        ),
      ],
    },
  )
}
/** Numeric diagnostics only: parser messages can contain the original private input. */
export function parserPosition(error: unknown): { line?: number; column?: number } {
  if (!error || typeof error !== 'object') return {}
  const value = error as {
    line?: unknown
    column?: unknown
    linePos?: Array<{ line: number; col: number }>
    message?: unknown
  }
  const message = typeof value.message === 'string' ? value.message : ''
  const line = value.linePos?.[0]?.line ?? value.line ?? /line\s+(\d+)/i.exec(message)?.[1]
  const column =
    value.linePos?.[0]?.col ?? value.column ?? /col(?:umn)?\s+(\d+)/i.exec(message)?.[1]
  return {
    ...(Number(line) > 0 ? { line: Number(line) } : {}),
    ...(Number(column) > 0 ? { column: Number(column) } : {}),
  }
}
