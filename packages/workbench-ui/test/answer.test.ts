import { expect, it } from 'vitest'
import { decode } from '@decoding/engine'
import { answerSentence, primaryLayers, summaryFormats } from '../src/answer-copy'
import { detectorSpecs } from '@decoding/spec-registry'
import { safeShareProjection } from '../src/safe-share'
import { finalSelection } from '../src/result-text'
import { decoderMessages } from '../src/messages'

it('has an authored summary for every format', () =>
  expect(summaryFormats.sort()).toEqual(detectorSpecs.map((spec) => spec.detector).sort()))
it('previews uncertain hashes without changing default engine decisions', async () => {
  const input = 'a'.repeat(32)
  const strict = await decode(input)
  expect(strict.root.status).toBe('ambiguous')
  expect(strict.root.selected).toBeUndefined()
  const preview = await decode(input, { previewAmbiguous: true })
  expect(preview.root.status).toBe('ambiguous')
  expect(preview.root.selected?.detector).toBe('hash')
  expect(answerSentence(preview.root, 'ko', input)).toContain('확실하지는 않아요')
})
it('summarizes and shares the observed chain when the final value is selected', async () => {
  const input = 'ZXlKdmNtUmxjaUk2SWtFdE1qQXpPVEVpTENKd1lXbGtJanAwY25WbGZRPT0='
  const result = await decode(input)
  expect(primaryLayers(result.root)).toHaveLength(3)
  expect(answerSentence(result.root, 'ko', input)).toContain('3겹')
  expect(
    safeShareProjection(result.root, finalSelection(result.root) ?? null, decoderMessages.en)
      ?.chain,
  ).toHaveLength(3)
})

it('keeps browser self-description isolated from token summary logic', async () => {
  const { decode } = await import('@decoding/engine')
  const { answerSentence } = await import('../src/answer-copy')
  const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Safari/604.1'
  expect(answerSentence((await decode(ua)).root, 'ko', ua)).toContain('iPhone의 Safari 17.0')
  const token = 'eyJhbGciOiJub25lIn0.eyJleHAiOjF9.'
  expect(answerSentence((await decode(token)).root, 'ko', token)).toContain('로그인 토큰')
})
