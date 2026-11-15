import { expect, it } from 'vitest'
import { maskCredentialFields, encodeBase64 } from '../src'
it('redacts known credentials in scalar strings as well as secret-named fields', () => {
  const header = encodeBase64(new TextEncoder().encode('{\n "alg": "none"\n}'), true)
  const payload = encodeBase64(new TextEncoder().encode('{"sub":"synthetic"}'), true)
  const value = {
    visible: 'keep',
    count: 4,
    nested: { apiKey: 'RAW_CANARY' },
    free: `${header}.${payload}.signature`,
    otp: 'otpauth://totp/Synthetic?secret=FIRST_CANARY&secret=SECOND_CANARY',
    key: '-----BEGIN PRIVATE KEY-----\nSYNTHETIC_KEY_CANARY\n-----END PRIVATE KEY-----',
  }
  const masked = maskCredentialFields(value)
  expect(masked).toMatchObject({
    visible: 'keep',
    count: 4,
    nested: { apiKey: '[redacted]' },
    free: '[token redacted]',
    key: '[private key redacted]',
  })
  expect(JSON.stringify(masked)).not.toContain('CANARY')
})
it('preserves ordinary domains and prose', () => {
  expect(maskCredentialFields('www.example.com café 안녕하세요')).toBe(
    'www.example.com café 안녕하세요',
  )
})
it('uses the same credential names in URL queries and structured fields', () => {
  const value = maskCredentialFields({
    url: 'https://example.test/path?SID=FIRST_CANARY&SID=SECOND_CANARY&csrf=THIRD_CANARY&theme=light',
    outside: 'ordinary',
    csrf: 'FOURTH_CANARY',
  })
  expect(JSON.stringify(value)).not.toContain('CANARY')
  expect(value).toMatchObject({ outside: 'ordinary', csrf: '[redacted]' })
  expect(String((value as { url: string }).url)).toContain('theme=light')
  const ordinary = 'HTTPS://Example.test/path?theme=light'
  expect(maskCredentialFields(ordinary)).toBe(ordinary)
})
