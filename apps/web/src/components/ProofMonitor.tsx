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
          ? locale === 'ko'
            ? '로컬 판별기를 먼저 열고 있어요. 준비되면 네트워크를 끄고 아래에서 시험해 보세요.'
            : 'Opening the local decoder first. When ready, turn off the network and try below.'
          : supported
            ? `${paths.length} ${locale === 'ko' ? '이 페이지가 관측한 요청' : 'requests observed by this page'}`
            : locale === 'ko'
              ? '관측 API가 없어요. 개발자 도구 Network 탭이나 비행기 모드로 확인해 주세요.'
              : 'Observation API unavailable. Use developer tools Network or airplane mode.'}
      </p>
      <ul>
        {paths.map((path, i) => (
          <li key={i}>
            <code>{path}</code>
          </li>
        ))}
      </ul>
      <p>
        {locale === 'ko'
          ? '이 페이지가 볼 수 있는 요청만 보여요. 확실히 하려면 비행기 모드로 해 보세요. 이 페이지는 집계 이벤트를 보내지 않아요.'
          : 'This shows only requests the page can observe. For stronger confirmation, use airplane mode. This page sends no count events.'}
      </p>
    </section>
  )
}
