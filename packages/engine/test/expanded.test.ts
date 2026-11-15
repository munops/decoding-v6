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
