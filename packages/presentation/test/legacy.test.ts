import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { decode, detect } from '@decoding/engine'
import { toLegacyResult } from '../src/legacy-engine-json'
import { formatEngineMessage } from '../src/engine-copy'
const baseline = JSON.parse(
  readFileSync('docs/evidence/decoding-improve-20261115/a13/legacy-json-baseline.json', 'utf8'),
)
const bytes = (value: unknown) =>
  value instanceof Uint8Array ? { type: 'bytes', hex: Buffer.from(value).toString('hex') } : value

// E1 intentionally adds one safety warning to the existing cookie format. The frozen
// pre-migration corpus stays untouched; every other field and record remains exact.
function approvedCookieWarning(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(approvedCookieWarning)
  if (!value || typeof value !== 'object') return value
  const record = Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, approvedCookieWarning(item)]),
  )
  if (record.detector === 'kv' && record.label === 'Cookie header')
    record.warnings = [
      ...(record.warnings as unknown[]),
      {
        ruleId: 'COOKIE-CREDENTIAL',
        severity: 'warning',
        message:
          'This cookie may contain login credentials. Keep it out of chats, AI tools and other sites.',
      },
    ]
  return record
}

// Normalize elapsed time and the single approved E1 warning addition. No fields are dropped.
describe('v6 CLI JSON compatibility', () => {
  for (const item of baseline.records)
    it(item.id, async () => {
      const input =
        typeof item.input === 'object'
          ? new Uint8Array(Buffer.from(item.input.hex, 'hex'))
          : item.input
      const native = await decode(input, { now: new Date(baseline.now) })
      const result = toLegacyResult({ ...native, elapsedMs: 0 })
      expect(JSON.parse(JSON.stringify(result, (_key, value) => bytes(value)))).toEqual(
        item.id === 'kv-positive-1' ? approvedCookieWarning(item.result) : item.result,
      )
    })
  it('keeps user-owned error and note fields as data', async () => {
    const original = { error: 'user text', note: { code: 'diagnostic-pem-error' } }
    const detection = (await detect(JSON.stringify(original))).find(
      (item) => item.detector === 'json',
    )!
    expect(detection.value).toEqual(original)
    expect(detection.diagnostics).toBeUndefined()
  })
  it('returns coded facts and translates without reading English sentences', async () => {
    const detection = (await detect('SGVsbG8=')).find((item) => item.detector === 'base64')!
    expect(detection.summary).toEqual({ code: 'summary-base64', params: { bytes: 5 } })
    expect(formatEngineMessage(detection.summary, 'ko')).toContain('5바이트')
  })
})

it('preserves the legacy unknown algorithm fallback for missing and null headers', async () => {
  const { encodeBase64 } = await import('@decoding/engine')
  for (const header of [{}, { alg: null }]) {
    const token = `${encodeBase64(new TextEncoder().encode(JSON.stringify(header)), true)}.e30.`
    const result = toLegacyResult(await decode(token, { now: new Date(baseline.now) }))
    expect((result.root as { selected: { summary: string } }).selected.summary).toBe(
      'unknown token with 0 payload claims',
    )
  }
})
it('keeps question-mark uncertainty distinct from confirmed replacement characters', async () => {
  const { warningTitle } = await import('../src/answer-copy')
  const possible = (await detect('한글 ??')).find((item) => item.detector === 'damaged-text')!
  const confirmed = (await detect('한글 �')).find((item) => item.detector === 'damaged-text')!
  expect(possible.warnings[0]!.message.code).toBe('warning-text-maybe-lost')
  expect(warningTitle(possible.warnings[0]!, 'ko')).toContain('수 있어요')
  expect(formatEngineMessage(possible.warnings[0]!.message, 'en')).toContain('may')
  expect(confirmed.warnings[0]!.message.code).toBe('warning-text-lost')
  expect(formatEngineMessage(confirmed.warnings[0]!.message, 'en')).not.toBe('TEXT-LOST')
})
