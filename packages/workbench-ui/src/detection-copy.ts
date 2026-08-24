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

export function detectionSummary(summary: string, messages: LocaleMessages): string {
  if (messages.locale !== 'ko') return summary
  const token = /^(.*?) token with (\d+) payload claims$/.exec(summary)
  if (token) {
    const algorithm = token[1] === 'none' ? '서명 없음(none)' : `${token[1]} 방식`
    return `${algorithm}으로 표시된 토큰이며 내용 항목 ${token[2]}개가 있습니다.`
  }
  const json = /^(Array|Object) with (\d+) top-level entries$/.exec(summary)
  if (json) return `${json[1] === 'Array' ? '배열' : '객체'}의 첫 단계 항목이 ${json[2]}개입니다.`
  if (summary === 'A JSON-escaped string') return 'JSON 문자열 안에 감싼 값입니다.'
  const decodedBytes = /^(\d+) decoded bytes(, mostly text)?$/.exec(summary)
  if (decodedBytes)
    return `${decodedBytes[1]}바이트를 풀었습니다${decodedBytes[2] ? '. 대부분 읽을 수 있는 문자입니다.' : '.'}`
  const bytes = /^(\d+) bytes$/.exec(summary)
  if (bytes) return `${bytes[1]}바이트입니다.`
  if (summary === 'Key/value query data') return '이름과 값으로 이루어진 URL 검색 조건입니다.'
  if (summary === 'Percent-encoded text') return '특수 문자를 퍼센트 표기로 바꾼 텍스트입니다.'
  const uuid = /^RFC 4122 variant, version (\d+)$/.exec(summary)
  if (uuid) return `RFC 4122 방식의 UUID 버전 ${uuid[1]}입니다.`
  const ulid = /^Sortable identifier from (.+)$/.exec(summary)
  if (ulid) return `${ulid[1]} 시간을 담아 정렬할 수 있는 식별값입니다.`
  const blocked = /^Expansion blocked at (\d+) bytes \(([^)]+)\)$/.exec(summary)
  if (blocked) return `압축을 푼 결과가 ${blocked[1]}바이트(${blocked[2]})에 이르러 멈췄습니다.`
  const expanded = /^(\d+) → (\d+) bytes$/.exec(summary)
  if (expanded) return `${expanded[1]}바이트를 ${expanded[2]}바이트로 풀었습니다.`
  return summary
}

export function detectionEvidence(message: string, messages: LocaleMessages): string {
  if (messages.locale !== 'ko') return message
  if (message === 'Three Base64URL segments') return '점으로 나뉜 Base64URL 구간이 세 개입니다.'
  if (message === 'Header and payload are valid JSON objects')
    return '머리글과 내용이 올바른 JSON 객체입니다.'
  if (message === 'Valid JSON grammar') return 'JSON 문법에 맞습니다.'
  if (message === 'Uses a Base64-compatible alphabet')
    return 'Base64에서 쓰는 문자로 이루어져 있습니다.'
  if (message === 'Decodes without invalid bytes') return '잘못된 바이트 없이 값을 풀 수 있습니다.'
  if (message === 'Even-length hexadecimal input') return '짝수 길이의 16진수 입력입니다.'
  if (message === 'Valid URL or percent/query syntax')
    return 'URL이나 검색 조건 표기 규칙에 맞습니다.'
  if (message === 'Date is in a common operational range')
    return '일반적으로 쓰는 날짜 범위 안입니다.'
  if (message === 'Date is outside the common range')
    return '일반적으로 쓰는 날짜 범위를 벗어납니다.'
  if (message === 'Canonical UUID layout and variant') return '표준 UUID 배치와 종류에 맞습니다.'
  if (message === '26-character Crockford Base32 ULID')
    return 'Crockford Base32로 된 26자 ULID입니다.'
  const algorithm = /^Algorithm header: (.+)$/.exec(message)
  if (algorithm) return `머리글의 서명 방식은 ${algorithm[1]}입니다.`
  const printable = /^(\d+)% printable output$/.exec(message)
  if (printable) return `결과의 ${printable[1]}%를 읽을 수 있는 문자로 표시할 수 있습니다.`
  const width = /^Digit width matches (.+)$/.exec(message)
  if (width) return `숫자 길이가 ${koreanUnit(width[1] ?? '')} 단위와 맞습니다.`
  const signature = /^(gzip|zlib|deflate) signature( and valid stream)?$/.exec(message)
  if (signature)
    return signature[2]
      ? `${signature[1]} 시작 표식과 데이터 흐름이 올바릅니다.`
      : `${signature[1]} 시작 표식과 맞습니다.`
  return message
}

export function detectionWarning(message: string, messages: LocaleMessages): string {
  if (messages.locale !== 'ko') return message
  if (message === 'The signature is decoded but not verified without a trusted key.')
    return '신뢰할 수 있는 키가 없어 서명 내용을 풀어 보기만 했으며, 서명이 올바른지는 검증하지 않았습니다.'
  if (message === 'The exp claim is in the past.') return '만료 시각(exp)이 이미 지났습니다.'
  if (message === 'The nbf claim is in the future.')
    return '사용 시작 시각(nbf)이 아직 오지 않았습니다.'
  if (message === 'Expanded output exceeds the safe limit.')
    return '압축을 푼 결과가 안전하게 처리할 수 있는 크기를 넘었습니다.'
  return message
}

export function localizedDetection(detection: Detection, messages: DecoderMessages): Detection {
  if (messages.locale !== 'ko') return detection
  return {
    ...detection,
    label: detectionLabel(detection.label, messages),
    summary: detectionSummary(detection.summary, messages),
    evidence: detection.evidence.map((item) => ({
      ...item,
      message: detectionEvidence(item.message, messages),
    })),
    warnings: detection.warnings.map((warning) => ({
      ...warning,
      message: detectionWarning(warning.message, messages),
    })),
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
