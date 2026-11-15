import { describe, expect, it } from 'vitest'
import { decode, detect } from '../src'
const bytes = (value: string) => new TextEncoder().encode(value)
const misread = (value: string) => new TextDecoder('windows-1252').decode(bytes(value))
describe('reversible encoding paths and loss boundaries', () => {
  it('reverses UTF-8 including double corruption and western accents', async () => {
    for (const value of [
      '안녕하세요 세계',
      'こんにちは世界',
      '你好世界',
      'café déjà vu',
      'é',
      'ü',
    ]) {
      const result = await decode(misread(value), { previewAmbiguous: true })
      expect(result.root.selected?.value).toBe(value)
    }
    const result = await decode(misread(misread('안녕하세요')))
    expect(result.root.children[0]?.selected?.value).toBe('안녕하세요')
  })
  it('keeps exposed legacy regression cases provisional', async () => {
    for (const [input, expected] of [
      ['ÇÑ±Û º¯È¯', '한글 변환'],
      ['°¡³ª´Ù', '가나다'],
      ['ÁcÅé¤¤¤å', '繁體中文'],
    ]) {
      const result = await decode(input!, { previewAmbiguous: true })
      expect(result.root.selected?.value).toBe(expected)
      expect(result.root.status).toBe('ambiguous')
    }
  })
  it('preserves legitimate multilingual prose and binary bytes', async () => {
    for (const value of [
      'Français déjà vu été à Paris.',
      'Grüße aus Köln und München.',
      'Tiếng Việt rất đẹp.',
      '안녕하세요 세계',
      'English text with café and £5.',
      Uint8Array.of(0xff, 0x80, 0x00),
      'ff8000',
    ]) {
      const result = await decode(value, { previewAmbiguous: true })
      const walk = (node: typeof result.root): void => {
        expect(node.candidates.some((c) => ['mojibake', 'damaged-text'].includes(c.detector))).toBe(
          false,
        )
        node.children.forEach(walk)
      }
      walk(result.root)
    }
  })
  it('normalizes separated Hangul and decodes EUC-KR percent bytes', async () => {
    expect((await decode('한글 파일.txt'.normalize('NFD'))).root.selected?.value).toBe(
      '한글 파일.txt',
    )
    expect((await decode('%C7%D1%B1%DB')).root.selected?.value).toBe('한글')
    expect((await detect('%C7%ZZ')).some((c) => c.detector === 'url')).toBe(false)
  })
  it('never invents missing letters and qualifies punctuation-only loss', async () => {
    expect((await decode('한�글')).root.selected?.value).toBe('한�글')
    const candidate = (await detect('한?? 깨짐')).find((c) => c.detector === 'damaged-text')
    expect(candidate?.confidence).toBeLessThan(0.85)
    expect((await detect('Why?? Really?')).some((c) => c.detector === 'damaged-text')).toBe(false)
  })
  it('distinguishes mail and HTTP headers from ordinary YAML', async () => {
    const result = await decode(
      'From: "support@example.test" <other@example.test>\nTo: user@example.test\nReply-To: reply@example.test\nSubject: =?UTF-8?B?7ZWc6riA?=\nReceived: by relay.example.test\nReceived: by next.example.test',
    )
    expect(result.root.selected?.detector).toBe('http-headers')
    expect(result.root.selected?.metadata).toMatchObject({
      kind: 'mail',
      subject: '한글',
      receivedCount: 2,
    })
    expect(result.root.selected?.warnings.map((w) => w.ruleId)).toEqual([
      'MAIL-REPLY-TO',
      'MAIL-DISPLAY-ADDRESS',
    ])
    expect((await decode('name: ordinary\nlocal: true')).root.selected?.detector).toBe('yaml')
  })
})
