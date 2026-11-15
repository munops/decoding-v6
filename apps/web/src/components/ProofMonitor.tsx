import { uiMessage } from '@decoding/workbench-ui'
import { useEffect, useState } from 'preact/hooks'
import type { Locale } from '../i18n/catalog'
export default function ProofMonitor({ locale }: { locale: Locale }) {
  const [ready, setReady] = useState(false),
    [paths, setPaths] = useState<string[]>([]),
    [supported, setSupported] = useState(true)
  useEffect(() => {
    let observer: PerformanceObserver | undefined
    const start = () => {
      setReady(true)
      setPaths([])
      if (!('PerformanceObserver' in window)) {
        setSupported(false)
        return
      }
      const from = performance.now()
      observer = new PerformanceObserver((list) => {
        const next = list
          .getEntries()
          .filter((entry) => entry.startTime >= from)
          .map((entry) => {
            try {
              return new URL(entry.name).pathname
            } catch {
              return 'local resource'
            }
          })
        if (next.length) setPaths((previous) => [...previous, ...next])
      })
      observer.observe({ type: 'resource', buffered: true })
    }
    addEventListener('decoding:proof-ready', start)
    return () => {
      removeEventListener('decoding:proof-ready', start)
      observer?.disconnect()
    }
  }, [])
  return (
    <section class="proof-monitor" aria-live="polite">
      <p>
        {!ready
          ? uiMessage(locale, 'opening_the_local_decoder_first_when_ready_turn_off_the_network_a')
          : supported
            ? `${paths.length} ${uiMessage(locale, 'requests_observed_by_this_page')}`
            : uiMessage(
                locale,
                'observation_api_unavailable_use_developer_tools_network_or_airpla',
              )}
      </p>
      <ul>
        {paths.map((path, i) => (
          <li key={i}>
            <code>{path}</code>
          </li>
        ))}
      </ul>
      <p>
        {uiMessage(locale, 'this_shows_only_requests_the_page_can_observe_for_stronger_confir')}
      </p>
    </section>
  )
}
