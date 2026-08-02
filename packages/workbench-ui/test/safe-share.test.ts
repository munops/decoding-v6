import type { ChainNode, Detection } from '@decoding/engine'
import { describe, expect, it } from 'vitest'
import { decoderMessages } from '../src/messages'
import { safeShareCardSvg, safeShareMarkdown, safeShareProjection } from '../src/safe-share'

const rawInput = 'eyJzZWNyZXQiOiJEQ19TSEFSRV9DQU5BUllfOTkifQ=='
const decodedPayload = '{"secret":"DC_SHARE_CANARY_99"}'

const base64: Detection = {
  detector: 'base64',
  label: 'Base64',
  confidence: 0.99,
  evidence: [],
  summary: 'Base64-encoded text.',
  value: decodedPayload,
  warnings: [{ ruleId: 'B64-NONCANONICAL', severity: 'warning', message: 'Non-canonical.' }],
}

const json: Detection = {
  detector: 'json',
  label: 'JSON',
  confidence: 0.99,
  evidence: [],
  summary: 'JSON object.',
  value: { secret: 'DC_SHARE_CANARY_99' },
  warnings: [{ ruleId: 'JSON-DUPLICATE-KEY', severity: 'warning', message: 'Duplicate key.' }],
}

const root: ChainNode = {
  id: 'root',
  depth: 0,
  inputKind: 'text',
  inputSize: rawInput.length,
  candidates: [base64],
  selected: base64,
  children: [
    {
      id: 'child',
      depth: 1,
      inputKind: 'text',
      inputSize: decodedPayload.length,
      candidates: [json],
      selected: json,
      children: [],
      status: 'confident',
    },
  ],
  status: 'confident',
}

describe('safe share projection', () => {
  it('includes only public format labels, chain shape, and warning rule IDs', () => {
    const messages = decoderMessages.en
    const projection = safeShareProjection(root, base64, messages)

    expect(projection).toEqual({
      format: 'Base64',
      chain: ['Base64', 'JSON'],
      warningRuleIds: ['B64-NONCANONICAL', 'JSON-DUPLICATE-KEY'],
    })

    const markdown = safeShareMarkdown(projection!, messages)
    const card = safeShareCardSvg(projection!, messages)
    for (const output of [markdown, card]) {
      expect(output).not.toContain(rawInput)
      expect(output).not.toContain(decodedPayload)
      expect(output).not.toContain('DC_SHARE_CANARY_99')
      expect(output).not.toContain('Non-canonical.')
      expect(output).not.toContain('Duplicate key.')
    }
    expect(markdown).toContain('B64-NONCANONICAL')
    expect(markdown).toContain('Decoded locally at decod.ing')
    expect(card).toContain('JSON-DUPLICATE-KEY')
  })

  it('does not imply a decoded child chain for an alternate, unexecuted candidate', () => {
    const alternate: Detection = {
      ...base64,
      detector: 'hex',
      label: 'Hexadecimal bytes',
      warnings: [],
    }

    expect(safeShareProjection(root, alternate, decoderMessages.en)).toEqual({
      format: 'Hexadecimal bytes',
      chain: ['Hexadecimal bytes'],
      warningRuleIds: [],
    })
  })
})
