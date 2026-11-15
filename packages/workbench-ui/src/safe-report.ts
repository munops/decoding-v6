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
export function nearbyTools(source: string, result?: DecodeResult): string[] {
  if (source.trim().length < 2) return []
  const candidates = result?.root.candidates.map((item) => item.detector) ?? []
  const byFormat: Record<string, string[]> = {
    'curl-command': ['curl-to-code', 'url-parser', 'string-inspector'],
    mojibake: ['mojibake-repair', 'string-inspector', 'text-diff'],
    'unicode-normalization': ['string-inspector', 'mojibake-repair', 'text-diff'],
    jwt: ['jwt-debugger', 'base64-string', 'unix-time'],
    json: ['json-format', 'json-to-code', 'text-diff'],
    url: ['url-parser', 'url-codec', 'string-inspector'],
    epoch: ['unix-time', 'number-base', 'string-inspector'],
    hex: ['hex-to-ascii', 'number-base', 'hash-generator'],
    hash: ['hash-generator', 'hex-to-ascii', 'string-inspector'],
    yaml: ['yaml-to-json', 'json-format', 'text-diff'],
    'magic-bytes': ['qr-code', 'base64-image', 'string-inspector'],
  }
  for (const id of candidates) if (byFormat[id]) return byFormat[id]!
  if (/^#[a-f0-9]{3,8}$|^(?:rgb|hsl)a?\(/i.test(source.trim()))
    return ['color-converter', 'string-inspector', 'text-diff']
  if (/^curl\s/.test(source.trim())) return ['curl-to-code', 'url-parser', 'string-inspector']
  if (/\b(?:SELECT|INSERT|UPDATE|CREATE TABLE)\b/i.test(source))
    return ['sql-format', 'text-diff', 'string-inspector']
  if (source.includes(',') && source.includes('\n'))
    return ['csv-to-json', 'text-diff', 'string-inspector']
  if (/^\d+$/.test(source.trim())) return ['number-base', 'unix-time', 'string-inspector']
  if (/^(?:0x)?[\da-f\s]+$/i.test(source.trim()))
    return ['hex-to-ascii', 'hash-generator', 'string-inspector']
  return /^[A-Za-z][A-Za-z\s.,!?'-]*$/.test(source.trim())
    ? ['string-inspector', 'classical-cipher', 'base64-string']
    : ['string-inspector', 'base64-string', 'regex-tester']
}
