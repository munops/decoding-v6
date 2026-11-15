import { expect, it } from 'vitest'
import { executeOperation } from '../src'
it('compares every Caesar alternative without selecting a cipher', async () => {
  const result = await executeOperation('classical-cipher', 'Uryyb')
  expect(result.output).toHaveLength(25)
  expect(result.output).toContainEqual({ shift: 13, text: 'Hello' })
})
it('supports Atbash, numbered letters and only user-keyed Vigenere', async () => {
  expect((await executeOperation('classical-cipher', 'Svool', { mode: 'atbash' })).output).toBe(
    'Hello',
  )
  expect(
    (await executeOperation('classical-cipher', '8-5-12-12-15', { mode: 'a1z26' })).output,
  ).toBe('HELLO')
  expect(
    (await executeOperation('classical-cipher', 'LXFOPVEFRNHR', { mode: 'vigenere', key: 'LEMON' }))
      .output,
  ).toBe('ATTACKATDAWN')
  await expect(
    executeOperation('classical-cipher', 'cipher', { mode: 'vigenere' }),
  ).rejects.toThrow('CIPHER-KEY-REQUIRED')
  await expect(executeOperation('classical-cipher', '0-27', { mode: 'a1z26' })).rejects.toThrow(
    'CIPHER-A1Z26-RANGE',
  )
})
it('allows a selected legacy encoding while preserving damaged text', async () => {
  expect((await executeOperation('mojibake-repair', 'ÇÑ±Û', { charset: 'euc-kr' })).output).toBe(
    '한글',
  )
  await expect(executeOperation('mojibake-repair', '한�글')).rejects.toThrow(
    'MOJIBAKE-NO-REVERSIBLE-PATH',
  )
})
