import type { Detection } from '@decoding/engine'
import { describe, expect, it } from 'vitest'
import { detectionLabel, limitReason, localizedDetection } from '../src/detection-copy'
import { decoderMessages } from '../src/messages'

const jwtDetection: Detection = {
  detector: 'jwt',
  label: 'JWT / JWS compact',
  confidence: 0.995,
  summary: 'none token with 2 payload claims',
  value: {},
  evidence: [{ code: 'three-segments', message: 'Three Base64URL segments', weight: 0.55 }],
  warnings: [
    {
      ruleId: 'JWT-EXPIRED',
      severity: 'danger',
      message: 'The exp claim is in the past.',
    },
  ],
}

describe('Korean detection copy', () => {
  it('localizes user-visible evidence while preserving detection contracts', () => {
    const localized = localizedDetection(jwtDetection, decoderMessages.ko)
    expect(localized).not.toBe(jwtDetection)
    expect(localized.detector).toBe('jwt')
    expect(localized.confidence).toBe(0.995)
    expect(localized.label).toBe('JWT / JWS 압축 형식')
    expect(localized.summary).toBe('서명 없음(none)으로 표시된 토큰이며 내용 항목 2개가 있습니다.')
    expect(localized.evidence[0]?.message).toBe('점으로 나뉜 Base64URL 구간이 세 개입니다.')
    expect(localized.warnings[0]?.message).toBe('만료 시각(exp)이 이미 지났습니다.')
  })

  it('keeps technical format names and localizes safety stop reasons', () => {
    expect(detectionLabel('Base64', decoderMessages.ko)).toBe('Base64')
    expect(limitReason('cycle', decoderMessages.ko)).toBe('같은 값이 반복되어 확인을 멈췄습니다')
  })

  it('does not alter the English source copy', () => {
    expect(localizedDetection(jwtDetection, decoderMessages.en)).toBe(jwtDetection)
  })
})
