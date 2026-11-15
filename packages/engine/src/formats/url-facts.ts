import { safeName } from '../message-facts'
import { unicodeDomain } from './punycode'
import type { LintWarning } from '../types'
import { decodeBase64, inputText } from '../utils'
const tracking = /^(?:utm_.+|fbclid|gclid|dclid|msclkid|igshid|mc_eid|mc_cid)$/i
export function inspectUrl(url: URL) {
  const clean = new URL(url.href)
  if (clean.password) clean.password = '[redacted]'
  const warnings: LintWarning[] = []
  const add = (ruleId: string, severity: LintWarning['severity'] = 'warning') =>
    warnings.push({
      ruleId,
      severity,
      message: { code: 'warning-url', params: { rule: safeName(ruleId) } },
    })
  let trackingCount = 0
  for (const key of new Set(clean.searchParams.keys())) {
    if (tracking.test(key)) {
      trackingCount += clean.searchParams.getAll(key).length
      clean.searchParams.delete(key)
    }
  }
  try {
    if (/[\p{Script=Cyrillic}\p{Script=Greek}]/u.test(unicodeDomain(url.hostname)))
      add('IDN-CONFUSABLE')
  } catch {
    /* Invalid labels remain in the original URL. */
  }
  if (url.protocol === 'http:') add('URL-NO-TLS')
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(url.hostname) || url.hostname.startsWith('['))
    add('URL-IP-HOST')
  if (url.username || url.password) add('URL-USERINFO')
  if (
    [...url.searchParams].some(
      ([key, value]) => /^(?:name|full.?name|email|phone|mobile|address)$/i.test(key) && value,
    )
  )
    add('URL-PERSONAL')
  if (url.protocol === 'otpauth:' && url.searchParams.has('secret')) {
    add('OTP-SECRET', 'danger')
    clean.searchParams.set('secret', '[redacted]')
  }
  let redirect: string | undefined
  for (const [, raw] of [...url.searchParams].slice(0, 64)) {
    if (raw.length > 16384) continue
    let value = raw
    if (!/^https?:\/\//i.test(value) && /^[A-Za-z0-9+/_-]+={0,2}$/.test(value)) {
      const bytes = decodeBase64(value)
      if (bytes) value = inputText(bytes)
    }
    if (!/^https?:\/\//i.test(value)) continue
    try {
      const inner = new URL(value)
      if (inner.href === url.href) continue
      redirect = inner.href
      if (inner.host !== url.host) add('URL-REDIRECT')
      break
    } catch {
      /* A query value is not necessarily a complete address. */
    }
  }
  return { clean, warnings, redirect, trackingCount }
}
