import { safeName, algorithmName } from './message-facts'
import { inspectUrl } from './formats/url-facts'
import { decodeLegacyPercent } from './formats/garbled'
import { identifyMagic } from './formats/magic-bytes'
import { binaryDetectors } from './formats/binary'
import { textDetectors } from './formats/text'
import { extraTimeId } from './formats/time-ids'
import { boundedInflate, ExpansionLimit } from './bounded-inflate'
import type { DecodeInput, Detection, Detector, LintWarning } from './types'
import {
  clampConfidence,
  decodeBase64,
  inputBytes,
  inputText,
  isProbablyUtf8,
  printableRatio,
} from './utils'

function result(
  detector: string,
  label: string,
  confidence: number,
  summary: import('./message-facts').MessageFact,
  value: unknown,
  evidence: Detection['evidence'],
  options: Partial<Pick<Detection, 'decoded' | 'warnings' | 'metadata'>> = {},
): Detection {
  return {
    detector,
    label,
    confidence: clampConfidence(confidence),
    summary,
    value,
    evidence,
    warnings: options.warnings ?? [],
    ...(options.decoded === undefined ? {} : { decoded: options.decoded }),
    ...(options.metadata === undefined ? {} : { metadata: options.metadata }),
  }
}

function jwtWarnings(
  payload: Record<string, unknown>,
  header: Record<string, unknown>,
  now: Date,
): LintWarning[] {
  const warnings: LintWarning[] = [
    {
      ruleId: 'JWT-SIGNATURE-UNVERIFIED',
      severity: 'info',
      message: { code: 'warning-jwt-signature-unverified' },
      specUrl: 'https://www.rfc-editor.org/rfc/rfc7519',
    },
  ]
  if (String(header.alg).toLowerCase() === 'none') {
    warnings.unshift({
      ruleId: 'JWT-ALG-NONE',
      severity: 'danger',
      message: { code: 'warning-jwt-alg-none' },
    })
  }
  if (typeof payload.exp !== 'number')
    warnings.push({
      ruleId: 'JWT-NO-EXP',
      severity: 'warning',
      message: { code: 'warning-jwt-no-exp' },
    })
  if (
    typeof payload.exp === 'number' &&
    typeof payload.iat === 'number' &&
    payload.exp - payload.iat > 86400
  )
    warnings.push({
      ruleId: 'JWT-LONG-LIFETIME',
      severity: 'info',
      message: { code: 'warning-jwt-long-lifetime' },
    })
  if (header.jku !== undefined || header.x5u !== undefined)
    warnings.push({
      ruleId: 'JWT-REMOTE-KEY-HEADER',
      severity: 'warning',
      message: { code: 'warning-jwt-remote-key-header' },
    })
  if (/^HS\d+$/.test(String(header.alg)))
    warnings.push({
      ruleId: 'JWT-SYMMETRIC-ALG',
      severity: 'info',
      message: { code: 'warning-jwt-symmetric-alg' },
    })
  const nowSeconds = Math.floor(now.getTime() / 1000)
  if (typeof payload.exp === 'number' && payload.exp < nowSeconds) {
    warnings.push({
      ruleId: 'JWT-EXPIRED',
      severity: 'danger',
      message: { code: 'warning-jwt-expired' },
    })
  }
  if (typeof payload.nbf === 'number' && payload.nbf > nowSeconds) {
    warnings.push({
      ruleId: 'JWT-NOT-ACTIVE',
      severity: 'warning',
      message: { code: 'warning-jwt-not-active' },
    })
  }
  return warnings
}

const jwtDetector: Detector = {
  id: 'jwt',
  detect(input, context) {
    const text = inputText(input).trim()
    const parts = text.split('.')
    if (parts.length !== 3 || !parts[0] || !parts[1]) return null
    const headerBytes = decodeBase64(parts[0] ?? '')
    const payloadBytes = decodeBase64(parts[1] ?? '')
    if (!headerBytes || !payloadBytes) return null
    try {
      const header = JSON.parse(inputText(headerBytes)) as Record<string, unknown>
      const payload = JSON.parse(inputText(payloadBytes)) as Record<string, unknown>
      if (!header || typeof header !== 'object' || !payload || typeof payload !== 'object')
        return null
      const hasAlgorithm = typeof header.alg === 'string'
      return result(
        'jwt',
        'JWT / JWS compact',
        hasAlgorithm ? 0.995 : 0.93,
        {
          code: 'summary-jwt',
          params: {
            algorithm: algorithmName(header.alg ?? 'unknown'),
            claimCount: Object.keys(payload).length,
          },
        },
        { header, payload, signature: parts[2] },
        [
          { code: 'three-segments', message: { code: 'evidence-three-segments' }, weight: 0.55 },
          {
            code: 'json-header',
            message: { code: 'evidence-json-header' },
            weight: 0.4,
          },
          ...(hasAlgorithm
            ? [
                {
                  code: 'alg',
                  message: {
                    code: 'evidence-alg' as const,
                    params: { algorithm: algorithmName(header.alg) },
                  },
                  weight: 0.05,
                },
              ]
            : []),
        ],
        {
          warnings: jwtWarnings(payload, header, context.now),
          metadata: { algorithm: header.alg, token: text },
        },
      )
    } catch {
      return null
    }
  },
}

const jsonDetector: Detector = {
  id: 'json',
  detect(input) {
    const text = inputText(input).trim()
    if (!text || !/^[{["\dtnf-]/.test(text)) return null
    try {
      const value = JSON.parse(text) as unknown
      const structured = typeof value === 'object' && value !== null
      const escapedString = typeof value === 'string'
      if (!structured && !escapedString) return null
      return result(
        'json',
        escapedString ? 'JSON string escapes' : 'JSON',
        structured ? 0.985 : 0.94,
        structured
          ? {
              code: 'summary-json',
              params: {
                kind: safeName(Array.isArray(value) ? 'Array' : 'Object'),
                entryCount: Object.keys(value).length,
              },
            }
          : { code: 'summary-json-2' },
        value,
        [
          {
            code: 'json-parse',
            message: { code: 'evidence-json-parse' },
            weight: structured ? 0.98 : 0.9,
          },
        ],
        escapedString ? { decoded: value } : {},
      )
    } catch {
      return null
    }
  },
}

const base64Detector: Detector = {
  id: 'base64',
  detect(input) {
    const raw = inputText(input).trim()
    if (/[ \t]/.test(raw)) return null
    const lines = raw.split(/\r?\n/)
    if (lines.length > 1 && lines.slice(0, -1).some((line) => ![64, 76].includes(line.length)))
      return null
    const text = lines.join('')
    if (text.length < 4 || text.length % 4 === 1 || !/^[A-Za-z0-9+/_-]+={0,2}$/.test(text))
      return null
    const bytes = decodeBase64(text)
    if (!bytes?.length) return null
    const ratio = printableRatio(bytes)
    const explicitUrl = /[-_]/.test(text)
    const padded = /=+$/.test(text)
    const compressed =
      !!identifyMagic(bytes) ||
      (bytes[0] === 0x28 && bytes[1] === 0xb5 && bytes[2] === 0x2f && bytes[3] === 0xfd) ||
      (bytes[0] === 0x1f && bytes[1] === 0x8b) ||
      (bytes[0] === 0x78 && [0x01, 0x5e, 0x9c, 0xda].includes(bytes[1] ?? -1))
    let structured = false
    try {
      const decoded = inputText(bytes).trim()
      if (/^[{["]/.test(decoded)) {
        const parsed: unknown = JSON.parse(decoded)
        structured = typeof parsed === 'string' || (parsed !== null && typeof parsed === 'object')
      }
    } catch {
      /* Invalid JSON does not strengthen the candidate. */
    }
    const confidence =
      compressed || structured
        ? 0.99
        : Math.min(
            0.96,
            0.62 + (ratio > 0.85 ? 0.2 : 0.05) + (padded ? 0.1 : 0) + (explicitUrl ? 0.04 : 0),
          )
    const decoded = isProbablyUtf8(bytes) ? inputText(bytes) : bytes
    return result(
      'base64',
      explicitUrl ? 'Base64URL' : 'Base64',
      confidence,
      ratio > 0.85
        ? { code: 'summary-base64', params: { bytes: bytes.byteLength } }
        : { code: 'summary-base64-2', params: { bytes: bytes.byteLength } },
      decoded,
      [
        { code: 'alphabet', message: { code: 'evidence-alphabet' }, weight: 0.45 },
        { code: 'decode', message: { code: 'evidence-decode' }, weight: 0.3 },
        {
          code: 'printable',
          message: {
            code: 'evidence-printable',
            params: { printablePercent: Math.round(ratio * 100) },
          },
          weight: 0.2,
        },
      ],
      { decoded },
    )
  },
}

const hexDetector: Detector = {
  id: 'hex',
  detect(input) {
    const text = inputText(input)
      .trim()
      .replace(/^0x/i, '')
      .replace(/[\s:-]/g, '')
    if (text.length < 4 || text.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(text)) return null
    const bytes = Uint8Array.from(text.match(/.{2}/g) ?? [], (pair) => Number.parseInt(pair, 16))
    const ratio = printableRatio(bytes)
    const hasPrefix = /^0x/i.test(inputText(input).trim())
    const compressed =
      !!identifyMagic(bytes) ||
      (bytes[0] === 0x28 && bytes[1] === 0xb5 && bytes[2] === 0x2f && bytes[3] === 0xfd) ||
      (bytes[0] === 0x1f && bytes[1] === 0x8b) ||
      (bytes[0] === 0x78 && [0x01, 0x5e, 0x9c, 0xda].includes(bytes[1] ?? -1))
    const confidence = compressed
      ? 0.99
      : Math.min(0.94, 0.68 + (hasPrefix ? 0.16 : 0) + (ratio > 0.75 ? 0.08 : 0))
    const decoded = isProbablyUtf8(bytes) ? inputText(bytes) : bytes
    return result(
      'hex',
      'Hexadecimal bytes',
      confidence,
      { code: 'summary-hex', params: { bytes: bytes.byteLength } },
      decoded,
      [
        { code: 'hex-alphabet', message: { code: 'evidence-hex-alphabet' }, weight: 0.7 },
        {
          code: 'printable',
          message: {
            code: 'evidence-printable',
            params: { printablePercent: Math.round(ratio * 100) },
          },
          weight: 0.15,
        },
      ],
      { decoded },
    )
  },
}

const urlDetector: Detector = {
  id: 'url',
  detect(input) {
    const text = inputText(input).trim()
    const hasEscapes = /%[0-9a-f]{2}/i.test(text)
    const looksPaddedBase64 = text.length % 4 === 0 && /^[A-Za-z0-9+/_-]+={1,2}$/.test(text)
    const hasQuery =
      !/^Cookie:/i.test(text) &&
      !looksPaddedBase64 &&
      (/&/.test(text)
        ? /^[^\s?#]+=[^\s&]*(?:&[^\s=]+=[^\s&]*)+$/.test(text)
        : /^[A-Za-z_][\w.-]{0,64}=.+$/.test(text))
    let parsedUrl: URL | null = null
    try {
      parsedUrl = /^[a-z][a-z\d+.-]*:\/\//i.test(text) ? new URL(text) : null
    } catch {
      parsedUrl = null
    }
    if (!hasEscapes && !hasQuery && !parsedUrl) return null
    try {
      let decoded = text
      let charset = 'utf-8'
      if (hasEscapes) {
        try {
          decoded = decodeURIComponent(text.replace(/\+/g, ' '))
        } catch {
          const legacy = decodeLegacyPercent(text)
          if (!legacy) return null
          decoded = legacy
          charset = 'euc-kr'
        }
      }
      const urlFacts = parsedUrl ? inspectUrl(parsedUrl) : null
      const query = parsedUrl
        ? Object.fromEntries(urlFacts!.clean.searchParams)
        : hasQuery
          ? Object.fromEntries(new URLSearchParams(text))
          : undefined
      return result(
        'url',
        parsedUrl ? 'URL' : hasQuery ? 'Query string' : 'URL-encoded text',
        parsedUrl ? 0.98 : hasQuery ? 0.72 : 0.9,
        parsedUrl
          ? {
              code: 'summary-url',
              params: { protocol: safeName(parsedUrl.protocol), host: safeName(parsedUrl.host) },
            }
          : hasQuery
            ? { code: 'summary-url-2' }
            : { code: 'summary-url-3' },
        parsedUrl
          ? {
              href: urlFacts!.clean.href,
              protocol: parsedUrl.protocol,
              host: parsedUrl.host,
              pathname: parsedUrl.pathname,
              query,
            }
          : (query ?? decoded),
        [{ code: 'url-syntax', message: { code: 'evidence-url-syntax' }, weight: 0.9 }],
        parsedUrl
          ? {
              warnings: urlFacts!.warnings,
              ...(urlFacts!.redirect ? { decoded: urlFacts!.redirect } : {}),
              metadata: {
                originalUrl:
                  urlFacts!.trackingCount || parsedUrl.password || parsedUrl.protocol === 'otpauth:'
                    ? urlFacts!.clean.href
                    : text,
                trackingCount: urlFacts!.trackingCount,
                destination: urlFacts!.redirect ? new URL(urlFacts!.redirect).host : parsedUrl.host,
                redirect: Boolean(urlFacts!.redirect),
              },
            }
          : hasEscapes
            ? { decoded, metadata: { charset } }
            : {},
      )
    } catch {
      return null
    }
  },
}

function epochDate(raw: string): { unit: string; milliseconds: number } | null {
  if (!/^-?\d{9,19}$/.test(raw)) return null
  const value = BigInt(raw)
  const absolute = value < 0n ? -value : value
  let unit: string
  let milliseconds: bigint
  if (absolute < 100_000_000_000n) {
    unit = 'seconds'
    milliseconds = value * 1000n
  } else if (absolute < 100_000_000_000_000n) {
    unit = 'milliseconds'
    milliseconds = value
  } else if (absolute < 100_000_000_000_000_000n) {
    unit = 'microseconds'
    milliseconds = value / 1000n
  } else {
    unit = 'nanoseconds'
    milliseconds = value / 1_000_000n
  }
  const numeric = Number(milliseconds)
  if (!Number.isFinite(numeric) || numeric < -8.64e15 || numeric > 8.64e15) return null
  return { unit, milliseconds: numeric }
}

const epochDetector: Detector = {
  id: 'epoch',
  detect(input) {
    const text = inputText(input).trim()
    const parsed = epochDate(text)
    if (!parsed) return null
    const date = new Date(parsed.milliseconds)
    const year = date.getUTCFullYear()
    const plausible = year >= 2000 && year <= 2200
    return result(
      'epoch',
      `Unix time (${parsed.unit})`,
      plausible ? 0.93 : 0.78,
      { code: 'summary-epoch', params: { milliseconds: date.getTime() } },
      { iso: date.toISOString(), unit: parsed.unit, milliseconds: parsed.milliseconds },
      [
        {
          code: 'integer-width',
          message: { code: 'evidence-integer-width', params: { unit: safeName(parsed.unit) } },
          weight: 0.65,
        },
        {
          code: 'date-range',
          message: plausible ? { code: 'evidence-date-range' } : { code: 'evidence-date-range-2' },
          weight: plausible ? 0.25 : 0.05,
        },
      ],
    )
  },
}

const crockford = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
function decodeUlidTime(value: string): number {
  let output = 0
  for (const char of value.slice(0, 10)) output = output * 32 + crockford.indexOf(char)
  return output
}

const uuidDetector: Detector = {
  id: 'uuid-ulid',
  detect(input) {
    const text = inputText(input).trim()
    const uuid =
      /^\{?([0-9a-f]{8})-([0-9a-f]{4})-([1-8][0-9a-f]{3})-([89ab][0-9a-f]{3})-([0-9a-f]{12})\}?$/i.exec(
        text,
      )
    if (uuid) {
      const version = Number(uuid[3]?.[0])
      const metadata: Record<string, unknown> = { version, variant: 'RFC 4122' }
      if (version === 1) {
        const ticks =
          ((BigInt(`0x${uuid[3]}`) & 0xfffn) << 48n) |
          (BigInt(`0x${uuid[2]}`) << 32n) |
          BigInt(`0x${uuid[1]}`)
        metadata.timestamp = new Date(Number((ticks - 122192928000000000n) / 10000n)).toISOString()
      }
      if (version === 7) {
        const milliseconds = Number.parseInt(`${uuid[1]}${uuid[2]}`, 16)
        metadata.timestamp = new Date(milliseconds).toISOString()
      }
      return result(
        'uuid-ulid',
        `UUID v${version}`,
        0.995,
        { code: 'summary-uuid-ulid', params: { version: version } },
        metadata,
        [{ code: 'uuid-layout', message: { code: 'evidence-uuid-layout' }, weight: 0.95 }],
        { metadata },
      )
    }
    if (/^[0-7][0-9A-HJKMNP-TV-Z]{25}$/i.test(text)) {
      const milliseconds = decodeUlidTime(text.toUpperCase())
      const metadata = { timestamp: new Date(milliseconds).toISOString(), sortable: true }
      return result(
        'uuid-ulid',
        'ULID',
        0.99,
        { code: 'summary-uuid-ulid-2', params: { milliseconds: Date.parse(metadata.timestamp) } },
        metadata,
        [{ code: 'ulid-layout', message: { code: 'evidence-ulid-layout' }, weight: 0.95 }],
        { metadata },
      )
    }
    return extraTimeId(text)
  },
}

const compressionDetector: Detector = {
  id: 'compression',
  detect(input, context) {
    const bytes = inputBytes(input)
    if (bytes.length < 3) return null
    const formats: Array<{
      label: string
      confidence: number
      test: boolean
      decode: () => Uint8Array
    }> = [
      {
        label: 'gzip',
        confidence: 0.999,
        test: bytes[0] === 0x1f && bytes[1] === 0x8b,
        decode: () => boundedInflate(bytes, 'gzip', context.limits),
      },
      {
        label: 'zlib',
        confidence: 0.98,
        test: bytes[0] === 0x78 && [0x01, 0x5e, 0x9c, 0xda].includes(bytes[1] ?? -1),
        decode: () => boundedInflate(bytes, 'zlib', context.limits),
      },
      {
        label: 'deflate',
        confidence: 0.72,
        test: false,
        decode: () => boundedInflate(bytes, 'deflate', context.limits),
      },
    ]
    for (const format of formats) {
      if (!format.test) continue
      try {
        const decoded = format.decode()
        const ratio = decoded.length / bytes.length
        if (
          decoded.length > context.limits.maxExpandedBytes ||
          ratio > context.limits.maxCompressionRatio
        ) {
          return result(
            'compression',
            format.label,
            format.confidence,
            {
              code: 'summary-compression',
              params: { expandedBytes: decoded.length, ratio: ratio },
            },
            { compressedBytes: bytes.length, expandedBytes: decoded.length, ratio },
            [
              {
                code: 'magic',
                message: { code: 'evidence-magic', params: { format: safeName(format.label) } },
                weight: 0.98,
              },
            ],
            {
              warnings: [
                {
                  ruleId: 'COMPRESSION-LIMIT',
                  severity: 'danger',
                  message: { code: 'warning-compression-limit' },
                },
              ],
            },
          )
        }
        const output: DecodeInput = isProbablyUtf8(decoded) ? inputText(decoded) : decoded
        return result(
          'compression',
          format.label,
          format.confidence,
          {
            code: 'summary-compression-2',
            params: { compressedBytes: bytes.length, expandedBytes: decoded.length },
          },
          output,
          [
            {
              code: 'magic',
              message: { code: 'evidence-magic-2', params: { format: safeName(format.label) } },
              weight: 0.98,
            },
          ],
          { decoded: output, metadata: { ratio } },
        )
      } catch (error) {
        if (error instanceof ExpansionLimit)
          return result(
            'compression',
            format.label,
            format.confidence,
            { code: 'summary-compression-3' },
            { compressedBytes: bytes.length, expandedBytes: null },
            [
              {
                code: 'magic',
                message: { code: 'evidence-magic', params: { format: safeName(format.label) } },
                weight: 0.98,
              },
            ],
            {
              warnings: [
                {
                  ruleId: 'COMPRESSION-LIMIT',
                  severity: 'danger',
                  message: { code: 'warning-compression-limit' },
                },
              ],
            },
          )
        return null
      }
    }
    return null
  },
}

export const defaultDetectors: Detector[] = [
  ...textDetectors,
  ...binaryDetectors,
  jwtDetector,
  jsonDetector,
  compressionDetector,
  uuidDetector,
  epochDetector,
  urlDetector,
  hexDetector,
  base64Detector,
]
