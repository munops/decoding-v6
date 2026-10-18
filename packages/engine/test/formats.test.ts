import { createHash, generateKeyPairSync } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { decode, detect, encodeBase64, inputText } from '../src'
import { decode32, decode58, decode85 } from '../src/formats/base-n'
import { crc24 } from '../src/formats/pgp-armor'
import { redactSecrets } from '../src/formats/secret-patterns'
const candidate = async (id: string, text: string) =>
  (await detect(text)).find((item) => item.detector === id)
const enc = (text: string) => encodeBase64(new TextEncoder().encode(text), true)
describe('new format outcomes and cross-negative regressions', () => {
  it('follows bearer JWT, dates and cookies without treating padded Base64 as a query', async () => {
    const token = `${enc('{"alg":"none"}')}.${enc('{"sub":"synthetic"}')}.`
    expect((await decode(`Bearer ${token}`)).root.children[0]?.selected?.detector).toBe('jwt')
    expect((await decode(`Cookie: token=${token}`)).root.children[0]?.selected?.detector).toBe(
      'jwt',
    )
    expect((await candidate('datetime', '2026-10-17T09:00:00+09:00'))?.value).toMatchObject({
      unixSeconds: 1792195200,
    })
    expect((await candidate('datetime', '2026-02-30T00:00:00Z'))?.warnings[0]?.ruleId).toBe(
      'DATE-INVALID',
    )
    expect((await candidate('kv', 'Set-Cookie: session=synthetic'))?.warnings).toHaveLength(3)
  })
  it('implements published Base32/Base58/Ascii85 vectors and rejects malformed padding', () => {
    expect(inputText(decode32('MZXW6YTBOI======'))).toBe('foobar')
    expect(inputText(decode58('StV1DL6CwTryKyV'))).toBe('hello world')
    expect(inputText(decode85('<~87cURD_*#TDfTZ)+T~>'))).toBe('Hello, world!')
    expect(() => decode32('MZXW6==')).toThrow()
  })
  it('keeps private key bytes and credentials out of results and default copies', async () => {
    const privateToken =
      '-----BEGIN PRIVATE KEY-----\nZml4dHVyZUtleUJ5dGVz\n-----END PRIVATE KEY-----'
    expect(JSON.stringify(await candidate('pem', privateToken))).not.toContain(
      'Zml4dHVyZUtleUJ5dGVz',
    )
    expect(
      JSON.stringify(await candidate('auth-header', 'Basic dXNlcjpwYXNzd29yZA==')),
    ).not.toContain(':"password"')
    const key = 'ghp_synthetic012345678901234567890'
    expect((await candidate('secret-patterns', key))?.warnings[0]?.severity).toBe('danger')
    expect(redactSecrets(`log ${key} end`)).toBe('log ghp_[redacted] end')
    const k8s = await candidate(
      'k8s-secret',
      'apiVersion: v1\nkind: Secret\ndata:\n  password: cGFzc3dvcmQ=',
    )
    expect(JSON.stringify(k8s?.value)).not.toContain('"decoded"')
    expect(k8s?.metadata?.secretFields).toMatchObject([{ name: 'password', decoded: 'password' }])
  })
  it('shows cron runs, IPv6 scope, ID time, punycode spoofing, and hash limits', async () => {
    const cron = await candidate('cron', '*/5 * * * *')
    expect((cron?.value as { nextRuns: string[] }).nextRuns).toHaveLength(5)
    expect((await candidate('ip', '::1'))?.value).toMatchObject({ scope: 'loopback' })
    expect((await candidate('ip', '3232235521'))?.value).toMatchObject({
      address: '192.168.0.1',
      scope: 'private',
    })
    expect(await candidate('ip', '999.1.1.1')).toBeUndefined()
    expect((await candidate('uuid-ulid', '507f1f77bcf86cd799439011'))?.value).toMatchObject({
      timestamp: '2012-10-17T21:13:27.000Z',
    })
    expect((await candidate('punycode', 'xn--80ak6aa92e.com'))?.warnings[0]?.ruleId).toBe(
      'IDN-CONFUSABLE',
    )
    expect((await candidate('hash', 'a'.repeat(64)))?.confidence).toBeLessThan(0.85)
  })
  it('finds encoded JSON fields with paths and rejects unrelated prose', async () => {
    const root = (
      await decode(JSON.stringify({ token: `${enc('{"alg":"none"}')}.${enc('{"sub":"test"}')}.` }))
    ).root
    expect(root.children[0]?.sourcePath).toBe('$.token')
    expect(root.children[0]?.selected?.detector).toBe('jwt')
    for (const text of [
      'hello world this is not encoded',
      'ordinary development notes',
      'not an encoded string',
    ]) {
      const matches = await detect(text)
      expect(matches).toEqual([])
    }
  })
  it('computes OpenSSH fingerprints from the entire wire blob', async () => {
    const wire = Buffer.concat([
      Buffer.from([0, 0, 0, 11]),
      Buffer.from('ssh-ed25519'),
      Buffer.from([0, 0, 0, 32]),
      Buffer.alloc(32, 7),
    ])
    const fingerprint = `SHA256:${createHash('sha256').update(wire).digest('base64').replace(/=+$/, '')}`
    expect(
      (await candidate('ssh-key', `ssh-ed25519 ${wire.toString('base64')} fixture`))?.value,
    ).toMatchObject({ bits: 256, fingerprint })
  })
  it('checks CRC24 and v4 public-key fingerprints including changed armor', async () => {
    expect(crc24(new TextEncoder().encode('123456789'))).toBe(0x21cf02)
    const { publicKey } = generateKeyPairSync('rsa', { modulusLength: 1024 })
    const jwk = publicKey.export({ format: 'jwk' })
    const mpi = (str: string) => {
      const b = Buffer.from(str, 'base64url')
      const bits = (b.length - 1) * 8 + 32 - Math.clz32(b[0]!)
      return Buffer.concat([Buffer.from([bits >> 8, bits & 255]), b])
    }
    const body = Buffer.concat([Buffer.from([4, 0x65, 0x53, 0xf1, 0, 1]), mpi(jwk.n!), mpi(jwk.e!)])
    const packet = Buffer.concat([Buffer.from([0x99, body.length >> 8, body.length & 255]), body])
    const expected = createHash('sha1').update(packet).digest('hex').toUpperCase()
    const crc = crc24(packet),
      check = Buffer.from([crc >> 16, (crc >> 8) & 255, crc & 255]).toString('base64')
    const armor = `-----BEGIN PGP PUBLIC KEY BLOCK-----\n\n${packet.toString('base64')}\n=${check}\n-----END PGP PUBLIC KEY BLOCK-----`
    expect((await candidate('pgp-armor', armor))?.value).toMatchObject({
      checksum: 'valid',
      key: { fingerprint: expected },
    })
    expect(
      (await candidate('pgp-armor', armor.replace(`=${check}`, '=AAAA')))?.warnings[0]?.ruleId,
    ).toBe('PGP-CHECKSUM')
  })
})

describe('completion recovery and nested field regressions', () => {
  it('retains failed forced interpretations instead of silently choosing another format', async () => {
    const result = await decode('hello world', { overrides: { '0-1': 'xml' } })
    expect(result.root.selected?.warnings[0]?.ruleId).toBe('MANUAL-DECODE-FAILED')
    expect(result.root.selected?.detector).toBe('xml')
  })
  it('walks multiple header, query and env values with field paths', async () => {
    const token = `${enc('{"alg":"none"}')}.${enc('{"sub":"synthetic"}')}.`
    for (const input of [
      `?first=${token}&second=${token}x`,
      `HTTP/1.1 200 OK\nX-First: ${token}\nX-Second: ${token}x`,
      `FIRST=${token}\nSECOND=${token}x`,
    ]) {
      const result = await decode(input)
      expect(result.root.children).toHaveLength(2)
      expect(result.root.children.every((node) => typeof node.sourcePath === 'string')).toBe(true)
    }
  })
  it('retains unsupported MIME bytes and hides Kubernetes plaintext until reveal', async () => {
    const mime = await candidate('mime', '=?unknown-synthetic-charset?B?aGVsbG8=?=')
    expect(mime?.warnings[0]?.ruleId).toBe('MIME-CHARSET-UNSUPPORTED')
    expect(mime?.value).toMatchObject({
      unsupportedCharsets: [{ bytes: [104, 101, 108, 108, 111] }],
    })
    const k8s = await candidate(
      'k8s-secret',
      'apiVersion: v1\nkind: Secret\nstringData:\n  password: synthetic',
    )
    expect(JSON.stringify(k8s?.value)).not.toContain('synthetic')
    expect(k8s?.metadata?.secretFields).toMatchObject([
      { name: 'stringData.password', decoded: 'synthetic' },
    ])
  })
})
