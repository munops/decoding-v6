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
