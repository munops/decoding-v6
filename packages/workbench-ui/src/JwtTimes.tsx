import type { Detection } from '@decoding/engine'
import { useState } from 'preact/hooks'
import { completionMessages } from './completion-messages'
import type { WorkbenchLocale } from './messages'
export function JwtTimes({ detection, locale }: { detection: Detection; locale: WorkbenchLocale }) {
  const [zone, setZone] = useState(() => {
    try {
      return localStorage.getItem('decoding-time-zone') === 'local' ? 'local' : 'UTC'
    } catch {
      return 'UTC'
    }
  })
  const value = detection.value as {
    payload?: Record<string, unknown>
    milliseconds?: unknown
  } | null
  const claims = value?.payload
    ? Object.entries(value.payload)
        .filter(([key, n]) => ['exp', 'iat', 'nbf'].includes(key) && typeof n === 'number')
        .map(([key, n]) => ({ key, ms: Number(n) * 1000 }))
    : typeof value?.milliseconds === 'number'
      ? [{ key: 'Unix', ms: value.milliseconds }]
      : []
  if (!claims.length) return null
  const copy = completionMessages[locale]
  return (
    <section class="claim-times">
      <label>
        {copy.zone}
        <select
          value={zone}
          onChange={(event) => {
            const next = event.currentTarget.value
            setZone(next)
            try {
              localStorage.setItem('decoding-time-zone', next)
            } catch {
              /* Tab-only preference. */
            }
          }}
        >
          <option value="UTC">UTC</option>
          <option value="local">{locale === 'ko' ? '내 시간대' : 'My time zone'}</option>
        </select>
      </label>
      {claims
        .filter((claim) => Number.isFinite(claim.ms) && Math.abs(claim.ms) <= 8.64e15)
        .map((claim) => (
          <p key={claim.key}>
            <code>{claim.key}</code> ·{' '}
            <time datetime={new Date(claim.ms).toISOString()}>
              {zone === 'UTC'
                ? new Date(claim.ms).toISOString()
                : new Date(claim.ms).toLocaleString(locale)}
            </time>{' '}
            ·{' '}
            {new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(
              Math.round((claim.ms - Date.now()) / 86400000),
              'day',
            )}
          </p>
        ))}
    </section>
  )
}
