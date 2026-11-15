import type { MessageFact } from './message-facts'
import type { Detection } from './types'
class DiagnosticField {
  constructor(readonly message: MessageFact) {}
}
export function diagnosticField(message: MessageFact): DiagnosticField {
  return new DiagnosticField(message)
}
export function withDiagnosticFields(detection: Detection): Detection {
  const diagnostics: NonNullable<Detection['diagnostics']> = []
  function walk(value: unknown, path: (string | number)[], depth: number): unknown {
    if (value instanceof DiagnosticField) {
      diagnostics.push({ path, message: value.message })
      return undefined
    }
    if (depth > 16 || !value || typeof value !== 'object' || value instanceof Uint8Array)
      return value
    if (Array.isArray(value))
      return value.map((item, index) => walk(item, [...path, index], depth + 1))
    if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null)
      return value
    return Object.fromEntries(
      Object.entries(value).flatMap(([key, item]) => {
        const next = walk(item, [...path, key], depth + 1)
        return next === undefined && item instanceof DiagnosticField ? [] : [[key, next]]
      }),
    )
  }
  const value = walk(detection.value, [], 0)
  return diagnostics.length
    ? { ...detection, value, diagnostics: [...(detection.diagnostics ?? []), ...diagnostics] }
    : detection
}
