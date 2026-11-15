import { uiMessage } from '@decoding/workbench-ui'
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
        {uiMessage(locale, 'a_new_version_is_available_copy_any_result_you_need_before_refres')}
      </p>
      <button class="button secondary" type="button" onClick={() => location.reload()}>
        {uiMessage(locale, 'refresh')}
      </button>
      <button class="button ghost" type="button" onClick={() => setAvailable(false)}>
        {uiMessage(locale, 'later')}
      </button>
    </div>
  ) : null
}
