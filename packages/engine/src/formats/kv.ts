import type { Detector } from '../types'
import { inputText } from '../utils'
import { found, sensitiveKey, warning } from './common'
export const kv: Detector = {
  id: 'kv',
  detect(input) {
    const text = inputText(input).trim(),
      cookie = /^(Set-Cookie|Cookie):\s*(.*)$/is.exec(text)
    if (!cookie && /^[A-Za-z0-9+/_-]+={1,2}$/.test(text)) return null
    if (!cookie && !/^[?]?[\w.%+-]+=[^\n]*(?:&[^\n]*)?$/.test(text)) return null
    const entries = cookie
      ? (cookie[2] ?? '').split(';').map((x) => {
          const i = x.indexOf('=')
          return [x.slice(0, i < 0 ? undefined : i).trim(), i < 0 ? '' : x.slice(i + 1)] as const
        })
      : [...new URLSearchParams(text.replace(/^\?/, ''))]
    const values = entries.map(([key, value]) => ({
      name: key || '(empty name)',
      value: sensitiveKey.test(key) ? '[redacted]' : value,
    }))
    const warnings =
      cookie?.[1]?.toLowerCase() === 'set-cookie'
        ? ['Secure', 'HttpOnly', 'SameSite']
            .filter(
              (flag) => !new RegExp(`(?:^|;)\\s*${flag}(?:[=;]|$)`, 'i').test(cookie[2] ?? ''),
            )
            .map((flag) =>
              warning(`COOKIE-NO-${flag.toUpperCase()}`, `Set-Cookie is missing ${flag}.`),
            )
        : []
    const inner = cookie ? entries[0]?.[1] : entries.find(([, v]) => v.split('.').length === 3)?.[1]
    return found(
      'kv',
      cookie ? 'Cookie header' : 'Query string',
      { entries: values },
      cookie ? 0.999 : 0.97,
      { warnings, ...(inner ? { decoded: inner } : {}) },
    )
  },
}
export const env: Detector = {
  id: 'env',
  detect(input) {
    const lines = inputText(input)
      .trim()
      .split(/\r?\n/)
      .filter((x) => x.trim() && !/^\s*#/.test(x))
    if (!lines.length || !lines.every((x) => /^\s*(?:export\s+)?[A-Za-z_][\w]*\s*=/.test(x)))
      return null
    const entries = lines.map((x) => {
      const match = /^\s*(?:export\s+)?([\w]+)\s*=\s*([\s\S]*)$/.exec(x)!
      const key = match[1]!,
        raw = match[2]!.replace(/^(['"])([\s\S]*)\1$/, '$2')
      return { name: key, value: sensitiveKey.test(key) ? '[redacted]' : raw }
    })
    return found('env', '.env / key=value', { entries }, lines.length === 1 ? 0.72 : 0.995)
  },
}
