import { reproduceCommands } from '../src/reproduce-commands'
import { expect, it } from 'vitest'
import { decode } from '@decoding/engine'
import { answerSentence, primaryLayers, summaryFormats } from '../src/answer-copy'
import { detectorSpecs } from '@decoding/spec-registry'
import { safeShareProjection } from '../src/safe-share'
import { finalSelection, selectedPrimaryRoot } from '../src/result-text'
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

it('keeps readable text ahead of an additional ambiguous byte guess without deleting that guess', async () => {
  const result = await decode('a2VlcC1teS10ZXh0', { previewAmbiguous: true })
  expect(finalSelection(result.root)?.value).toBe('keep-my-text')
  expect(result.root.children[0]?.selected?.value).toBeInstanceOf(Uint8Array)
})

it('continues through genuine nested data and recognized binary containers', async () => {
  for (const input of ['ZXlKaElqb3hmUT09', 'H4sIAAAAAAACA/NIzcnJBwCCidH3BQAAAA==']) {
    const result = await decode(input, { previewAmbiguous: true })
    expect(finalSelection(result.root)).not.toBe(result.root.selected)
  }
  const binary = await decode('/wD+', { previewAmbiguous: true })
  expect(finalSelection(binary.root)?.value).toBeInstanceOf(Uint8Array)
})

it('reproduces only the chosen prefix and never crosses into embedded fields', async () => {
  const root = (await decode('ZXlKaElqb3hmUT09', { previewAmbiguous: true })).root
  const selected = root.selected!
  const prefix = selectedPrimaryRoot(root, selected)!
  expect(reproduceCommands(prefix).shell.match(/base64 --decode/g)).toHaveLength(1)
  expect(prefix.children).toHaveLength(0)
  const embedded = {
    ...root,
    children: root.children.map((child) => ({ ...child, sourcePath: '$.value' })),
  }
  expect(selectedPrimaryRoot(embedded, root.children[0]!.selected!)).toBeUndefined()
})
