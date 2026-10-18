/** NETWORK-ALLOWLIST-EXCEPTION: fixed event names only, no identifiers or content. */
export const COUNT_NAMES = [
  'app_open',
  'landing_view',
  'decode_completed',
  'decode_unsupported',
  'return_7d',
  'share_action',
  'sponsor_interest',
] as const
export type CountName = (typeof COUNT_NAMES)[number]
const SENT = new Set<CountName>()
let tabOptout = false

export function countingDisabled(): boolean {
  if (tabOptout) return true
  try {
    return localStorage.getItem('decoding-count-optout') === 'true'
  } catch {
    return false
  }
}

export function setCountingDisabled(disabled: boolean): boolean {
  tabOptout = disabled
  try {
    localStorage.setItem('decoding-count-optout', String(disabled))
    if (disabled) localStorage.removeItem('decoding-first-visit')
    return true
  } catch {
    return false
  }
}

export function countOpen(name: CountName): void {
  if (
    !COUNT_NAMES.includes(name) ||
    countingDisabled() ||
    location.pathname === '/proof/' ||
    SENT.has(name)
  )
    return
  SENT.add(name)
  try {
    void fetch('/e/events', {
      method: 'POST',
      credentials: 'omit',
      keepalive: true,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name }),
    }).catch(() => undefined)
  } catch {
    /* Counting never interrupts local work. */
  }
}

/** Date only, no ID. Fixed 13-month expiry, never extended on return. */
export function countReturn(now = new Date()): void {
  if (countingDisabled() || location.pathname === '/proof/') return
  try {
    const stored = localStorage.getItem('decoding-first-visit')
    const first = stored ? new Date(stored) : null
    const expiry = first ? new Date(first) : null
    expiry?.setUTCMonth(expiry.getUTCMonth() + 13)
    if (!first || !Number.isFinite(first.getTime()) || !expiry || now >= expiry) {
      localStorage.setItem('decoding-first-visit', now.toISOString().slice(0, 10))
      return
    }
    if (now.getTime() - first.getTime() >= 7 * 86400000) countOpen('return_7d')
  } catch {
    /* Storage may be blocked. No replacement identifier. */
  }
}
