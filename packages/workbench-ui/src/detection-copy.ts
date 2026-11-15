import { presentDetection } from '@decoding/presentation'
import type { Detection } from '@decoding/engine'
import type { DecoderMessages } from './messages'

type LocaleMessages = Pick<DecoderMessages, 'locale'>

function koreanUnit(value: string): string {
  const units: Record<string, string> = {
    seconds: '초',
    milliseconds: '밀리초',
    microseconds: '마이크로초',
    nanoseconds: '나노초',
  }
  return units[value] ?? value
}

export function detectionLabel(label: string, messages: LocaleMessages): string {
  if (messages.locale !== 'ko') return label
  if (label === 'JWT / JWS compact') return 'JWT / JWS 압축 형식'
  if (label === 'JSON string escapes') return 'JSON 이스케이프 문자열'
  if (label === 'Hexadecimal bytes') return '16진수 바이트'
  if (label === 'Query string') return 'URL 검색 조건'
  if (label === 'URL-encoded text') return 'URL용 문자 표기'
  const unix = /^Unix time \(([^)]+)\)$/.exec(label)
  if (unix) return `유닉스 시간(${koreanUnit(unix[1] ?? '')})`
  return label
}

export function localizedDetection(detection: Detection, messages: DecoderMessages) {
  return {
    ...presentDetection(detection, messages.locale),
    label: detectionLabel(detection.label, messages),
  }
}

export function limitReason(reason: string, messages: LocaleMessages): string {
  if (messages.locale !== 'ko') return reason
  const reasons: Record<string, string> = {
    'input-size': '입력이 안전하게 처리할 수 있는 크기를 넘었습니다',
    depth: '겹쳐진 값을 8단계까지 확인했습니다',
    nodes: '확인할 수 있는 후보 수에 도달했습니다',
    cpu: '한 번의 처리 시간 제한에 도달했습니다',
    cancelled: '새 입력이 들어와 이전 확인을 멈췄습니다',
    cycle: '같은 값이 반복되어 확인을 멈췄습니다',
  }
  return reasons[reason] ?? reason
}
