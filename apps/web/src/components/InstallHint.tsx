import { uiMessage } from '@decoding/workbench-ui'
import { useEffect, useState } from 'preact/hooks'
import type { Locale } from '../i18n/catalog'
type InstallEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: string }>
}
export default function InstallHint({
  locale,
  alwaysShow = false,
}: {
  locale: Locale
  alwaysShow?: boolean
}) {
  const [visible, setVisible] = useState(false),
    [prompt, setPrompt] = useState<InstallEvent | null>(null),
    [guide, setGuide] = useState(false)
  useEffect(() => {
    if (matchMedia('(display-mode: standalone)').matches) return
    try {
      const visits = Number(localStorage.getItem('decoding-visits') ?? '0') + 1
      localStorage.setItem('decoding-visits', String(visits))
      setVisible(
        alwaysShow ||
          (visits >= 3 && localStorage.getItem('decoding-install-dismissed') !== 'true'),
      )
    } catch {
      /* Optional hint is skipped when storage is blocked. */
    }
    const listener = (event: Event) => {
      event.preventDefault()
      setPrompt(event as InstallEvent)
    }
    addEventListener('beforeinstallprompt', listener)
    return () => removeEventListener('beforeinstallprompt', listener)
  }, [])
  if (!visible) return null
  return (
    <section class="install-hint">
      <h3>{uiMessage(locale, 'keep_it_on_your_home_screen')}</h3>
      <button
        class="button secondary"
        type="button"
        onClick={() => {
          if (prompt) void prompt.prompt()
          else setGuide(true)
        }}
      >
        {uiMessage(locale, 'add_to_home_screen')}
      </button>
      {guide ? (
        <ol>
          <li>{uiMessage(locale, 'in_safari_tap_the_share_button')}</li>
          <li>{uiMessage(locale, 'choose_add_to_home_screen')}</li>
          <li>{uiMessage(locale, 'tap_add')}</li>
        </ol>
      ) : null}
      <button
        class="button ghost"
        type="button"
        onClick={() => {
          setVisible(false)
          try {
            localStorage.setItem('decoding-install-dismissed', 'true')
          } catch {
            /* This tab only. */
          }
        }}
      >
        {uiMessage(locale, 'dismiss')}
      </button>
    </section>
  )
}
