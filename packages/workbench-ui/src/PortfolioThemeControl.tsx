import { useEffect, useRef, useState } from 'preact/hooks'

export function PortfolioThemeControl() {
  const ref = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof matchMedia !== 'function') return
    const query = matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => { setReduced(query.matches); if (query.matches) { ref.current?.pause(); setPlaying(false) } }
    sync(); query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])
  const toggle = async () => { const audio = ref.current; if (!audio || reduced) return; if (audio.paused) { await audio.play(); setPlaying(true) } else { audio.pause(); setPlaying(false) } }
  const mute = () => { const audio = ref.current; if (!audio) return; audio.muted = !audio.muted; setMuted(audio.muted) }
  return <section class="panel" aria-label="결과 음악"><audio ref={ref} src="/audio/portfolio-theme.mp3" preload="none" loop onPause={() => setPlaying(false)} /><p><strong>로컬 결과 음악</strong> · 입력과 결과는 음악 재생 중에도 기기 밖으로 전송되지 않습니다.</p><button class="button small" type="button" onClick={() => void toggle()} disabled={reduced}>{playing ? '음악 일시정지' : '음악 재생'}</button><button class="button small secondary" type="button" onClick={mute} aria-pressed={muted}>{muted ? '음소거 해제' : '음소거'}</button><p aria-live="polite">{reduced ? '동작 줄이기 설정으로 음악을 멈췄습니다.' : muted ? '음소거 상태입니다.' : playing ? '음악 재생 중입니다.' : '음악이 꺼져 있습니다.'}</p></section>
}
