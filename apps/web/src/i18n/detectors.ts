import type { DetectorSpec } from '@decoding/spec-registry'
import type { Locale } from './catalog'

type DetectorCopy = Pick<DetectorSpec, 'label' | 'description' | 'examples'>

const koreanDetectorCopy = {
  jwt: {
    label: 'JWT / JWS 압축 형식',
    description:
      '서명을 검증한 것으로 오해하지 않도록 JWT의 구간, 시간 경고와 알고리즘을 확인합니다.',
    examples: [
      'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJleGFtcGxlIn0.',
      '점 세 개로 나뉜 Base64URL 구간',
      '만료된 exp 값과 아직 이른 nbf 값',
    ],
  },
  base64: {
    label: 'Base64 / Base64URL',
    description: '일반 텍스트일 가능성도 함께 보여 주면서 Base64와 Base64URL 값을 풉니다.',
    examples: ['SGVsbG8sIGxvY2FsIHdvcmxkIQ==', 'eyJsb2NhbCI6dHJ1ZX0', 'U29tZV91cmwtc2FmZS10ZXh0'],
  },
  json: {
    label: 'JSON / 이스케이프 문자열',
    description: 'JSON 구조를 확인하고 문자열 안에 감싼 값을 다음 단계에서 이어서 풉니다.',
    examples: ['{"local":true,"count":47}', '["one","two"]', '"escaped\\ntext"'],
  },
  hex: {
    label: '16진수 바이트',
    description: '구분 문자나 0x 접두사가 있는 짝수 길이 16진수 바이트를 확인합니다.',
    examples: ['0x48656c6c6f', '41 42 43 44', 'de:ad:be:ef'],
  },
  url: {
    label: 'URL / 퍼센트 인코딩 / 검색 조건',
    description: '네트워크 요청 없이 URL, 검색 조건과 퍼센트로 바꾼 문자를 확인합니다.',
    examples: ['https://example.invalid/path?q=local', 'a=1&b=two', 'hello%20world'],
  },
  epoch: {
    label: '유닉스 시간',
    description: '숫자 길이와 날짜 범위를 바탕으로 초·밀리초·마이크로초·나노초 단위를 좁힙니다.',
    examples: ['1735689600', '1735689600000', '1735689600000000000'],
  },
  'uuid-ulid': {
    label: 'UUID와 ULID 식별값',
    description: 'UUID 종류와 버전, UUID v7 시간 또는 ULID 정렬 시간을 확인합니다.',
    examples: [
      '123e4567-e89b-42d3-a456-426614174000',
      '01890f2e-9b8a-7cc2-98fc-000000000001',
      '01ARZ3NDEKTSV4RRFFQ69G5FAV',
    ],
  },
  compression: {
    label: 'gzip / zlib / deflate 압축',
    description: '크기와 압축비 제한 안에서 압축을 풀고 나온 값을 다음 단계에서 이어서 확인합니다.',
    examples: [
      '사용자가 고른 .gz 파일',
      'gzip 시작 표식 1f 8b',
      '올바른 머리글이 있는 zlib 데이터',
    ],
  },
} as const satisfies Record<string, DetectorCopy>

export function localizeDetectorSpec(locale: Locale, spec: DetectorSpec): DetectorSpec {
  if (locale !== 'ko') return spec
  const copy = koreanDetectorCopy[spec.detector as keyof typeof koreanDetectorCopy]
  return copy ? { ...spec, ...copy } : spec
}

export const koreanDetectorIds = Object.freeze(Object.keys(koreanDetectorCopy))
