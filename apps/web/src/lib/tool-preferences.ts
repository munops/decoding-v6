/** Existing local preferences contain public tool IDs only, never input or output values. */
const FAVORITES = 'decoding-favorite-tools'
const RECENT = 'decoding-recent-tools'
const CHANGED = 'decoding:tool-preferences-changed'
const memory = new Map<string, string[]>()
const volatile = new Set<string>()
type SlugStorage = Pick<Storage, 'getItem' | 'setItem'>

function browserStorage(): SlugStorage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage
  } catch {
    return undefined
  }
}

function clean(value: unknown, validIds: readonly string[], limit = validIds.length): string[] {
  const valid = new Set(validIds)
  return Array.isArray(value)
    ? [
        ...new Set(value.filter((id): id is string => typeof id === 'string' && valid.has(id))),
      ].slice(0, limit)
    : []
}

function read(key: string, validIds: readonly string[], storage?: SlugStorage): string[] {
  if (volatile.has(key)) return clean(memory.get(key), validIds)
  try {
    const raw = storage?.getItem(key)
    return raw && raw.length <= 16_384 ? clean(JSON.parse(raw), validIds) : []
  } catch {
    return clean(memory.get(key), validIds)
  }
}

function write(key: string, ids: string[], storage?: SlugStorage): boolean {
  memory.set(key, ids)
  let persisted = false
  try {
    if (storage) {
      storage.setItem(key, JSON.stringify(ids))
      persisted = true
    }
  } catch {
    // Quota, denied storage and private-mode failures must not break a tool or link.
  }
  if (persisted) volatile.delete(key)
  else volatile.add(key)
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGED))
  return persisted
}

export function readToolPreferences(validIds: readonly string[], storage = browserStorage()) {
  return {
    favorites: read(FAVORITES, validIds, storage),
    recent: read(RECENT, validIds, storage).slice(0, 8),
    temporary: volatile.size > 0,
  }
}

export function toggleFavoriteTool(
  id: string,
  validIds: readonly string[],
  storage = browserStorage(),
) {
  const current = read(FAVORITES, validIds, storage)
  if (!validIds.includes(id)) return { ids: current, persisted: !volatile.has(FAVORITES) }
  const ids = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current]
  return { ids, persisted: write(FAVORITES, ids, storage) }
}

export function rememberOpenedTool(
  id: string,
  validIds: readonly string[],
  storage = browserStorage(),
): boolean {
  if (!validIds.includes(id)) return true
  const ids = [id, ...read(RECENT, validIds, storage).filter((item) => item !== id)].slice(0, 8)
  return write(RECENT, ids, storage)
}

export function clearToolPreferenceMemory(): void {
  memory.clear()
  volatile.clear()
}

export function subscribeToolPreferences(onChange: () => void): () => void {
  const cleared = () => {
    clearToolPreferenceMemory()
    onChange()
  }
  const stored = (event: StorageEvent) => {
    if (event.key === null || event.key === FAVORITES || event.key === RECENT) {
      clearToolPreferenceMemory()
      onChange()
    }
  }
  addEventListener(CHANGED, onChange)
  addEventListener('storage', stored)
  addEventListener('pageshow', onChange)
  addEventListener('decoding:settings-cleared', cleared)
  return () => {
    removeEventListener(CHANGED, onChange)
    removeEventListener('storage', stored)
    removeEventListener('pageshow', onChange)
    removeEventListener('decoding:settings-cleared', cleared)
  }
}
