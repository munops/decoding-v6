import type { Detection } from './types'

function structure(value: unknown, depth = 0): unknown {
  if (depth > 10) return '[depth limited]'
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => structure(item, depth + 1))
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 100)
        .map(([key, item]) => [
          key,
          /secret|token|password|authorization|cookie|private|signature|key/i.test(key)
            ? '[redacted]'
            : structure(item, depth + 1),
        ]),
    )
  return value === null ? null : `[${typeof value}]`
}

/** Explanatory prose can contain input-derived facts: never persist it as redacted metadata. */
export function redactedDetection(detection: Detection) {
  return {
    detector: detection.detector,
    label: detection.label,
    confidence: detection.confidence,
    evidence: detection.evidence.map(({ code, weight }) => ({ code, weight })),
    warnings: detection.warnings.map(({ ruleId, severity }) => ({ ruleId, severity })),
    structure: structure(detection.value),
  }
}
