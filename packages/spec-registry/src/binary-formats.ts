import type { DetectorSpec } from './index'
export const binarySpecs: DetectorSpec[] = [
  [
    'data-uri',
    'Data URI',
    '데이터 URI',
    [
      'data:text/plain;base64,SGVsbG8=',
      'data:application/json;base64,eyJvayI6dHJ1ZX0=',
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/a0kAAAAASUVORK5CYII=',
    ],
    'https://www.rfc-editor.org/rfc/rfc2397',
  ],
  [
    'zstd',
    'Zstandard',
    'Zstandard 압축',
    [
      'data:application/zstd;base64,KLUv/SANaQAAeyJmaXh0dXJlIjowfQ==',
      'data:application/zstd;base64,KLUv/SANaQAAeyJmaXh0dXJlIjoxfQ==',
      'data:application/zstd;base64,KLUv/SANaQAAeyJmaXh0dXJlIjoyfQ==',
    ],
    'https://www.rfc-editor.org/rfc/rfc8878',
  ],
  [
    'msgpack',
    'MessagePack candidate',
    'MessagePack 후보',
    [
      'data:application/msgpack;base64,gaFhAQ==',
      'data:application/msgpack;base64,gaFiAg==',
      'data:application/msgpack;base64,kQE=',
    ],
    'https://github.com/msgpack/msgpack/blob/master/spec.md',
  ],
  [
    'cbor',
    'CBOR',
    'CBOR 구조',
    [
      'data:application/cbor;base64,2dn3oWFhAQ==',
      'data:application/cbor;base64,2dn3oWFiAg==',
      'data:application/cbor;base64,2dn3ggEC',
    ],
    'https://www.rfc-editor.org/rfc/rfc8949',
  ],
  [
    'protobuf',
    'Protobuf wire candidate',
    '스키마 없는 Protobuf 후보',
    [
      'data:application/protobuf;base64,CJYB',
      'data:application/protobuf;base64,EgNmb28=',
      'data:application/protobuf;base64,CAESAWY=',
    ],
    'https://protobuf.dev/programming-guides/encoding/',
  ],
  [
    'saml',
    'SAML response',
    'SAML 응답',
    [
      '<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"><saml:Issuer>fixture</saml:Issuer></saml:Assertion>',
      '<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"><saml:Audience>example.invalid</saml:Audience></saml:Assertion>',
      '<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"></samlp:Response>',
    ],
    'https://docs.oasis-open.org/security/saml/v2.0/',
  ],
  [
    'toml',
    'TOML',
    'TOML 구조',
    [
      '[package]\nname = "fixture"\nversion = "1.0.0"',
      '[server]\nport = 8080',
      '[database]\nlocal = true',
    ],
    'https://toml.io/en/v1.0.0',
  ],
  [
    'magic-bytes',
    'File signature',
    '파일 시작 표식',
    [
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/a0kAAAAASUVORK5CYII=',
      'data:application/pdf;base64,JVBERi0xLjcK',
      'data:application/zip;base64,UEsDBAoAAAA=',
    ],
    'https://www.iana.org/assignments/media-types/media-types.xhtml',
  ],
].map((row) => {
  const [id, label, koreanLabel, examples, url] = row as [string, string, string, string[], string]
  return {
    detector: id,
    slug: id,
    label,
    description: `Inspect ${label} locally. Binary candidates without unique signatures remain explicitly uncertain.`,
    examples,
    references: [{ title: `${label} specification`, url }],
    koreanLabel,
  }
})
