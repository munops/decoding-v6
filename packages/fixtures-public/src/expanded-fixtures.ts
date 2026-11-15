import type { PublicFixture } from './index'
export function publicCases(
  detector: string,
  positive: (string | Uint8Array)[],
  edge: (string | Uint8Array)[],
  negative: (string | Uint8Array)[],
): PublicFixture[] {
  return (
    [
      ['positive', positive],
      ['edge', edge],
      ['negative', negative],
    ] as const
  ).flatMap(([kind, values]) =>
    values.map((input, index) => ({
      id: `${detector}-${kind}-${index + 1}`,
      detector,
      input,
      class: kind,
    })),
  )
}
const binary = (text: string) =>
  [...new TextEncoder().encode(text)].map((byte) => byte.toString(2).padStart(8, '0')).join(' ')
export const expandedFixtures: PublicFixture[] = [
  ...publicCases(
    'binary-bytes',
    [
      'Hello',
      '한글',
      '日本語',
      '中文',
      '🙂',
      'café',
      'é',
      '안녕하세요',
      'A B',
      'line\ntext',
      '{"ok":true}',
      'https://example.test',
      '1234',
      '값',
      '파일.txt',
      'ABC',
      'one\ttwo',
      'हिन्दी',
      'Привет',
      'مرحبا',
    ].map(binary),
    [
      '0b00000000',
      '0b11111111',
      '00000000 00000001',
      '11111111 11111110',
      '0100000101000010',
      '01000001\n01000010',
      ' 01000001 01000010 ',
      '0b01000001 0b01000010',
      '00000000 00000000',
      '11110000 10011111 10011001 10000010',
    ],
    [
      '0',
      '1',
      '0100000',
      '010000012',
      '01000001 0100000',
      '0b100000000',
      '0o101',
      '101 102',
      'SGVsbG8=',
      '48656c6c6f',
      '#ff8800',
      'hello world',
      '한글 문장',
      'Bonjour le monde',
      '1234567890',
      '2026-11-15',
      '10.0.0.0/8',
      '10000000000000000',
      '0b0100000X',
      '0100 0001',
    ],
  ),
]
