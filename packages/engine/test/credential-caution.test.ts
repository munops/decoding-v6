import { expect, it } from 'vitest'
import { detect, encodeBase64 } from '../src/index'
const now = new Date('2026-11-15T00:00:00Z')
const token = (exp?: number) => {
  const part = (value: unknown) =>
    encodeBase64(new TextEncoder().encode(JSON.stringify(value)), true)
  return `${part({ alg: 'RS256' })}.${part({ sub: 'synthetic', ...(exp === undefined ? {} : { exp }) })}.c3ludGhldGlj`
}
it('warns for possibly live tokens without claiming validity, but not expired JWTs', async () => {
  for (const exp of [undefined, now.getTime() / 1000 + 1]) {
    const jwt = (await detect(token(exp), { now })).find((x) => x.detector === 'jwt')!
    expect(jwt.warnings.some((x) => x.ruleId === 'CREDENTIAL-NO-PASTE')).toBe(true)
  }
  const jwt = (await detect(token(now.getTime() / 1000), { now })).find(
    (x) => x.detector === 'jwt',
  )!
  expect(jwt.warnings.some((x) => x.ruleId === 'JWT-EXPIRED')).toBe(true)
  expect(jwt.warnings.some((x) => x.ruleId === 'CREDENTIAL-NO-PASTE')).toBe(false)
})
it('warns for auth headers and private keys without exposing their contents', async () => {
  for (const [text, id] of [
    ['Bearer synthetic-credential', 'auth-header'],
    ['Basic dXNlcjpwYXNz', 'auth-header'],
    ['-----BEGIN PRIVATE KEY-----\nc3ludGhldGlj\n-----END PRIVATE KEY-----', 'pem'],
  ]) {
    const found = (await detect(text!)).find((x) => x.detector === id)!
    expect(found.warnings.some((x) => x.ruleId === 'CREDENTIAL-NO-PASTE')).toBe(true)
  }
})
