import { useEffect, useRef, useState } from 'preact/hooks'
import type { PortfolioThemeMessages } from './messages'

export function PortfolioThemeControl({ messages }: { messages: PortfolioThemeMessages }) {
  const ref = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      setReduced(query.matches)
      if (query.matches) {
        ref.current?.pause()
        setPlaying(false)
      }
    }
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])
  const toggle = async () => {
    const audio = ref.current
    if (!audio || reduced) return
    if (audio.paused) {
      await audio.play()
      setPlaying(true)
    } else {
      audio.pause()
      setPlaying(false)
    }
  }
  const mute = () => {
    const audio = ref.current
    if (!audio) return
    audio.muted = !audio.muted
    setMuted(audio.muted)
  }
  return (
    <section class="panel" aria-label={messages.ariaLabel}>
      <audio
        ref={ref}
        src="/audio/portfolio-theme.mp3"
        preload="none"
        loop
        onPause={() => setPlaying(false)}
      />
      <p>
        <strong>{messages.title}</strong> · {messages.privacy}
      </p>
      <button class="button small" type="button" onClick={() => void toggle()} disabled={reduced}>
        {playing ? messages.pause : messages.play}
      </button>
      <button class="button small secondary" type="button" onClick={mute} aria-pressed={muted}>
        {muted ? messages.unmute : messages.mute}
      </button>
      <p aria-live="polite">
        {reduced
          ? messages.reduced
          : muted
            ? messages.muted
            : playing
              ? messages.playing
              : messages.off}
      </p>
    </section>
  )
}
