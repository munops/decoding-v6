import { decodeBase64 } from '../utils'
export const credentialPatterns = [
  /\bAKIA[A-Z0-9]{16}\b/g,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,
  /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
  /\bsk_(?:live|test)_[A-Za-z0-9]{12,}\b/g,
  /\bxox[baprs]-[A-Za-z0-9-]{12,}\b/g,
  /\bAIza[A-Za-z0-9_-]{20,}\b/g,
]
export function redactSecrets(text: string): string {
  let masked = text
  for (const pattern of credentialPatterns)
    masked = masked.replace(pattern, (token) => `${token.slice(0, 4)}[redacted]`)
  masked = masked.replace(
    /-----BEGIN (?:[A-Z ]*PRIVATE KEY)-----[\s\S]*?-----END (?:[A-Z ]*PRIVATE KEY)-----/g,
    '[private key redacted]',
  )
  masked = masked.replace(/\b[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]*/g, (value) => {
    try {
      const bytes = decodeBase64(value.split('.')[0]!)
      if (!bytes) return value
      const header = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
      return header && typeof header === 'object' && typeof header.alg === 'string'
        ? '[token redacted]'
        : value
    } catch {
      return value
    }
  })
  masked = masked.replace(/(https?:\/\/[^\s:/]+:)[^@\s]+@/gi, '$1[redacted]@')
  return masked.replace(/otpauth:\/\/[^\s"'<>]+/gi, (value) => {
    try {
      const url = new URL(value)
      for (const key of new Set(url.searchParams.keys()))
        if (/^secret$/i.test(key)) url.searchParams.set(key, '[redacted]')
      return url.href
    } catch {
      return 'otpauth:[redacted]'
    }
  })
}

export function maskCredentialFields(value: unknown, depth = 0): unknown {
  if (depth > 12) return '[depth limited]'
  if (Array.isArray(value))
    return value.slice(0, 200).map((item) => maskCredentialFields(item, depth + 1))
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 200)
        .map(([key, item]) => [
          key,
          /secret|token|password|passwd|authorization|cookie|private|signature|credential|api.?key|session/i.test(
            key,
          )
            ? '[redacted]'
            : maskCredentialFields(item, depth + 1),
        ]),
    )
  return typeof value === 'string' ? redactSecrets(value.slice(0, 2_000_000)) : value
}
