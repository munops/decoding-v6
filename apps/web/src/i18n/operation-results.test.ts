import type { OperationResult } from '@decoding/operations'
import { describe, expect, it } from 'vitest'
import { localizeOperationError, localizeOperationResult } from './operation-results'

describe('Korean operation result copy', () => {
  it('localizes summaries and safety warnings without changing output', () => {
    const result: OperationResult = {
      output: '{\n  "answer": 42\n}',
      kind: 'text',
      summary: 'Valid JSON',
      warnings: ['XML entities are not resolved and external resources are never loaded.'],
    }
    const localized = localizeOperationResult('ko', result)
    expect(localized.output).toBe(result.output)
    expect(localized.kind).toBe('text')
    expect(localized.summary).toBe('JSON 문법을 확인했습니다.')
    expect(localized.warnings).toEqual(['XML 엔터티를 풀거나 외부 자원을 불러오지 않습니다.'])
  })

  it('turns implementation errors into an actionable Korean message', () => {
    expect(localizeOperationError('ko', 'Unexpected token } in JSON at position 3')).toBe(
      'JSON 문법을 확인해 주세요.',
    )
    expect(localizeOperationError('ko', 'Unknown operation: example')).toBe(
      '입력을 처리하지 못했습니다. 형식과 선택 항목을 확인한 뒤 다시 시도해 주세요.',
    )
  })

  it('turns generator contract values into user-facing Korean summaries', () => {
    const result: OperationResult = {
      output: '01890f2e-9b8a-7cc2-98fc-000000000001',
      kind: 'text',
      summary: '1 uuid-v7 value',
    }
    expect(localizeOperationResult('ko', result).summary).toBe('UUID v7 식별값 1개를 만들었습니다.')
  })

  it('leaves the English result untouched', () => {
    const result: OperationResult = { output: 'ok', kind: 'text', summary: 'Valid JSON' }
    expect(localizeOperationResult('en', result)).toBe(result)
  })
})
