export type WorkspaceTtl = 'session' | '24h' | '7d' | 'keep'

export type WorkspaceRecord = {
  id: string
  name: string
  note: string
  format: string
  structure: unknown
  ruleIds: string[]
  createdAt: string
  expiresAt: string | null
}

const DATABASE = 'decoding-local-workspace'
const STORE = 'redacted-records'
const VERSION = 1
const SESSION_KEY = 'decoding-tab-records'
function tabRecords(): WorkspaceRecord[] {
  const raw = sessionStorage.getItem(SESSION_KEY)
  return raw ? (JSON.parse(raw) as WorkspaceRecord[]) : []
}
function finish(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onabort = transaction.onerror = () =>
      reject(new Error('Local workspace transaction failed.'))
  })
}
const sensitiveKey =
  /(?:secret|token|password|passwd|authorization|cookie|private|signature|api[-_]?key|session)/i

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, VERSION)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () =>
      reject(request.error ?? new Error('Unable to open the local workspace.'))
  })
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Local workspace operation failed.'))
  })
}

export function redactStructure(value: unknown, depth = 0): unknown {
  if (depth > 12) return '[depth limited]'
  if (Array.isArray(value))
    return value.slice(0, 100).map((item) => redactStructure(item, depth + 1))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .slice(0, 200)
        .map(([key, item]) => [
          key,
          sensitiveKey.test(key) ? '[redacted]' : redactStructure(item, depth + 1),
        ]),
    )
  }
  if (value === null) return null
  if (typeof value === 'boolean') return '[boolean]'
  if (typeof value === 'number') return '[number]'
  if (typeof value === 'string') return '[string]'
  return `[${typeof value}]`
}

function expiry(ttl: WorkspaceTtl): string | null {
  if (ttl === 'keep' || ttl === 'session') return null
  const milliseconds = ttl === '24h' ? 86_400_000 : 604_800_000
  return new Date(Date.now() + milliseconds).toISOString()
}

export async function listWorkspaceRecords(): Promise<WorkspaceRecord[]> {
  const database = await openDatabase()
  const transaction = database.transaction(STORE, 'readwrite')
  const store = transaction.objectStore(STORE)
  const completed = finish(transaction)
  const records = await requestResult(store.getAll() as IDBRequest<WorkspaceRecord[]>)
  const now = Date.now()
  const active: WorkspaceRecord[] = []
  for (const record of records) {
    if (record.expiresAt && Date.parse(record.expiresAt) <= now) store.delete(record.id)
    else active.push(record)
  }
  await completed
  database.close()
  return [...active, ...tabRecords()].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  )
}

export async function saveWorkspaceRecord(input: {
  name: string
  note: string
  format: string
  structure: unknown
  ruleIds: string[]
  ttl: WorkspaceTtl
}): Promise<WorkspaceRecord> {
  const record: WorkspaceRecord = {
    id: crypto.randomUUID(),
    name: input.name.trim().slice(0, 100),
    note: input.note.trim().slice(0, 2_000),
    format: input.format.trim().slice(0, 80),
    structure: redactStructure(input.structure),
    ruleIds: input.ruleIds
      .map((rule) => rule.trim())
      .filter(Boolean)
      .slice(0, 50),
    createdAt: new Date().toISOString(),
    expiresAt: expiry(input.ttl),
  }
  if (input.ttl === 'session') {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([record, ...tabRecords()]))
    return record
  }
  const database = await openDatabase()
  const transaction = database.transaction(STORE, 'readwrite')
  const completed = finish(transaction)
  transaction.objectStore(STORE).put(record)
  await completed
  database.close()
  return record
}

export async function deleteWorkspaceRecord(id: string): Promise<void> {
  const tab = tabRecords()
  if (tab.some((record) => record.id === id)) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(tab.filter((record) => record.id !== id)))
    return
  }
  const database = await openDatabase()
  const transaction = database.transaction(STORE, 'readwrite')
  const completed = finish(transaction)
  transaction.objectStore(STORE).delete(id)
  await completed
  database.close()
}

export async function clearWorkspace(): Promise<void> {
  sessionStorage.removeItem(SESSION_KEY)
  const database = await openDatabase()
  const transaction = database.transaction(STORE, 'readwrite')
  const completed = finish(transaction)
  transaction.objectStore(STORE).clear()
  await completed
  database.close()
}

export async function workspaceUsage(): Promise<{ usage: number | null; quota: number | null }> {
  const estimate = await navigator.storage?.estimate()
  return { usage: estimate?.usage ?? null, quota: estimate?.quota ?? null }
}

export async function updateWorkspaceRecord(
  id: string,
  changes: { name: string; note: string },
): Promise<void> {
  const name = changes.name.trim().slice(0, 100),
    note = changes.note.trim().slice(0, 2000)
  if (!name) throw new Error('Name is required')
  const tab = tabRecords()
  if (tab.some((record) => record.id === id)) {
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify(tab.map((record) => (record.id === id ? { ...record, name, note } : record))),
    )
    return
  }
  const database = await openDatabase(),
    transaction = database.transaction(STORE, 'readwrite'),
    completed = finish(transaction),
    store = transaction.objectStore(STORE)
  const request = store.get(id)
  request.onsuccess = () => {
    const record = request.result as WorkspaceRecord | undefined
    if (!record) {
      transaction.abort()
      return
    }
    store.put({ ...record, name, note })
  }
  await completed
  database.close()
}

/** Version 1/store remain unchanged so existing persistent records also open after rollback. */
export async function importWorkspaceRecords(records: WorkspaceRecord[]): Promise<number> {
  const database = await openDatabase(),
    transaction = database.transaction(STORE, 'readwrite'),
    completed = finish(transaction),
    store = transaction.objectStore(STORE)
  let added = 0
  const request = store.getAllKeys()
  request.onsuccess = () => {
    const ids = new Set(request.result.map(String))
    for (const record of records) {
      if (ids.has(record.id) || (record.expiresAt && Date.parse(record.expiresAt) <= Date.now()))
        continue
      store.put(record)
      ids.add(record.id)
      added++
    }
  }
  await completed
  database.close()
  return added
}
