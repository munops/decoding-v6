import type { OperationResult } from '@decoding/operations'
import type { Locale } from './catalog'

function koreanSummary(summary: string): string {
  if (summary === 'Valid JSON') return 'JSON 문법을 확인했습니다.'
  const lines = /^(\d+) lines$/.exec(summary)
  if (lines) return `${lines[1]}개 줄을 처리했습니다.`
  const base = /^Base (\d+) → (\d+)$/.exec(summary)
  if (base) return `${base[1]}진수에서 ${base[2]}진수로 바꿨습니다.`
  const matches = /^(\d+) matches$/.exec(summary)
  if (matches) return `${matches[1]}곳이 일치합니다.`
  const segments = /^(\d+) diff segments$/.exec(summary)
  if (segments) return `서로 다른 부분 ${segments[1]}개를 찾았습니다.`
  const values = /^(\d+) (.+) values?$/.exec(summary)
  if (values) {
    const kind: Record<string, string> = {
      'uuid-v4': 'UUID v4 식별값',
      'uuid-v7': 'UUID v7 식별값',
      ulid: 'ULID 식별값',
    }
    return `${kind[values[2] ?? ''] ?? `${values[2]} 값`} ${values[1]}개를 만들었습니다.`
  }
  const characters = /^(\d+) characters$/.exec(summary)
  if (characters) return `${characters[1]}자로 QR 코드를 만들었습니다.`
  return summary
}

function koreanWarning(warning: string): string {
  const exact: Record<string, string> = {
    'Minify mode compacts formatting but does not perform dead-code elimination.':
      '공백과 줄바꿈만 줄이며 사용하지 않는 코드를 제거하지는 않습니다.',
    'ERB is formatted as inert text; embedded Ruby is never executed.':
      'ERB를 텍스트로만 정리하며 안의 Ruby 코드는 실행하지 않습니다.',
    'XML entities are not resolved and external resources are never loaded.':
      'XML 엔터티를 풀거나 외부 자원을 불러오지 않습니다.',
    'Review custom attributes and inline event handlers before use.':
      '사용하기 전에 사용자 정의 속성과 인라인 이벤트 처리 부분을 확인하세요.',
    'Only inert scalar and array syntax is accepted; PHP is never executed.':
      '값과 배열 표기만 읽으며 PHP 코드는 실행하지 않습니다.',
    'Objects and executable hooks are rejected.':
      '객체와 실행될 수 있는 연결 기능은 받지 않습니다.',
    'The cURL command was parsed as text and never executed.':
      'cURL 명령은 텍스트로만 읽었으며 실행하지 않았습니다.',
    'Results truncated at 1,000 matches.': '일치 결과는 1,000개까지만 표시합니다.',
    'Render only in a sandboxed iframe without allow-scripts, allow-forms, allow-popups, or allow-navigation.':
      '미리보기는 스크립트, 양식, 팝업과 다른 페이지 이동을 막은 공간에서만 표시합니다.',
    'Character detail truncated at 5,000 code points.':
      '문자 상세 정보는 코드 포인트 5,000개까지만 표시합니다.',
    'Raw HTML is escaped and links are limited to literal HTTP(S) URLs.':
      'HTML 원문은 문자로 표시하며 링크는 명시된 HTTP(S) 주소만 허용합니다.',
    'Private keys are never accepted or exported. Trust and revocation are not verified.':
      '비밀 키는 입력받거나 파일에 넣지 않습니다. 인증서의 신뢰 여부와 폐기 여부는 검증하지 않습니다.',
    'The signature is decoded but not verified without a trusted key.':
      '신뢰할 수 있는 키가 없어 서명 내용을 풀어 보기만 했으며, 서명이 올바른지는 검증하지 않았습니다.',
    'The exp claim is in the past.': '만료 시각(exp)이 이미 지났습니다.',
    'The nbf claim is in the future.': '사용 시작 시각(nbf)이 아직 오지 않았습니다.',
  }
  if (exact[warning]) return exact[warning]
  const sensitive = /^Sensitive headers detected: (.+)$/.exec(warning)
  if (sensitive) return `민감할 수 있는 요청 머리글을 찾았습니다: ${sensitive[1]}`
  return warning
}

export function localizeOperationResult(locale: Locale, result: OperationResult): OperationResult {
  if (locale !== 'ko') return result
  return {
    ...result,
    ...(result.summary ? { summary: koreanSummary(result.summary) } : {}),
    ...(result.warnings ? { warnings: result.warnings.map(koreanWarning) } : {}),
  }
}

export function localizeOperationError(locale: Locale, message: string): string {
  if (locale !== 'ko') return message
  if (/JSON must be an array/i.test(message)) return 'JSON의 첫 단계가 배열인지 확인해 주세요.'
  if (/Base64|Base64URL/i.test(message)) return 'Base64 또는 Base64URL 형식인지 확인해 주세요.'
  if (/PEM|DER|X\.509/i.test(message))
    return '지원하는 PEM 또는 DER X.509 인증서인지 확인해 주세요.'
  if (/QR/i.test(message)) return 'QR 이미지의 크기와 픽셀 정보를 확인해 주세요.'
  if (/hexadecimal/i.test(message)) return '16진수 문자가 짝수 개 들어 있는지 확인해 주세요.'
  if (/pattern option|Regex/i.test(message)) return '찾을 정규식과 입력 길이를 확인해 주세요.'
  if (/SVG/i.test(message)) return '스크립트가 없는 SVG 표기만 사용할 수 있습니다.'
  if (/MIME/i.test(message)) return '이미지 파일 형식을 확인해 주세요.'
  if (/Unexpected|JSON|position|token/i.test(message)) return 'JSON 문법을 확인해 주세요.'
  return '입력을 처리하지 못했습니다. 형식과 선택 항목을 확인한 뒤 다시 시도해 주세요.'
}
