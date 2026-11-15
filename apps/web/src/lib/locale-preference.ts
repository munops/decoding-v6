const locales = ['en', 'ko', 'ja', 'zh-cn', 'es', 'pt-br', 'de', 'fr'] as const
export type HomeLocale = (typeof locales)[number]
const valid = (value: string | null): value is HomeLocale =>
  !!value && locales.includes(value as HomeLocale)
export function preferredHomeLocale({
  language,
  choice,
  seen,
  automatic,
  userAgent,
}: {
  language: string
  choice: string | null
  seen: boolean
  automatic: string | null
  userAgent: string
}): HomeLocale | undefined {
  if (
    /bot\b|crawler|spider|slurp|bingpreview|google-inspectiontool|facebookexternalhit|yeti\b|ads-naver\b|blueno\b/i.test(
      userAgent,
    )
  )
    return undefined
  if (valid(choice)) return choice
  if (seen) return valid(automatic) ? automatic : 'en'
  return /^ko(?:-|$)/i.test(language) ? 'ko' : 'en'
}
export function applyLocalePreference() {
  document.addEventListener('click', (event) => {
    const link =
      event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>('a[data-locale-choice]')
        : null
    const choice = link?.dataset.localeChoice
    if (!link || !choice || !valid(choice)) return
    try {
      localStorage.setItem('decoding-locale-choice', choice)
    } catch {
      if (choice === 'en' && new URL(link.href).pathname === '/') {
        event.preventDefault()
        location.assign('/?lang=en')
      }
    }
  })
  if (location.pathname !== '/') return
  let choice = new URLSearchParams(location.search).get('lang'),
    seen = false,
    automatic: string | null = null
  try {
    choice = valid(choice) ? choice : localStorage.getItem('decoding-locale-choice')
    seen = localStorage.getItem('decoding-home-seen') === '1'
    automatic = localStorage.getItem('decoding-home-locale')
  } catch {
    /* Stored preferences may be unavailable; explicit URL enum still works. */
  }
  const target = preferredHomeLocale({
    language: navigator.language,
    choice,
    seen,
    automatic,
    userAgent: navigator.userAgent,
  })
  if (!target) return
  try {
    if (valid(choice)) localStorage.setItem('decoding-locale-choice', choice)
    localStorage.setItem('decoding-home-seen', '1')
    localStorage.setItem('decoding-home-locale', target)
  } catch {
    /* No input values are stored here. */
  }
  if (target !== 'en') location.replace(`/${target}/${location.hash === '#share' ? '#share' : ''}`)
}
