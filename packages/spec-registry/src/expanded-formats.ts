import type { DetectorSpec } from './index'
type ExpandedSpec = DetectorSpec & { korean: { label: string; description: string } }
export const expandedSpecs: ExpandedSpec[] = [
  {
    detector: 'binary-bytes',
    slug: 'binary-bytes',
    label: 'Binary byte notation',
    description:
      'Decode groups of eight binary digits as bytes, then interpret valid readable UTF-8. A continuous digit string remains uncertain: it may simply be a number.',
    korean: {
      label: '0과 1로 적은 바이트',
      description:
        '0과 1 여덟 개를 한 바이트로 보고 글자를 풀어요. 구분 없이 이어진 숫자는 보통의 번호일 수도 있어 확정하지 않아요.',
    },
    examples: [
      '01001000 01101001',
      '0b01000001',
      '11101101 10010101 10011100 11101010 10111000 10000000',
    ],
    references: [
      {
        title: 'ECMAScript — binary integer notation',
        url: 'https://tc39.es/ecma262/#sec-literals-numeric-literals',
      },
      { title: 'RFC 3629 — UTF-8', url: 'https://www.rfc-editor.org/rfc/rfc3629' },
    ],
  },
  {
    detector: 'octal-bytes',
    slug: 'octal-bytes',
    label: 'Octal byte notation',
    description:
      'Decode three octal digits per byte (000–377), optionally prefixed with 0o. Whitespace separates bytes. Continuous numbers remain uncertain. This is byte notation, not a Unix file permission reader.',
    korean: {
      label: '8진수로 적은 바이트',
      description:
        '000부터 377까지의 8진수 세 자리를 한 바이트로 풀어요. 0o 표기와 공백 구분을 읽어요. 이어진 숫자는 보통의 번호일 수도 있어요. 파일 접근 권한을 읽는 기능은 아니에요.',
    },
    examples: ['110 151', '0o101', '355 225 234 352 270 200'],
    references: [
      {
        title: 'ECMAScript — octal integer notation',
        url: 'https://tc39.es/ecma262/#sec-literals-numeric-literals',
      },
      { title: 'RFC 3629 — UTF-8', url: 'https://www.rfc-editor.org/rfc/rfc3629' },
    ],
  },
]
export const expandedKoreanCopy = new Map(expandedSpecs.map((spec) => [spec.detector, spec.korean]))
