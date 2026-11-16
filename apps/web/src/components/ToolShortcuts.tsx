import { useEffect, useState } from 'preact/hooks'
import type { Locale } from '../i18n/catalog'
import { toolNavigationCopy } from '../i18n/tool-navigation'
import { readToolPreferences, subscribeToolPreferences } from '../lib/tool-preferences'

export type ToolShortcut = { id: string; name: string }

export default function ToolShortcuts({
  tools,
  locale,
}: {
  tools: ToolShortcut[]
  locale: Locale
}) {
  const copy = toolNavigationCopy(locale),
    prefix = locale === 'en' ? '' : `/${locale}`
  const [favorites, setFavorites] = useState<string[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [temporary, setTemporary] = useState(false)
  useEffect(() => {
    const load = () => {
      const next = readToolPreferences(tools.map((tool) => tool.id))
      setFavorites(next.favorites)
      setRecent(next.recent)
      setTemporary(next.temporary)
    }
    load()
    return subscribeToolPreferences(load)
  }, [tools])
  const favoriteIds = favorites.slice(0, 6),
    recentIds = recent.filter((id) => !favoriteIds.includes(id)).slice(0, 4)
  if (!favoriteIds.length && !recentIds.length) return null
  const links = (ids: string[]) =>
    ids.map((id) => {
      const tool = tools.find((item) => item.id === id)
      return tool ? (
        <a key={id} href={`${prefix}/${tool.id}/`}>
          {tool.name}
        </a>
      ) : null
    })
  return (
    <section class="tool-shortcuts" aria-label={copy.all}>
      {favoriteIds.length ? (
        <div>
          <h2>{copy.favorites}</h2>
          <div class="recent-links">{links(favoriteIds)}</div>
        </div>
      ) : null}
      {recentIds.length ? (
        <div>
          <h2>{copy.recent}</h2>
          <div class="recent-links">{links(recentIds)}</div>
        </div>
      ) : null}
      <a class="shortcut-all" href={`${prefix}/tools/`}>
        {copy.all} <span aria-hidden="true">→</span>
      </a>
      {temporary ? <p role="status">{copy.unavailable}</p> : null}
    </section>
  )
}
