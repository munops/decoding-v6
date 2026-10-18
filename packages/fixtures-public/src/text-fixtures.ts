import type { PublicFixture } from './index'
const bytes = (text: string) => new TextEncoder().encode(text)
const b64 = (input: Uint8Array) => btoa(Array.from(input, (b) => String.fromCharCode(b)).join(''))
const enc = (text: string) =>
  b64(bytes(text)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
function ssh(i: number): string {
  const type = bytes('ssh-ed25519'),
    raw = new Uint8Array(4 + type.length + 4 + 32)
  new DataView(raw.buffer).setUint32(0, type.length)
  raw.set(type, 4)
  new DataView(raw.buffer).setUint32(4 + type.length, 32)
  raw.fill(i & 255, 8 + type.length)
  return `ssh-ed25519 ${b64(raw)} fixture-${i}`
}
const factory: Record<string, (i: number) => string> = {
  'auth-header': (i) =>
    `Bearer ${enc('{"alg":"none"}')}.${enc(JSON.stringify({ sub: `fixture-${i}` }))}.`,
  datetime: (i) => `2026-10-${String((i % 28) + 1).padStart(2, '0')}T09:00:00+09:00`,
  'html-entities': (i) => `&#${65 + i}; &lt;fixture&gt;`,
  'unicode-escapes': (i) => `\\u${(65 + i).toString(16).padStart(4, '0')}`,
  pem: (i) =>
    `-----BEGIN PUBLIC KEY-----\n${b64(new Uint8Array([0x30, 0x2a, 0x30, 5, 6, 3, 0x2b, 0x65, 0x70, 3, 0x21, 0, ...Array(32).fill(i & 255)]))}\n-----END PUBLIC KEY-----`,
  'ssh-key': ssh,
  ip: (i) => `192.168.0.${i + 1}`,
  cron: (i) => `${i % 60} ${i % 24} * * *`,
  punycode: (i) => `xn--bcher-kva.example${i}.invalid`,
  mime: (i) => `=?UTF-8?B?${b64(bytes(`fixture ${i}: café`))}?=`,
  kv: (i) =>
    `Cookie: token=${enc('{"alg":"none"}')}.${enc(JSON.stringify({ fixture: i }))}.; Path=/`,
  env: (i) => `FIXTURE=${i}\nLOCAL=true\nAPI_TOKEN=synthetic`,
  base32: (i) => (i % 2 ? 'MZXW6YTBOI======' : 'JBSWY3DPEBLW64TMMQ======'),
  base58: (i) =>
    `StV1DL6CwTryKyV${'123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[i % 58]}`,
  ascii85: (i) => `<~${'z'.repeat(i + 1)}~>`,
  hash: (i) =>
    `$2b$${String(4 + (i % 20)).padStart(2, '0')}$${'A'.repeat(52)}${'./ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i % 28]}`,
  'secret-patterns': (i) => `ghp_syntheticfixture${String(i).padStart(20, '0')}`,
  jwe: (i) => `${enc(JSON.stringify({ alg: 'dir', enc: 'A256GCM', fixture: i }))}..aXY.YQ.dGFn`,
  'http-headers': (i) => `HTTP/1.1 200 OK\nContent-Type: text/plain\nX-Fixture: ${i}`,
  'dns-txt': (i) => `v=spf1 ip4:192.0.2.${i + 1} -all`,
  yaml: (i) => `name: fixture-${i}\nlocal: true\nitems:\n  - one\n  - two`,
  xml: (i) => `<fixture id="${i}"><local>true</local></fixture>`,
  'k8s-secret': (i) =>
    `apiVersion: v1\nkind: Secret\ndata:\n  user: ${b64(bytes(`fixture-${i}`))}\n  password: ${b64(bytes(`synthetic-${i}`))}\n  token: dG9rZW4=`,
  'json-deep': (i) =>
    JSON.stringify({ fixture: i, message: enc(`fixture ${i}: local encoded text`) }),
  'text-scan': (i) => `client 192.168.0.${i + 1} request https://example.invalid/${i} ended`,
  'pgp-armor': (i) =>
    `-----BEGIN PGP MESSAGE-----\n\n${b64(bytes(`synthetic armor ${i}`))}\n-----END PGP MESSAGE-----`,
}
export const completeTextFixtures: PublicFixture[] = Object.entries(factory).flatMap(
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
      input: ` \n${make(i + 20)}\n `,
    })),
    ...Array.from({ length: 20 }, (_, i) => ({
      id: `${detector}-negative-${i + 1}`,
      detector,
      class: 'negative' as const,
      input: `not ${detector} fixture ${i} !?`,
    })),
  ],
)
