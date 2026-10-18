import type { DecodeResult } from '@decoding/engine'
export function safeReport(source: string, result?: DecodeResult | null): string {
  const length =
    source.length < 16
      ? '<16'
      : source.length < 256
        ? '16-255'
        : source.length < 4096
          ? '256-4095'
          : '4096+'
  const alphabet = /^\d+$/.test(source)
    ? 'digits'
    : /^[\da-f\s]+$/i.test(source)
      ? 'hex'
      : /\s/.test(source)
        ? 'whitespace'
        : 'mixed'
  const candidates =
    result?.root.candidates
      .map(
        (c, index) =>
          `${index + 1}. ${/^[a-z0-9-]+$/.test(c.detector) ? c.detector : 'custom'} ${Math.round(c.confidence * 100)}%`,
      )
      .join('\n') ?? 'none'
  return `decod.ing format report\nLength bucket: ${length}\nAlphabet class: ${alphabet}\nLines: ${Math.min(200, source.split(/\r?\n/).length)}\nCandidates:\n${candidates}\nInput and output values intentionally omitted.`
}
export function nearbyTools(source: string): string[] {
  if (source.trim().length < 2) return []
  if (/\b(?:SELECT|INSERT|UPDATE|CREATE TABLE)\b/i.test(source))
    return ['sql-format', 'text-diff', 'string-inspector']
  if (source.includes(',') && source.includes('\n'))
    return ['csv-to-json', 'text-diff', 'string-inspector']
  if (/^\d+$/.test(source.trim())) return ['number-base', 'unix-time', 'string-inspector']
  if (/^(?:0x)?[\da-f\s]+$/i.test(source.trim()))
    return ['hex-to-ascii', 'hash-generator', 'string-inspector']
  return ['string-inspector', 'base64-string', 'regex-tester']
}
