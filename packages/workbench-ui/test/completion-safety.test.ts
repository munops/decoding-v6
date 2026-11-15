import { describe, expect, it } from 'vitest'
import { encodeBase64, decode } from '@decoding/engine'
import { byteStats } from '../src/ByteMap'
import { hexDump } from '../src/HexDump'
import { safeReport, nearbyTools } from '../src/safe-report'
import { KeyFormatError, verifyJwt } from '../src/jwt-verify'
const enc = (text: string) => encodeBase64(new TextEncoder().encode(text), true)
describe('result safety and byte inspection', () => {
  it('reports distribution without inventing entropy for empty or short data', () => {
    expect(byteStats(new Uint8Array())).toEqual({ entropy: 0, printable: 0 })
    expect(byteStats(new Uint8Array(256))).toMatchObject({ entropy: 0 })
    expect(byteStats(Uint8Array.from({ length: 256 }, (_, i) => i)).entropy).toBe(8)
    expect(hexDump(new Uint8Array([0x41, 0xff, 0, 0x42]))).toContain('000000  41 ff 00 42')
  })
  it('keeps input and decoded values out of reports while suggesting real tools', async () => {
    const secret = 'REPORT_CANARY_89ef_synthetic_secret'
    const text = enc(JSON.stringify({ secret }))
    const result = await decode(text)
    const report = safeReport(text, result)
    expect(report).not.toContain(secret)
    expect(report).not.toContain(text)
    expect(report).toContain('base64')
    expect(nearbyTools('SELECT id FROM fixture')).toContain('sql-format')
    expect(nearbyTools('name,value\nlocal,true')).toContain('csv-to-json')
    expect(nearbyTools('x')).toEqual([])
  })
  for (const bits of [256, 384, 512])
    it(`verifies HS${bits} and rejects a wrong key`, async () => {
      const secret = 'synthetic-test-key-not-for-production'
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: `SHA-${bits}` },
        false,
        ['sign'],
      )
      const signed = `${enc(JSON.stringify({ alg: `HS${bits}` }))}.${enc('{"sub":"fixture"}')}`
      const signature = new Uint8Array(
        await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signed)),
      )
      const token = `${signed}.${encodeBase64(signature, true)}`
      expect(await verifyJwt(token, secret)).toBe(true)
      expect(await verifyJwt(token, 'wrong-synthetic-key')).toBe(false)
    })
  for (const alg of ['RS256', 'PS256', 'ES256', 'ES384', 'ES512'])
    it(`verifies ${alg} using a public JWK only`, async () => {
      const bits = Number(alg.slice(2)),
        ec = alg.startsWith('ES'),
        ps = alg.startsWith('PS')
      const algorithm = ec
        ? { name: 'ECDSA', namedCurve: bits === 256 ? 'P-256' : bits === 384 ? 'P-384' : 'P-521' }
        : {
            name: ps ? 'RSA-PSS' : 'RSASSA-PKCS1-v1_5',
            modulusLength: 1024,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256',
          }
      const keys = (await crypto.subtle.generateKey(algorithm, true, [
        'sign',
        'verify',
      ])) as CryptoKeyPair
      const signed = `${enc(JSON.stringify({ alg }))}.${enc('{"sub":"fixture"}')}`
      const sign = ec
        ? { name: 'ECDSA', hash: `SHA-${bits}` }
        : ps
          ? { name: 'RSA-PSS', saltLength: 32 }
          : { name: 'RSASSA-PKCS1-v1_5' }
      const signature = new Uint8Array(
        await crypto.subtle.sign(sign, keys.privateKey, new TextEncoder().encode(signed)),
      )
      const key = JSON.stringify(await crypto.subtle.exportKey('jwk', keys.publicKey))
      expect(await verifyJwt(`${signed}.${encodeBase64(signature, true)}`, key)).toBe(true)
      expect(
        await verifyJwt(
          `${enc(JSON.stringify({ alg }))}.${enc('{"sub":"changed"}')}.${encodeBase64(signature, true)}`,
          key,
        ),
      ).toBe(false)
    })
})

it('returns safe JWK JSON line and column diagnostics without echoing the supplied key', async () => {
  const token = `${enc('{"alg":"RS256"}')}.${enc('{}')}.c2ln`
  for (const key of ['{', '{\n  "private_canary": "NEVER_EXPOSE_KEY",\n  broken\n}']) {
    try {
      await verifyJwt(token, key)
      throw new Error('Expected key error')
    } catch (error) {
      expect(error).toBeInstanceOf(KeyFormatError)
      expect((error as KeyFormatError).line).toBeGreaterThan(0)
      expect((error as KeyFormatError).column).toBeGreaterThan(0)
      expect((error as Error).message).not.toMatch(/NEVER_EXPOSE_KEY|private_canary|broken/)
    }
  }
})

it('points to invalid PEM boundaries and Base64 characters without exposing key bytes', async () => {
  const token = `${enc('{"alg":"RS256"}')}.${enc('{}')}.c2ln`
  for (const [key, line] of [
    ['not a public key', 1],
    ['-----BEGIN PUBLIC KEY-----\nAA!A\n-----END PUBLIC KEY-----', 2],
  ] as const) {
    try {
      await verifyJwt(token, key)
      throw new Error('Expected error')
    } catch (error) {
      expect(error).toBeInstanceOf(KeyFormatError)
      expect((error as KeyFormatError).line).toBe(line)
      expect((error as Error).message).not.toMatch(/AA!A|not a public key/)
    }
  }
})

it('selects the final primary decoded value and preserves a full URL', async () => {
  const { finalSelection, displayValue } = await import('../src/result-text')
  const { decode, encodeBase64 } = await import('@decoding/engine')
  const encoded = encodeBase64(
    new TextEncoder().encode(encodeBase64(new TextEncoder().encode('{"ok":true}'))),
  )
  expect(finalSelection((await decode(encoded)).root)?.value).toEqual({ ok: true })
  const href = 'https://example.invalid/a?q=1&x=2#part'
  expect(
    displayValue(
      finalSelection((await decode(encodeURIComponent(encodeURIComponent(href)))).root)!,
    ),
  ).toBe(href)
})

it('protects complete DER decode paths, byte views, layer previews and saved/copy values', async () => {
  const { ResultInspector } = await import('../src/ResultInspector')
  const { AnswerCard } = await import('../src/AnswerCard')
  const { privateKeyDetection, finalSelection, structureSelection, outputText } =
    await import('../src/result-text')
  const { decoderMessages } = await import('../src/messages')
  const canary = 'DER_PRIVATE_CANARY_4817'
  const body = new TextEncoder().encode(canary)
  const bytes = new Uint8Array([48, body.length + 2, 4, body.length, ...body])
  for (const input of [bytes, encodeBase64(bytes)]) {
    const result = await decode(input, { previewAmbiguous: true })
    const final = finalSelection(result.root)!
    expect(privateKeyDetection(result.root)?.detector).toBe('asn1-der')
    expect(outputText(final.value)).not.toContain(canary)
    expect(JSON.stringify(structureSelection(result.root, final))).not.toContain(canary)
    const noop = () => {}
    const inspector = ResultInspector({
      source: '',
      selected: result.root.selected ?? null,
      result,
      messages: decoderMessages.en,
      onInspectValue: noop,
      exportRedacted: noop,
      copySafeSummary: async () => {},
      downloadSafeShareCard: noop,
      setShowCandidates: noop,
      setMessage: noop,
    })
    const card = AnswerCard({
      source: encodeBase64(bytes),
      result,
      messages: decoderMessages.en,
      onCopy: noop,
      onManual: noop,
    })
    // Inspect the actual component output, not unrendered child props carrying the decode state.
    const componentNames: string[] = []
    const domText = (value: unknown): string => {
      if (Array.isArray(value)) return value.map(domText).join(' ')
      if (typeof value === 'string' || typeof value === 'number') return String(value)
      if (!value || typeof value !== 'object') return ''
      const vnode = value as { type: unknown; props?: { children?: unknown } }
      if (typeof vnode.type === 'function') componentNames.push(vnode.type.name)
      return domText(vnode.props?.children)
    }
    const shown = domText([inspector, card])
    expect(componentNames).not.toContain('ByteMap')
    expect(componentNames).not.toContain('HexDump')
    expect(shown).not.toContain(canary)
    expect(shown).not.toContain(encodeBase64(bytes))
  }
})

it('uses SQL detection rather than a SELECT-only text guess for nearby tools', async () => {
  const input = 'WITH report AS (SELECT id FROM logs) SELECT * FROM report'
  expect(nearbyTools(input, await decode(input, { previewAmbiguous: true }))).toEqual([
    'sql-format',
  ])
})

it('offers all Caesar choices only for unclear short Latin text without cipher selection', async () => {
  const { canCompareCaesar } = await import('../src/ClassicalCandidates')
  const { caesarCandidates } = await import('@decoding/operations')
  expect(canCompareCaesar((await decode('Uryyb', { previewAmbiguous: true })).root, 'Uryyb')).toBe(
    true,
  )
  expect(caesarCandidates('Uryyb')).toHaveLength(25)
  expect(caesarCandidates('Uryyb')).toContainEqual({ shift: 13, text: 'Hello' })
  expect(
    canCompareCaesar(
      (await decode('SELECT id FROM logs', { previewAmbiguous: true })).root,
      'SELECT id FROM logs',
    ),
  ).toBe(false)
  expect(canCompareCaesar((await decode('A normal sentence.')).root, 'A normal sentence.')).toBe(
    false,
  )
})
