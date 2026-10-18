import { useEffect, useState } from 'preact/hooks'
import {
  clearWorkspace,
  deleteWorkspaceRecord,
  listWorkspaceRecords,
  type WorkspaceRecord,
} from '../lib/workspace'
type Item = { key: string; bytes: number }
type CacheItem = { key: string; bytes: number | null; entries: number }
export default function DataManager() {
  const [local, setLocal] = useState<Item[]>([]),
    [session, setSession] = useState<Item[]>([]),
    [records, setRecords] = useState<WorkspaceRecord[]>([]),
    [cache, setCache] = useState<CacheItem[]>([]),
    [message, setMessage] = useState(''),
    [loading, setLoading] = useState(true)
  const read = async () => {
    setLoading(true)
    try {
      const rows = (storage: Storage) =>
        Object.keys(storage).map((key) => ({
          key,
          bytes: new TextEncoder().encode(key + (storage.getItem(key) ?? '')).length,
        }))
      setLocal(rows(localStorage))
      setSession(rows(sessionStorage))
      setRecords(await listWorkspaceRecords())
      const cachesList: CacheItem[] = []
      if ('caches' in window)
        for (const key of await caches.keys()) {
          const store = await caches.open(key),
            requests = await store.keys()
          let bytes: number | null = 0
          for (const request of requests) {
            const response = await store.match(request)
            if (!response || response.type === 'opaque') {
              bytes = null
              break
            }
            bytes += (await response.arrayBuffer()).byteLength
          }
          cachesList.push({ key, bytes, entries: requests.length })
        }
      setCache(cachesList)
    } catch {
      setMessage(
        'This browser blocked access to some local data. Unread stores are not reported as empty.',
      )
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void read()
  }, [])
  const act = (action: () => Promise<unknown>) =>
    void action().then(
      () => {
        setMessage('Local data changed.')
        return read()
      },
      () => setMessage('The browser blocked this deletion. Check the list before trying again.'),
    )
  return (
    <section class="data-manager">
      <p>Values are not displayed here. Sizes describe only data this page can read.</p>
      {loading ? <p role="status">Reading local stores…</p> : null}
      <h2>Device settings · localStorage</h2>
      {local.length ? (
        <ul>
          {local.map((item) => (
            <li key={item.key}>
              <code>{item.key}</code> · {item.bytes} B{' '}
              <button
                class="button ghost"
                type="button"
                onClick={() => {
                  localStorage.removeItem(item.key)
                  void read()
                }}
              >
                Delete setting
              </button>
            </li>
          ))}
        </ul>
      ) : !loading ? (
        <p>No readable device settings.</p>
      ) : null}
      <h2>This tab · sessionStorage</h2>
      <ul>
        {session.map((item) => (
          <li key={item.key}>
            <code>{item.key}</code> · {item.bytes} B{' '}
            <button
              class="button ghost"
              type="button"
              onClick={() => {
                sessionStorage.removeItem(item.key)
                void read()
              }}
            >
              Delete tab item
            </button>
          </li>
        ))}
      </ul>
      <h2>Saved redacted records</h2>
      <a href="/workspace/">Open and edit records</a>
      <ul>
        {records.map((record) => (
          <li key={record.id}>
            {record.name} · {record.format}{' '}
            <button
              class="button ghost"
              type="button"
              onClick={() => act(() => deleteWorkspaceRecord(record.id))}
            >
              Delete record
            </button>
          </li>
        ))}
      </ul>
      <h2>Offline caches</h2>
      <ul>
        {cache.map((item) => (
          <li key={item.key}>
            <code>{item.key}</code> · {item.entries} files ·{' '}
            {item.bytes === null ? 'size unavailable' : `${item.bytes} B`}{' '}
            <button
              class="button ghost"
              type="button"
              onClick={() => act(() => caches.delete(item.key))}
            >
              Delete cache
            </button>
          </li>
        ))}
      </ul>
      <button
        class="button danger"
        type="button"
        onClick={() => {
          if (
            !confirm(
              'Delete all settings, saved structures and offline caches for this site? Keep a backup first.',
            )
          )
            return
          act(async () => {
            await clearWorkspace()
            localStorage.clear()
            sessionStorage.clear()
            if ('caches' in window)
              await Promise.all((await caches.keys()).map((key) => caches.delete(key)))
            dispatchEvent(new Event('decoding:settings-cleared'))
          })
        }}
      >
        Delete all local data
      </button>
      <p role="status">{message}</p>
    </section>
  )
}
