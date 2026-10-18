import { useEffect, useState } from 'preact/hooks'
import type { Locale } from '../i18n/catalog'
export default function UpdateBanner({ locale }: { locale: Locale }) {
  const [available, setAvailable] = useState(false)
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    let hadController = !!navigator.serviceWorker.controller
    const changed = () => {
      if (hadController && navigator.onLine) setAvailable(true)
      hadController = true
    }
    navigator.serviceWorker.addEventListener('controllerchange', changed)
    return () => navigator.serviceWorker.removeEventListener('controllerchange', changed)
  }, [])
  return available ? (
    <div class="update-banner" role="status">
      <p>
        {locale === 'ko'
          ? '새 버전이 있어요. 필요한 결과를 복사한 뒤 새로고침해 주세요.'
          : 'A new version is available. Copy any result you need before refreshing.'}
      </p>
      <button class="button secondary" type="button" onClick={() => location.reload()}>
        {locale === 'ko' ? '새로고침' : 'Refresh'}
      </button>
      <button class="button ghost" type="button" onClick={() => setAvailable(false)}>
        {locale === 'ko' ? '나중에' : 'Later'}
      </button>
    </div>
  ) : null
}
