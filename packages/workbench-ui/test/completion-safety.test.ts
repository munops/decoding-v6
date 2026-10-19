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
