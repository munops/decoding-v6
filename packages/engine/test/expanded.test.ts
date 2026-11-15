import { jsonLines } from '../src/formats/expanded/json-lines'
import { filetime } from '../src/formats/expanded/filetime'
import { asn1Der } from '../src/formats/expanded/asn1-der'
import { javaSerialization } from '../src/formats/expanded/java-serialization'
import { mac } from '../src/formats/expanded/mac'
import { cidr } from '../src/formats/expanded/cidr'
import { decode, detect } from '../src'
import { describe, it, expect } from 'vitest'
describe('explicit byte notation', () => {
  it('decodes binary UTF-8 and recurses through JSON', async () => {
    const text = '{"ok":true}'
    const encoded = [...new TextEncoder().encode(text)]
      .map((value) => value.toString(2).padStart(8, '0'))
      .join(' ')
    const result = await decode(encoded)
    expect(result.root.selected?.detector).toBe('binary-bytes')
    expect(result.root.children[0]?.selected?.value).toEqual({ ok: true })
  })
  it('leaves continuous digit strings provisional and rejects unrelated language', async () => {
    expect(
      (await detect('0100000101000010')).find((item) => item.detector === 'binary-bytes')
        ?.confidence,
    ).toBeLessThan(0.85)
    for (const text of [
      'La France est belle.',
      '보통 한국어 문장이에요.',
      'An ordinary English sentence.',
      '101 102',
      '0123',
    ])
      expect((await detect(text)).some((item) => item.detector === 'binary-bytes')).toBe(false)
  })
})

it('decodes octal UTF-8 bytes and preserves bounds and ambiguous numbers', async () => {
  expect(
    (await detect('355 225 234 352 270 200')).find((item) => item.detector === 'octal-bytes')
      ?.decoded,
  ).toBe('한글')
  expect(
    (await detect('101102')).find((item) => item.detector === 'octal-bytes')?.confidence,
  ).toBeLessThan(0.85)
  expect((await detect('0O101')).find((item) => item.detector === 'octal-bytes')?.decoded).toBe('A')
  expect(
    (await detect('0B01000001')).find((item) => item.detector === 'binary-bytes')?.decoded,
  ).toBe('A')
  for (const input of ['0o400', '777 101', '101 0o777'])
    expect((await detect(input)).some((item) => item.detector === 'octal-bytes')).toBe(false)
})
it('reads declared Safari release and Edge precedence without verifying the device', async () => {
  const input =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1'
  const result = await detect(input)
  const ua = result.find((item) => item.detector === 'user-agent')!
  expect(ua.value).toEqual({ browser: 'Safari', version: '17.0', os: 'iOS', device: 'iPhone' })
  expect(ua.warnings[0]?.ruleId).toBe('UA-SELF-REPORTED')
  const edge = (
    await detect('Mozilla/5.0 (Windows NT 10.0) Chrome/131.0 Safari/537.36 Edg/132.0')
  ).find((item) => item.detector === 'user-agent')!
  expect(edge.value).toHaveProperty('browser', 'Edge')
})
it('converts color notations and alpha without evaluating CSS', async () => {
  const read = async (input: string) =>
    (await detect(input)).find((item) => item.detector === 'color')?.value
  expect(await read('#ff8800')).toMatchObject({ hex: '#ff8800', rgb: 'rgb(255 136 0)', alpha: 1 })
  expect(await read('hsl(120 100% 50%)')).toHaveProperty('hex', '#00ff00')
  expect(await read('hsl(.5turn 100% 50%)')).toHaveProperty('hex', '#00ffff')
  expect(await read('#f008')).toHaveProperty('hex', '#ff000088')
  for (const input of [
    'rgb(1 2 3 /)',
    'rgb(1,2,3 / .5)',
    'hsl(0 100% 50%) url(https://example.test)',
  ])
    expect(await read(input)).toBeUndefined()
})
it('counts request cookies, masks SID and warns without declaring their purpose certain', async () => {
  const { maskCredentialFields } = await import('../src')
  const { answerFacts, answerSentence } = await import('../../presentation/src/answer-copy')
  const input = 'Cookie: SID=synthetic-session; theme=light'
  const result = await decode(input, { previewAmbiguous: true })
  const cookie = result.root.candidates.find((item) => item.detector === 'kv')!
  expect(cookie.value).toEqual({
    entries: [
      { name: 'SID', value: '[redacted]' },
      { name: 'theme', value: 'light' },
    ],
  })
  expect(cookie.warnings.some((item) => item.ruleId === 'COOKIE-CREDENTIAL')).toBe(true)
  expect(answerSentence(result.root, 'ko', input)).toContain('사이트가 나를 알아보려고')
  expect(answerFacts(cookie, 'ko')[0]?.[1]).toBe('2')
  expect(maskCredentialFields({ sid: 'synthetic', outside: 'ordinary' })).toEqual({
    sid: '[redacted]',
    outside: 'ordinary',
  })
  expect(
    (await detect('Cookie: theme=light')).find((item) => item.detector === 'kv')?.warnings,
  ).toHaveLength(0)
  for (const bad of [
    'Cookie:',
    'Cookie: not-a-pair',
    'Cookie: =missing',
    'Set-Cookie: Secure',
    'Cookie: x=y\nOther: z',
  ])
    expect((await detect(bad)).some((item) => item.detector === 'kv')).toBe(false)
})

it('allows cookie whitespace tabs but rejects control values', async () => {
  expect(
    (await detect('Cookie: theme=light;\tSID=synthetic')).some((item) => item.detector === 'kv'),
  ).toBe(true)
  expect(
    (await detect('Cookie: value=' + String.fromCharCode(1) + 'x')).some(
      (item) => item.detector === 'kv',
    ),
  ).toBe(false)
})
it('binds Bitcoin witness checksums to versions and rejects mistyped legacy addresses', async () => {
  const find = async (text: string) =>
    (await detect(text)).find((item) => item.detector === 'bitcoin-address')
  expect(
    (await find('bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0'))?.value,
  ).toMatchObject({ encoding: 'Bech32m', witnessVersion: 1, programBytes: 32 })
  expect((await find('BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4'))?.value).toMatchObject({
    encoding: 'Bech32',
    witnessVersion: 0,
    programBytes: 20,
  })
  expect((await find('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'))?.value).toHaveProperty(
    'checksum',
    'valid',
  )
  for (const bad of [
    '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNb',
    'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqh2y7hd',
    'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kemeawh',
  ])
    expect(await find(bad)).toBeUndefined()
})
it('matches ERC-55 vectors and the independent existing Keccak implementation', async () => {
  const { createRequire } = await import('node:module')
  const require = createRequire(import.meta.url)
  const reference = require(
    require.resolve('hash-wasm', {
      paths: [new URL('../../operations/', import.meta.url).pathname],
    }),
  ) as { keccak: (text: string, bits: number) => Promise<string> }
  const { erc55Vectors } = await import('../../fixtures-public/src/expanded-fixtures')
  const { ethereumChecksum, addressKeccak } =
    await import('../src/formats/expanded/ethereum-address')
  for (const vector of erc55Vectors) {
    expect(ethereumChecksum(vector)).toBe(vector)
    expect(addressKeccak(vector.slice(2).toLowerCase())).toBe(
      await reference.keccak(vector.slice(2).toLowerCase(), 256),
    )
  }
  for (let index = 0; index < 20; index++) {
    const hex = index.toString(16).padStart(40, 'a')
    expect(addressKeccak(hex)).toBe(await reference.keccak(hex, 256))
  }
  const mixed = await decode(erc55Vectors[4]!)
  expect(mixed.root.selected?.detector).toBe('ethereum-address')
  const legacy = (await detect(erc55Vectors[4]!.toLowerCase())).find(
    (item) => item.detector === 'ethereum-address',
  )!
  expect(legacy.warnings.some((item) => item.ruleId === 'WALLET-CHECKSUM-ABSENT')).toBe(true)
  expect(
    (await detect('0x5aaeb6053F3E94C9b9A09f33669435E7Ef1BeAed')).some(
      (item) => item.detector === 'ethereum-address',
    ),
  ).toBe(false)
})
it('decodes RFC Base45 vectors and preserves significant leading spaces', async () => {
  const { decode45 } = await import('../src/formats/expanded/base45')
  for (const [encoded, plain] of [
    ['BB8', 'AB'],
    ['%69 VD92EX0', 'Hello!!'],
    ['UJCLQE7W581', 'base-45'],
    ['QED8WEX0', 'ietf!'],
    [' A8', 'A.'],
  ])
    expect(new TextDecoder().decode(decode45(encoded!))).toBe(plain)
  expect((await detect(' A8')).find((item) => item.detector === 'base45')?.decoded).toBe('A.')
  for (const bad of ['0', 'ABCD', 'ZZ', ':::', 'BB8=', 'BB8 '])
    expect(() => decode45(bad)).toThrow()
  const manual = await decode('00', { overrides: { '0-1': 'base45' } })
  expect(manual.root.selected?.decoded).toEqual(new Uint8Array([0]))
})
it('keeps invalid UTF-8 bytes intact across byte notations and Base45 manual decoding', async () => {
  const { encode45 } = await import('../../fixtures-public/src/expanded-fixtures')
  const bytes = new Uint8Array([...new TextEncoder().encode('Hello world'), 255])
  const b45 = await decode(encode45(bytes), { overrides: { '0-1': 'base45' } })
  expect(b45.root.selected?.decoded).toEqual(bytes)
  for (const [id, radix, width] of [
    ['binary-bytes', 2, 8],
    ['octal-bytes', 8, 3],
  ] as const) {
    const input = [...bytes].map((value) => value.toString(radix).padStart(width, '0')).join(' ')
    expect((await detect(input)).find((item) => item.detector === id)?.decoded).toEqual(bytes)
  }
})
it('reads curl without executing shell expressions, files or requests', async () => {
  const { parseCurlRequest } = await import('../src')
  const source =
    'curl https://example.test \\\n -X GET -H "Authorization: Bearer synthetic" -d "a=1" -d "b=2"'
  const request = parseCurlRequest(source)
  expect(request).toMatchObject({ url: 'https://example.test', method: 'GET', body: 'a=1&b=2' })
  const candidate = (await detect(source)).find((item) => item.detector === 'curl-command')!
  expect(candidate.value).toHaveProperty('headers.Authorization', '[redacted]')
  expect(
    parseCurlRequest("curl --data-raw '$LITERAL' https://example.test").shellExpressions,
  ).toBeUndefined()
  expect(parseCurlRequest('curl "https://example.test/$EXPANSION"').shellExpressions).toBe(true)
  expect(
    parseCurlRequest('curl --data-binary @fixture.bin https://example.test').bodyFromFile,
  ).toBe(true)
  expect(
    parseCurlRequest('curl --data-raw @literal https://example.test').bodyFromFile,
  ).toBeUndefined()
})

it('computes exact inclusive CIDR counts and normalizes host bits without routing', async () => {
  const v4 = await cidr.detect('192.0.2.129/24', {} as never)
  expect(v4?.value).toMatchObject({
    first: '192.0.2.0',
    last: '192.0.2.255',
    addresses: '256',
    hostBitsPresent: true,
  })
  const v6 = await cidr.detect('::/0', {} as never)
  expect(v6?.value).toMatchObject({
    addresses: '340282366920938463463374607431768211456',
    first: '0:0:0:0:0:0:0:0',
  })
})

it('reads MAC bits without inferring device identity', async () => {
  expect((await mac.detect('02:00:5e:00:53:01', {} as never))?.value).toMatchObject({
    local: true,
    group: false,
  })
  expect((await mac.detect('ff:ff:ff:ff:ff:ff', {} as never))?.value).toMatchObject({
    broadcast: true,
    group: true,
  })
  expect(await mac.detect('00:00-5e:00:53:01', {} as never)).toBeNull()
})

it('reads Java modified UTF-8 strings without constructing objects', async () => {
  const { javaString } = await import('../../fixtures-public/src/expanded-fixtures')
  for (const value of ['Hello', '한글', '🙂', 'a\0b'])
    expect((await javaSerialization.detect(javaString(value), {} as never))?.decoded).toBe(value)
  expect((await javaSerialization.detect('rO0ABXQABUhlbGxv', {} as never))?.decoded).toBe('Hello')
})

it('shows DER tag lengths without exposing primitive key-like values', async () => {
  const input = new Uint8Array([48, 6, 4, 4, 65, 66, 67, 68])
  const result = await asn1Der.detect(input, {} as never)
  expect(result?.value).toMatchObject({
    structure: { tag: '0x30', children: [{ tag: '0x4', bytes: 4 }] },
  })
  expect(JSON.stringify(result)).not.toContain('ABCD')
  expect(await asn1Der.detect(new Uint8Array([48, 129, 3, 2, 1, 1]), {} as never)).toBeNull()
})

it('keeps FILETIME epoch and sub-millisecond ticks exact without promoting arbitrary numbers', async () => {
  expect((await filetime.detect('FILETIME: 116444736000000001', {} as never))?.value).toMatchObject(
    { timestamp: '1970-01-01T00:00:00.000Z', subMillisecondTicks: 1 },
  )
  expect((await filetime.detect('FILETIME: 116444735999999999', {} as never))?.value).toMatchObject(
    { timestamp: '1969-12-31T23:59:59.999Z', subMillisecondTicks: 9999 },
  )
  expect((await filetime.detect('133444736000000000', {} as never))?.confidence).toBeLessThan(0.85)
  expect(await filetime.detect('FILETIME: 18446744073709551615', {} as never)).toBeNull()
})

it('reads Snowflake fields with an explicit epoch while keeping bare identifiers uncertain', async () => {
  const { extraTimeId } = await import('../src/formats/time-ids')
  const known = extraTimeId('Discord: 175928847299117063')!
  expect(known.value).toMatchObject({
    timestamp: '2016-04-30T11:18:25.796Z',
    worker: 1,
    process: 0,
    increment: 7,
    explicitEpoch: true,
  })
  expect(extraTimeId('175928847299117063')!.confidence).toBe(0.6)
  expect(extraTimeId('18446744073709551616')).toBeNull()
  expect(JSON.stringify(known.value)).not.toContain('other Snowflake')
})

it('keeps the Snowflake subtype corpus independent of UUID public fixture counts', async () => {
  const { snowflakeFixtures } = await import('../../fixtures-public/src/expanded-fixtures')
  const { extraTimeId } = await import('../src/formats/time-ids')
  expect(snowflakeFixtures.filter((f) => f.class === 'positive')).toHaveLength(20)
  expect(snowflakeFixtures.filter((f) => f.class === 'edge')).toHaveLength(10)
  expect(snowflakeFixtures.filter((f) => f.class === 'negative')).toHaveLength(20)
  for (const fixture of snowflakeFixtures) {
    const candidate = extraTimeId(String(fixture.input))
    expect(candidate?.label.startsWith('Snowflake') ?? false, fixture.id).toBe(
      fixture.class !== 'negative',
    )
  }
})

it('reads JSON Lines with masked credentials and numeric limits disclosed', async () => {
  const result = await jsonLines.detect(
    '{"token":"synthetic-secret","id":1}\n{"id":2}',
    {} as never,
  )
  expect(result?.value).toMatchObject({
    lines: 2,
    records: [{ token: '[redacted]', id: 1 }, { id: 2 }],
  })
  expect(
    (await jsonLines.detect('9007199254740993\n0', {} as never))?.warnings.map((w) => w.ruleId),
  ).toContain('JSON-NUMBER-PRECISION')
  expect(await jsonLines.detect('1\n2\n\n', {} as never)).toBeNull()
})
