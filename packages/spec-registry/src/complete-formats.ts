import type { DetectorSpec } from './index'
const rfc = (id: number) => `https://www.rfc-editor.org/rfc/rfc${id}`
export const completeTextSpecs: DetectorSpec[] = [
  [
    'auth-header',
    'Authorization header',
    '인증 헤더',
    [
      'Bearer eyJhbGciOiJub25lIn0.eyJzdWIiOiJmaXh0dXJlIn0.',
      'Authorization: Basic dXNlcjpwYXNz',
      'Basic ZGV2OnBhc3N3b3Jk',
    ],
    rfc(7235),
  ],
  [
    'datetime',
    'Date and time',
    '날짜와 시간',
    ['2026-10-17T09:00:00+09:00', '2025-01-01T00:00:00Z', 'Fri, 17 Oct 2025 09:00:00 +0900'],
    rfc(3339),
  ],
  [
    'html-entities',
    'HTML entities',
    'HTML 엔티티',
    ['&lt;b&gt;', '&#233;', '&amp;local=true'],
    'https://html.spec.whatwg.org/multipage/named-characters.html',
  ],
  [
    'unicode-escapes',
    'Unicode escapes',
    '유니코드 이스케이프',
    ['\\u00e9', '\\x41', '%u00e9'],
    'https://tc39.es/ecma262/#prod-UnicodeEscapeSequence',
  ],
  [
    'pem',
    'PEM certificate, key and CSR',
    'PEM 인증서·키·서명 요청',
    [
      '-----BEGIN PUBLIC KEY-----\nMAMCAQE=\n-----END PUBLIC KEY-----',
      '-----BEGIN PRIVATE KEY-----\nMAMCAQE=\n-----END PRIVATE KEY-----',
      '-----BEGIN CERTIFICATE REQUEST-----\nMAMCAQE=\n-----END CERTIFICATE REQUEST-----',
    ],
    rfc(7468),
  ],
  [
    'ssh-key',
    'OpenSSH public key',
    'OpenSSH 공개키',
    [
      'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEB fixture',
      'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC',
    ],
    rfc(4253),
  ],
  ['ip', 'IP address', 'IP 주소', ['192.168.0.1', '::1', '2001:db8::1'], rfc(4291)],
  [
    'cron',
    'Cron expression',
    'cron 실행 일정',
    ['*/5 * * * *', '0 9 * * MON-FRI', '0 */10 * * * *'],
    'https://man7.org/linux/man-pages/man5/crontab.5.html',
  ],
  [
    'punycode',
    'Punycode domain',
    '퓨니코드 도메인',
    ['xn--80ak6aa92e.com', 'xn--bcher-kva.de', 'xn--caf-dma.fr'],
    rfc(3492),
  ],
  [
    'mime',
    'MIME encoded words and quoted-printable',
    '메일 인코딩',
    ['=?UTF-8?B?SGVsbG8=?=', '=?UTF-8?Q?caf=C3=A9?=', 'caf=C3=A9'],
    rfc(2047),
  ],
  [
    'kv',
    'Query string and cookies',
    '쿼리 문자열·쿠키',
    [
      'Cookie: token=eyJhbGciOiJub25lIn0.eyJzdWIiOiJmaXh0dXJlIn0.',
      'Set-Cookie: session=example; Path=/',
      'name=fixture&local=true',
    ],
    rfc(6265),
  ],
  [
    'env',
    '.env key/value',
    '환경 변수',
    [
      'APP_NAME=fixture\nLOCAL=true',
      'export API_KEY=synthetic\nMODE=local',
      'PORT=3000\nHOST=localhost',
    ],
    'https://nodejs.org/api/environment_variables.html#dotenv',
  ],
  [
    'base32',
    'Base32',
    'Base32',
    ['MZXW6YTBOI======', 'JBSWY3DPEBLW64TMMQ======', 'MZXW6YTB'],
    rfc(4648),
  ],
  [
    'base58',
    'Base58 candidate',
    'Base58 후보',
    ['StV1DL6CwTryKyV', '2NEpo7TZRRrLZSi2U', 'JxF12TrwUP45BMd'],
    'https://github.com/bitcoin/bitcoin/blob/master/src/base58.cpp',
  ],
  [
    'ascii85',
    'Ascii85',
    'Ascii85',
    ['<~87cURD_*#TDfTZ)+T~>', '<~BOu!rDZ~>', '<~z~>'],
    'https://opensource.adobe.com/dc-acrobat-sdk-docs/pdfstandards/pdfreference1.7old.pdf',
  ],
  [
    'hash',
    'Hash identifier',
    '해시 종류 후보',
    [
      '$2b$12$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZabcde',
      'a'.repeat(64),
      '$argon2id$v=19$m=65536,t=3,p=4$c2FsdA$aGFzaA',
    ],
    rfc(9106),
  ],
  [
    'secret-patterns',
    'Secret-like credential',
    '비밀키 접두 패턴',
    [
      'AKIAABCDEFGHIJKLMNOP',
      'ghp_synthetic012345678901234567890',
      'sk_test_synthetic012345678901234567890',
    ],
    'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/about-authentication-to-github',
  ],
  [
    'jwe',
    'Encrypted JWE token',
    '암호화 JWE 토큰',
    [
      'eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..aXY.Y2lwaGVy.dGFn',
      'eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4R0NNIn0..aXY.YQ.dGFn',
      'eyJhbGciOiJSU0EtT0FFUCIsImVuYyI6IkEyNTZHQ00ifQ.a2V5.aXY.YQ.dGFn',
    ],
    rfc(7516),
  ],
  [
    'http-headers',
    'HTTP headers',
    'HTTP 헤더',
    [
      'HTTP/1.1 200 OK\nContent-Type: application/json\nContent-Length: 2',
      'GET / HTTP/1.1\nHost: example.invalid\nAccept: */*',
      'Content-Type: text/plain\nCache-Control: no-store',
    ],
    rfc(9110),
  ],
  [
    'dns-txt',
    'SPF, DMARC and DKIM',
    'SPF·DMARC·DKIM',
    [
      'v=spf1 ip4:192.0.2.0/24 -all',
      'v=DMARC1; p=none; rua=mailto:reports@example.invalid',
      'v=DKIM1; k=rsa; p=c3ludGhldGlj',
    ],
    rfc(7208),
  ],
  [
    'yaml',
    'YAML',
    'YAML 구조',
    ['name: fixture\nlocal: true', 'apiVersion: v1\nkind: Pod', '---\nitems:\n  - one\n  - two'],
    'https://yaml.org/spec/1.2.2/',
  ],
  [
    'xml',
    'XML',
    'XML 구조',
    [
      '<root><local>true</local></root>',
      '<?xml version="1.0"?><fixture id="1"/>',
      '<items><item>one</item><item>two</item></items>',
    ],
    'https://www.w3.org/TR/xml/',
  ],
  [
    'k8s-secret',
    'Kubernetes Secret',
    '쿠버네티스 Secret',
    [
      'apiVersion: v1\nkind: Secret\ndata:\n  user: dXNlcg==\n  password: cGFzcw==\n  token: dG9rZW4=',
      'apiVersion: v1\nkind: Secret\nstringData:\n  password: synthetic',
      'apiVersion: v1\nkind: Secret\ndata:\n  key: Zml4dHVyZQ==',
    ],
    'https://kubernetes.io/docs/concepts/configuration/secret/',
  ],
  [
    'json-deep',
    'Encoded JSON fields',
    'JSON 안의 인코딩',
    [
      '{"token":"eyJhbGciOiJub25lIn0.eyJzdWIiOiJmaXh0dXJlIn0."}',
      '{"message":"SGVsbG8gd29ybGQ="}',
      '{"url":"hello%20world"}',
    ],
    rfc(8259),
  ],
  [
    'text-scan',
    'Values inside a log line',
    '로그 안의 값',
    [
      'client 192.168.0.1 status ok',
      'request https://example.invalid/path ended',
      'trace 123e4567-e89b-42d3-a456-426614174000 done',
    ],
    rfc(8259),
  ],
  [
    'pgp-armor',
    'PGP armor',
    'PGP 블록',
    [
      '-----BEGIN PGP MESSAGE-----\n\naGVsbG8=\n-----END PGP MESSAGE-----',
      '-----BEGIN PGP SIGNATURE-----\n\naGVsbG8=\n-----END PGP SIGNATURE-----',
      '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nxgYEAAAAAAAB\n-----END PGP PUBLIC KEY BLOCK-----',
    ],
    rfc(9580),
  ],
].map((row) => {
  const [id, label, ko, examples, url] = row as [string, string, string, string[], string]
  return {
    detector: id,
    slug: id,
    label,
    description: `Inspect ${label} locally with syntax evidence and explicit limitations.`,
    examples,
    references: [{ title: `${label} specification`, url }],
    koreanLabel: ko,
  }
})
export const completeKoreanLabels = new Map(
  completeTextSpecs.map((spec) => [
    spec.detector,
    (spec as DetectorSpec & { koreanLabel: string }).koreanLabel,
  ]),
)
