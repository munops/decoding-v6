import { expect, it } from 'vitest'
import { decode } from '@decoding/engine'
import { answerSentence } from '../src/answer-copy'
import { displayValue, finalSelection, outputText } from '../src/result-text'

const tasks = [
  ['readable stopping point', 'a2VlcC1teS10ZXh0', 'keep-my-text'],
  ['Korean Base64', '7JWI64WV7ZWY7IS47JqUIOyEuOqzhA==', '안녕하세요 세계'],
  ['unpadded Base64', 'SGVsbG8', 'Hello'],
  ['nested Base64 and JSON', 'ZXlKaElqb3hmUT09', '{\n  "a": 1\n}'],
  ['complete MIME subject', '=?UTF-8?B?7JWI64WV7ZWY7IS47JqU?=', '안녕하세요'],
  ['UTF-8 mojibake', 'ì•ˆë…•í•˜ì„¸ìš”', '안녕하세요'],
  ['legacy Korean mojibake', 'ÇÑ±Û º¯È¯', '한글 변환'],
  ['decomposed filename', '한글.txt', '한글.txt'],
  ['nested URL', 'https%253A%252F%252Fexample.test%252Fx', 'https://example.test/x'],
  ['Base64 gzip', 'H4sIAAAAAAACA/NIzcnJBwCCidH3BQAAAA==', 'Hello'],
  ['binary stays binary', '/wD+', 'ff 00 fe'],
] as const
for (const [name, input, expected] of tasks) {
  it(`finishes the representative task: ${name}`, async () => {
    const result = await decode(input, { previewAmbiguous: true })
    expect(outputText(displayValue(finalSelection(result.root)!))).toBe(expected)
  })
}
it('does not invent lost characters or force a truncated value into an answer', async () => {
  const lost = await decode('����', { previewAmbiguous: true })
  expect(answerSentence(lost.root, 'ko', '����')).toContain('되돌릴 수 없어요')
  const truncated = await decode('abcde', { previewAmbiguous: true })
  expect(finalSelection(truncated.root)).toBeUndefined()
  expect(truncated.root.status).toBe('unsupported')
})
