import type { OperationDescriptor } from '@decoding/operations'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { CatalogMessages, Locale } from '../i18n/catalog'
import { toolNavigationCopy } from '../i18n/tool-navigation'
import {
  readToolPreferences,
  subscribeToolPreferences,
  toggleFavoriteTool,
} from '../lib/tool-preferences'

const categoryGlyph: Record<string, string> = {
  format: '{ }',
  convert: '↔',
  inspect: '⌁',
  generate: '+',
  encode: '/%',
}

function categoryLabel(category: OperationDescriptor['category'], messages: CatalogMessages) {
  if (category === 'format') return messages.categoryFormat
  if (category === 'convert') return messages.categoryConvert
  if (category === 'inspect') return messages.categoryInspect
  if (category === 'generate') return messages.categoryGenerate
  return messages.categoryEncode
}

export default function ToolSearch({
  tools,
  messages,
  pathPrefix = '',
  locale = 'en',
}: {
  tools: OperationDescriptor[]
  messages: CatalogMessages
  pathPrefix?: string
  locale?: Locale
}) {
  const copy = toolNavigationCopy(locale)
  const [hydrated, setHydrated] = useState(false)
  const [query, setQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])
  const [recent, setRecent] = useState<string[]>([])
  const [temporary, setTemporary] = useState(false)
  const search = useRef<HTMLInputElement>(null)
  useEffect(() => {
    const load = () => {
      const preferences = readToolPreferences(tools.map((tool) => tool.id))
      setFavorites(preferences.favorites)
      setRecent(preferences.recent)
      setTemporary(preferences.temporary)
    }
    load()
    const unsubscribe = subscribeToolPreferences(load)
    setHydrated(true)
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        search.current?.focus()
      }
    }
    addEventListener('keydown', shortcut)
    return () => {
      removeEventListener('keydown', shortcut)
      unsubscribe()
    }
  }, [tools])

  const toggleFavorite = (id: string) => {
    const next = toggleFavoriteTool(
      id,
      tools.map((tool) => tool.id),
    )
    setFavorites(next.ids)
    setTemporary(!next.persisted)
  }
  const favoriteTools = favorites
    .map((id) => tools.find((tool) => tool.id === id))
    .filter((tool): tool is OperationDescriptor => Boolean(tool))
  const recentTools = recent
    .map((id) => tools.find((tool) => tool.id === id))
    .filter((tool): tool is OperationDescriptor => Boolean(tool))
  const visible = useMemo(() => {
    const term = query.trim().toLowerCase().replace(/\s/g, '')
    if (!term) return tools
    return tools.filter((tool) =>
      [tool.name, tool.description, tool.category, ...tool.aliases].some((value) =>
        value.toLowerCase().replace(/\s/g, '').includes(term),
      ),
    )
  }, [query, tools])
  const groups = useMemo(() => {
    const grouped = new Map<OperationDescriptor['category'], OperationDescriptor[]>()
    for (const tool of visible)
      grouped.set(tool.category, [...(grouped.get(tool.category) ?? []), tool])
    return grouped
  }, [visible])
  return (
    <div class="catalog-shell" data-hydrated={hydrated}>
      <label class="search-box">
        <span>{messages.searchLabel}</span>
        <input
          type="search"
          ref={search}
          value={query}
          onInput={(event) => setQuery(event.currentTarget.value)}
          placeholder={messages.searchPlaceholder}
          disabled={!hydrated}
        />
      </label>
      <p class="catalog-count" aria-live="polite">
        {visible.length} {messages.of} {tools.length} {messages.countSuffix}
      </p>
      {temporary ? (
        <p class="notice info" role="status">
          {copy.unavailable}
        </p>
      ) : null}
      {favoriteTools.length && !query ? (
        <section class="recent-tools" aria-labelledby="favorite-tools">
          <div class="section-heading compact">
            <h2 id="favorite-tools">{copy.favorites}</h2>
          </div>
          <div class="recent-links">
            {favoriteTools.map((tool) => (
              <a key={tool.id} href={`${pathPrefix}/${tool.id}/`}>
                {tool.name}
              </a>
            ))}
          </div>
        </section>
      ) : null}
      {recentTools.length && !query ? (
        <section class="recent-tools" aria-labelledby="recent-tools">
          <div class="section-heading compact">
            <span class="eyebrow">{messages.recentEyebrow}</span>
            <h2 id="recent-tools">{copy.recent}</h2>
          </div>
          <div class="recent-links">
            {recentTools.map((tool) => (
              <a href={`${pathPrefix}/${tool.id}/`} key={tool.id}>
                {tool.name}
              </a>
            ))}
          </div>
        </section>
      ) : null}
      {[...groups.entries()].map(([category, items]) => (
        <section class="tool-group" aria-labelledby={`category-${category}`} key={category}>
          <div class="section-heading compact">
            <span class="eyebrow">{messages.category}</span>
            <h2 id={`category-${category}`}>{categoryLabel(category, messages)}</h2>
          </div>
          <div class="tool-grid">
            {items.map((tool) => (
              <article class="tool-card" data-category={tool.category} key={tool.id}>
                <div class="tool-card-top">
                  <span class="tool-glyph" aria-hidden="true">
                    {categoryGlyph[tool.category] ?? tool.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div class="tool-card-actions">
                    <button
                      class="favorite-button"
                      type="button"
                      aria-label={`${favorites.includes(tool.id) ? messages.removeFavorite : messages.addFavorite}: ${tool.name}`}
                      aria-pressed={favorites.includes(tool.id)}
                      disabled={!hydrated}
                      onClick={() => toggleFavorite(tool.id)}
                    >
                      {favorites.includes(tool.id) ? '★' : '☆'}
                    </button>
                  </div>
                </div>
                <a class="tool-card-link" href={`${pathPrefix}/${tool.id}/`}>
                  <h3>{tool.name}</h3>
                  <p>{tool.description}</p>
                  <span class="card-link">{messages.open}</span>
                </a>
              </article>
            ))}
          </div>
        </section>
      ))}
      {!visible.length ? <div class="empty-catalog">{messages.empty}</div> : null}
    </div>
  )
}
