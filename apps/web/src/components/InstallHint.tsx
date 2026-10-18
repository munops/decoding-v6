import { useEffect, useState } from 'preact/hooks'
import type { Locale } from '../i18n/catalog'
type InstallEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: string }>
}
export default function InstallHint({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false),
    [prompt, setPrompt] = useState<InstallEvent | null>(null),
    [guide, setGuide] = useState(false)
  useEffect(() => {
    if (matchMedia('(display-mode: standalone)').matches) return
    try {
      const visits = Number(localStorage.getItem('decoding-visits') ?? '0') + 1
      localStorage.setItem('decoding-visits', String(visits))
      setVisible(visits >= 3 && localStorage.getItem('decoding-install-dismissed') !== 'true')
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
      <h3>
        {locale === 'ko' ? '다음에는 홈 화면에서 바로 열어요.' : 'Keep it on your home screen.'}
      </h3>
      <button
        class="button secondary"
        type="button"
        onClick={() => {
          if (prompt) void prompt.prompt()
          else setGuide(true)
        }}
      >
        {locale === 'ko' ? '홈 화면에 추가' : 'Add to Home Screen'}
      </button>
      {guide ? (
        <ol>
          <li>
            {locale === 'ko'
              ? 'Safari에서 공유 버튼을 눌러요.'
              : 'In Safari, tap the Share button.'}
          </li>
          <li>{locale === 'ko' ? '홈 화면에 추가를 선택해요.' : 'Choose Add to Home Screen.'}</li>
          <li>{locale === 'ko' ? '추가를 눌러요.' : 'Tap Add.'}</li>
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
        {locale === 'ko' ? '닫기' : 'Dismiss'}
      </button>
    </section>
  )
}
