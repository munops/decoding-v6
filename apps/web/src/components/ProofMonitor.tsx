import { useEffect, useState } from 'preact/hooks'
import type { Locale } from '../i18n/catalog'
import { proofCopy } from '../i18n/proof'
import type { ProofObservation } from '../lib/proof-observation'
export default function ProofMonitor({
  locale,
  observer,
  ready,
  offline,
}: {
  locale: Locale
  observer: ProofObservation
  ready: boolean
  offline: 'waiting' | 'ready' | 'unavailable'
}) {
  const [state, setState] = useState(() => observer.snapshot()),
    copy = proofCopy(locale)
  useEffect(() => {
    const update = () => setState(observer.snapshot()),
      unsubscribe = observer.subscribe(update)
    update()
    const timer = setInterval(update, 1000)
    return () => {
      unsubscribe()
      clearInterval(timer)
    }
  }, [observer])
  const covered = Object.values(state.coverage).every(Boolean)
  const known =
    ready && state.running && state.inputKind === 'text' && !state.uninspected && covered
  const count = state.matches ? state.matches : known ? 0 : '—'
  return (
    <section class="proof-monitor" data-proof-state={known ? 'observing' : 'limited'}>
      <dl class="proof-counters">
        <div>
          <dt>{copy.outgoing}</dt>
          <dd>
            <output data-proof-matches aria-live="polite">
              {count}
            </output>
          </dd>
        </div>
        <div>
          <dt>{copy.time}</dt>
          <dd>
            <span data-proof-seconds aria-live="off">
              {state.seconds}
            </span>{' '}
            {copy.seconds}
          </dd>
        </div>
      </dl>
      {state.matches ? (
        <p class="notice warning" role="alert">
          {copy.concern}
        </p>
      ) : null}
      <p data-offline-ready={ready && offline === 'ready' ? 'true' : 'false'}>
        {!ready
          ? copy.preparing
          : offline === 'ready'
            ? copy.offlineReady
            : offline === 'waiting'
              ? copy.offlineWaiting
              : copy.offlineUnavailable}
      </p>
      <details>
        <summary>{copy.scope}</summary>
        <p>{copy.scopeBody}</p>
        <p>{copy.limits}</p>
        <p>{copy.inputScope}</p>
        <dl>
          <div>
            <dt>{copy.calls}</dt>
            <dd>{state.calls}</dd>
          </div>
          <div>
            <dt>{copy.resources}</dt>
            <dd>{state.resources}</dd>
          </div>
          <div>
            <dt>{copy.uninspected}</dt>
            <dd data-proof-uninspected>{state.uninspected}</dd>
          </div>
        </dl>
        {!covered || state.uninspected ? <p>{copy.limited}</p> : null}
        {state.inputKind !== 'text' ? <p>{copy.unknownInput}</p> : null}
      </details>
    </section>
  )
}
