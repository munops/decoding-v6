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
