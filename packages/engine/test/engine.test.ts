import { detectorSpecs } from '@decoding/spec-registry'
import { gzipSync, zlibSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import { decode, detect, encodeBase64 } from '../src'

describe('detectors', () => {
  it('detects and lints JWT', async () => {
    const jwt = `${encodeBase64(new TextEncoder().encode('{"alg":"RS256","typ":"JWT"}'), true)}.${encodeBase64(new TextEncoder().encode('{"sub":"123","exp":1}'), true)}.signature`
    const candidates = await detect(jwt, { now: new Date('2026-01-01T00:00:00Z') })
    expect(candidates[0]?.detector).toBe('jwt')
    expect(candidates[0]?.warnings.map((warning) => warning.ruleId)).toContain('JWT-EXPIRED')
  })

  it('builds a recursive Base64 to JSON chain', async () => {
    const encoded = encodeBase64(new TextEncoder().encode('{"ok":true}'))
    const result = await decode(encoded)
    expect(result.root.selected?.detector).toBe('base64')
    expect(result.root.children[0]?.selected?.detector).toBe('json')
  })

  it('detects timestamp, URL, UUID and ULID', async () => {
    expect((await detect('1767225600000'))[0]).toMatchObject({ detector: 'epoch' })
    expect((await detect('https://example.invalid/a?x=1'))[0]).toMatchObject({ detector: 'url' })
    expect((await detect('01890f3e-7b7c-7cc2-98c3-1f4ad2c07f80'))[0]).toMatchObject({
      detector: 'uuid-ulid',
    })
    expect((await detect('01ARZ3NDEKTSV4RRFFQ69G5FAV'))[0]).toMatchObject({
      detector: 'uuid-ulid',
    })
  })

  it('decompresses gzip and enforces recursive decoding', async () => {
    const compressed = gzipSync(new TextEncoder().encode('{"compressed":true}'))
    const result = await decode(compressed)
    expect(result.root.selected?.detector).toBe('compression')
    expect(result.root.children[0]?.selected?.detector).toBe('json')
  })

  it('does not promote ambiguous alphanumeric input to a confident format', async () => {
    const result = await decode('deadbeef')
    expect(['ambiguous', 'confident']).toContain(result.root.status)
    expect(result.root.candidates.length).toBeGreaterThan(1)
  })

  it('enforces input size', async () => {
    const result = await decode('too large', { limits: { maxInputBytes: 2 } })
    expect(result.root.status).toBe('limit')
    expect(result.root.limitReason).toBe('input-size')
  })
})

describe('completion regressions', () => {
  it('recognizes unsigned JWT and puts the danger first', async () => {
    const token = `${encodeBase64(new TextEncoder().encode('{"alg":"none"}'), true)}.${encodeBase64(new TextEncoder().encode('{"sub":"fixture"}'), true)}.`
    const root = (await decode(token)).root
    expect(root.selected?.detector).toBe('jwt')
    expect(root.selected?.warnings[0]).toMatchObject({ ruleId: 'JWT-ALG-NONE', severity: 'danger' })
  })
  it('rejects prose but preserves 64-column MIME base64', async () => {
    expect(
      (await detect('hello world this is not encoded')).some((x) => x.detector === 'base64'),
    ).toBe(false)
    const text = encodeBase64(new TextEncoder().encode('synthetic fixture '.repeat(10)))
    const wrapped = text.match(/.{1,64}/g)?.join('\n') ?? ''
    expect((await detect(wrapped)).some((x) => x.detector === 'base64')).toBe(true)
  })
  it('unwraps Base64 gzip and hex zlib through JSON', async () => {
    const raw = new TextEncoder().encode('{"ok":true}')
    for (const wrapped of [
      encodeBase64(gzipSync(raw)),
      Array.from(zlibSync(raw), (b) => b.toString(16).padStart(2, '0')).join(''),
    ]) {
      const root = (await decode(wrapped)).root
      expect(root.children[0]?.selected?.detector).toBe('compression')
      expect(root.children[0]?.children[0]?.selected?.detector).toBe('json')
    }
  })
  it('keeps every public landing example executable', async () => {
    for (const spec of detectorSpecs)
      for (const example of spec.examples) {
        const root = (await decode(example)).root
        const ids = (node: typeof root): string[] => [
          ...node.candidates.map((x) => x.detector),
          ...node.children.flatMap(ids),
        ]
        expect(ids(root), `${spec.detector}: ${example}`).toContain(spec.detector)
      }
  })
})

it('uses valid decoded JSON grammar as evidence for unpadded Base64', async () => {
  const input = encodeBase64(new TextEncoder().encode('{"local":true,"count":1}'))
  const root = (await decode(input)).root
  expect(root.selected?.detector).toBe('base64')
  expect(root.children[0]?.selected?.detector).toBe('json')
})
