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
