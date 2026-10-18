import type { PublicFixture } from './index'
const bytes = (s: string) => new TextEncoder().encode(s)
const png = Uint8Array.from(
  atob(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/a0kAAAAASUVORK5CYII=',
  ),
  (c) => c.charCodeAt(0),
)
const factories: Record<string, (i: number) => string | Uint8Array> = {
  'data-uri': (i) => `data:text/plain;base64,${btoa(`fixture-${i}`)}`,
  zstd: (i) => {
    const content = bytes(JSON.stringify({ fixture: i })),
      n = (content.length << 3) | 1
    return new Uint8Array([
      0x28,
      0xb5,
      0x2f,
      0xfd,
      0x20,
      content.length,
      n & 255,
      n >> 8,
      0,
      ...content,
    ])
  },
  msgpack: (i) => new Uint8Array([0x81, 0xa1, 0x61, i]),
  cbor: (i) => new Uint8Array([0xd9, 0xd9, 0xf7, 0xa1, 0x61, 0x61, ...(i < 24 ? [i] : [0x18, i])]),
  protobuf: (i) => new Uint8Array([8, i, 0x12, 3, 0x66, 0x6f, 0x6f]),
  saml: (i) =>
    `<saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"><saml:Issuer>fixture-${i}</saml:Issuer></saml:Assertion>`,
  toml: (i) => `[package]\nname = "fixture-${i}"\nversion = "1.0.0"`,
  'magic-bytes': (i) => new Uint8Array([...png, ...bytes(`fixture-${i}`)]),
}
export const binaryFixtures: PublicFixture[] = Object.entries(factories).flatMap(
  ([detector, make]) => [
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `${detector}-positive-${i + 1}`,
      detector,
      class: 'positive' as const,
      input: make(i),
    })),
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `${detector}-edge-${i + 1}`,
      detector,
      class: 'edge' as const,
      input: make(i + 20),
    })),
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `${detector}-negative-${i + 1}`,
      detector,
      class: 'negative' as const,
      input: bytes(`not a ${detector} fixture ${i} !?`),
    })),
  ],
)
