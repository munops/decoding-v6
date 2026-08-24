import type { OperationDescriptor } from '@decoding/operations'
import type { Locale } from './catalog'

type OperationCopy = Pick<OperationDescriptor, 'name' | 'description'>

const koreanOperationCopy = {
  'json-format': {
    name: 'JSON 정리와 문법 확인',
    description: 'JSON 들여쓰기를 정리하거나 한 줄로 줄이고 문법 오류를 확인합니다.',
  },
  'html-format': {
    name: 'HTML 정리와 압축',
    description: 'HTML을 실행하지 않고 읽기 좋게 정리하거나 한 줄로 줄입니다.',
  },
  'css-format': {
    name: 'CSS 정리와 압축',
    description: 'CSS를 읽기 좋게 정리하거나 불필요한 공백을 줄입니다.',
  },
  'javascript-format': {
    name: 'JavaScript 정리와 압축',
    description: 'JavaScript를 실행하지 않고 소스 모양만 정리하거나 압축합니다.',
  },
  'erb-format': {
    name: 'ERB 정리와 압축',
    description: 'ERB 템플릿을 실행하지 않고 들여쓰기와 공백을 정리합니다.',
  },
  'less-format': {
    name: 'LESS 정리와 압축',
    description: 'LESS를 컴파일하지 않고 소스 모양만 정리하거나 압축합니다.',
  },
  'scss-format': {
    name: 'SCSS 정리와 압축',
    description: 'SCSS를 컴파일하지 않고 소스 모양만 정리하거나 압축합니다.',
  },
  'xml-format': {
    name: 'XML 정리와 압축',
    description: 'XML을 외부 자원에 연결하지 않고 정리하거나 한 줄로 줄입니다.',
  },
  'sql-format': {
    name: 'SQL 쿼리 정리',
    description: 'SQL 쿼리의 들여쓰기와 키워드 표기를 정리합니다.',
  },
  'line-sort': {
    name: '줄 정렬과 중복 제거',
    description: '텍스트를 줄 단위로 정렬하고 같은 줄을 한 번만 남깁니다.',
  },
  'url-parser': {
    name: 'URL 구성 확인',
    description: 'URL의 주소, 경로, 검색 조건을 항목별로 나눠 확인합니다.',
  },
  'yaml-to-json': {
    name: 'YAML → JSON 변환',
    description: 'YAML 데이터를 JSON 형식으로 바꿉니다.',
  },
  'json-to-yaml': {
    name: 'JSON → YAML 변환',
    description: 'JSON 데이터를 YAML 형식으로 바꿉니다.',
  },
  'number-base': {
    name: '2~36진수 변환',
    description: '정수를 2진수부터 36진수 사이에서 변환합니다.',
  },
  'json-to-csv': {
    name: 'JSON → CSV 표 변환',
    description: 'JSON 객체 배열을 CSV 표 형식으로 바꿉니다.',
  },
  'csv-to-json': {
    name: 'CSV → JSON 변환',
    description: 'CSV 표의 각 행을 JSON 객체로 바꿉니다.',
  },
  'html-to-jsx': {
    name: 'HTML → JSX 변환',
    description: '자주 쓰는 HTML 속성을 JSX 표기에 맞게 바꿉니다.',
  },
  'string-case': {
    name: '문자 표기법 변환',
    description: '텍스트를 camelCase, snake_case 같은 표기법으로 바꿉니다.',
  },
  'php-to-json': {
    name: 'PHP 배열 → JSON 변환',
    description: '안전한 범위의 PHP 배열 표기를 실행하지 않고 JSON으로 바꿉니다.',
  },
  'json-to-php': {
    name: 'JSON → PHP 배열 변환',
    description: 'JSON 데이터를 실행되지 않는 PHP 배열 표기로 바꿉니다.',
  },
  'php-serialize': {
    name: 'PHP 직렬화 값 만들기',
    description: 'JSON과 호환되는 데이터를 PHP 직렬화 형식으로 바꿉니다.',
  },
  'php-unserialize': {
    name: 'PHP 직렬화 값 풀기',
    description: 'PHP를 실행하지 않고 직렬화된 값의 구조를 확인합니다.',
  },
  'svg-to-css': {
    name: 'SVG → CSS 배경 변환',
    description: 'SVG를 CSS 배경 이미지에 넣을 수 있는 주소 형식으로 바꿉니다.',
  },
  'curl-to-code': {
    name: 'cURL 요청 → 코드 변환',
    description: 'cURL 명령을 실행하지 않고 선택한 언어의 요청 코드로 바꿉니다.',
  },
  'json-to-code': {
    name: 'JSON → 코드 모델 변환',
    description: 'JSON 구조를 바탕으로 여러 프로그래밍 언어의 자료형을 만듭니다.',
  },
  'hex-to-ascii': {
    name: '16진수 → 문자 변환',
    description: '16진수 바이트를 읽을 수 있는 문자로 바꿉니다.',
  },
  'ascii-to-hex': {
    name: '문자 → 16진수 변환',
    description: '문자를 UTF-8 바이트의 16진수 표기로 바꿉니다.',
  },
  'unix-time': {
    name: '유닉스 시간 변환',
    description: '초·밀리초·마이크로초·나노초 단위의 시간을 날짜로 바꿉니다.',
  },
  'jwt-debugger': {
    name: 'JWT 내용 확인',
    description: '서명이 검증됐다고 오해하지 않도록 JWT 머리글과 내용을 나눠 보여 줍니다.',
  },
  'regex-tester': {
    name: '정규식 시험',
    description: '제한된 입력 안에서 정규식이 찾는 부분을 확인합니다.',
  },
  'html-preview': {
    name: 'HTML 안전 미리보기',
    description: '스크립트와 네트워크를 막은 공간에서 HTML 모양을 확인합니다.',
  },
  'text-diff': {
    name: '텍스트 차이 비교',
    description: '두 텍스트가 다른 부분을 줄 단위로 비교합니다.',
  },
  'string-inspector': {
    name: '문자열 상세 확인',
    description: '문자 수, 공백, 코드 포인트와 UTF-8 바이트를 확인합니다.',
  },
  'markdown-preview': {
    name: 'Markdown 안전 미리보기',
    description: 'HTML 원문을 실행하지 않고 안전한 Markdown 결과를 미리 봅니다.',
  },
  'cron-parser': {
    name: 'Cron 일정 풀이',
    description: '다섯 칸 또는 여섯 칸 Cron 식이 뜻하는 실행 일정을 풀어 씁니다.',
  },
  'color-converter': {
    name: '색상 값 변환',
    description: 'CSS의 16진수·RGB·HSL 색상 값을 서로 바꿉니다.',
  },
  'uuid-ulid-generator': {
    name: 'UUID와 ULID 만들기와 확인',
    description: 'UUID v4·v7 또는 ULID를 만들고 기존 식별값의 정보를 확인합니다.',
  },
  'lorem-ipsum': {
    name: '자리표시용 문단 만들기',
    description: '레이아웃을 시험할 때 쓸 Lorem Ipsum 문단을 같은 조건으로 만듭니다.',
  },
  'qr-code': {
    name: 'QR 코드 읽기와 만들기',
    description: 'QR 이미지를 만들거나 사용자가 고른 이미지에서 내용을 읽습니다.',
  },
  'hash-generator': {
    name: '해시값 만들기',
    description: '입력에서 자주 쓰는 암호학적 해시값과 이전 방식의 해시값을 만듭니다.',
  },
  'random-string': {
    name: '무작위 문자열 만들기',
    description: '비밀번호, Nano ID, 라이선스 묶음 등에 쓸 무작위 문자열을 만듭니다.',
  },
  'base64-string': {
    name: 'Base64 문자열 변환',
    description: '일반 문자열과 Base64·Base64URL 표기를 서로 바꿉니다.',
  },
  'base64-image': {
    name: 'Base64 이미지 변환',
    description: '이미지와 Base64 데이터 주소를 이 기기에서 서로 바꿉니다.',
  },
  'url-codec': {
    name: 'URL 문자 변환',
    description: 'URL 구성 요소의 특수 문자를 안전한 퍼센트 표기로 바꾸거나 되돌립니다.',
  },
  'html-entity': {
    name: 'HTML 특수문자 변환',
    description: 'HTML 특수문자와 엔터티 표기를 텍스트로 서로 바꿉니다.',
  },
  'backslash-codec': {
    name: '백슬래시 이스케이프 변환',
    description: '줄바꿈 같은 문자를 백슬래시 표기로 바꾸거나 원래 문자로 되돌립니다.',
  },
  'x509-decoder': {
    name: 'X.509 인증서 내용 확인',
    description: 'PEM 또는 DER 인증서의 발급자, 대상, 유효기간과 키 정보를 확인합니다.',
  },
} as const satisfies Record<string, OperationCopy>

export function localizeOperation(
  locale: Locale,
  operation: OperationDescriptor,
): OperationDescriptor {
  if (locale !== 'ko') return operation
  const copy = koreanOperationCopy[operation.id as keyof typeof koreanOperationCopy]
  return copy ? { ...operation, ...copy } : operation
}

export function localizeOperations(
  locale: Locale,
  operations: OperationDescriptor[],
): OperationDescriptor[] {
  return operations.map((operation) => localizeOperation(locale, operation))
}

export const koreanOperationIds = Object.freeze(Object.keys(koreanOperationCopy))
