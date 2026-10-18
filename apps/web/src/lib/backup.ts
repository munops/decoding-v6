import { importWorkspaceRecords, listWorkspaceRecords, type WorkspaceRecord } from './workspace'
const KEYS = [
  'decoding-theme',
  'decoding-locale',
  'decoding-favorite-tools',
  'decoding-recent-tools',
  'decoding-time-zone',
  'decoding-count-optout',
  'decoding-copy-feedback',
  'decoding-install-dismissed',
] as const
export type Backup = {
  version: 1
  product: 'decoding-v6'
  records: WorkspaceRecord[]
  settings: Record<string, string>
}
function structure(value: unknown, depth = 0): unknown {
  if (depth > 12) return '[depth limited]'
  if (Array.isArray(value)) return value.slice(0, 100).map((v) => structure(v, depth + 1))
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 200)
        .map(([key, item]) => [
          key,
          /token|secret|password|key|cookie|authorization|session|private|signature/i.test(key)
            ? '[redacted]'
            : structure(item, depth + 1),
        ]),
    )
  if (value === null) return null
  return typeof value === 'string' &&
    /^\[(?:redacted|string|number|boolean|undefined|object|depth limited)\]$/.test(value)
    ? value
    : `[${typeof value}]`
}
export function parseBackup(text: string): Backup {
  if (text.length > 10 * 1024 * 1024) throw new Error('Backup size limit')
  const parsed = JSON.parse(text) as Partial<Backup>
  if (
    parsed.version !== 1 ||
    parsed.product !== 'decoding-v6' ||
    !Array.isArray(parsed.records) ||
    parsed.records.length > 5000 ||
    !parsed.settings ||
    typeof parsed.settings !== 'object' ||
    Array.isArray(parsed.settings)
  )
    throw new Error('Invalid backup format')
  const records: WorkspaceRecord[] = [],
    seen = new Set<string>()
  for (const raw of parsed.records) {
    if (
      !raw ||
      typeof raw !== 'object' ||
      typeof raw.id !== 'string' ||
      raw.id.length > 100 ||
      typeof raw.name !== 'string' ||
      !raw.name.trim() ||
      raw.name.length > 100 ||
      typeof raw.note !== 'string' ||
      raw.note.length > 2000 ||
      typeof raw.format !== 'string' ||
      raw.format.length > 80 ||
      !Array.isArray(raw.ruleIds) ||
      raw.ruleIds.length > 50 ||
      !('structure' in raw) ||
      !raw.ruleIds.every(
        (rule) => typeof rule === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(rule),
      ) ||
      !Number.isFinite(Date.parse(raw.createdAt)) ||
      (raw.expiresAt !== null && !Number.isFinite(Date.parse(raw.expiresAt)))
    )
      throw new Error('Invalid backup record')
    if (seen.has(raw.id)) throw new Error('Duplicate backup ID')
    seen.add(raw.id)
    records.push({
      id: raw.id,
      name: raw.name,
      note: raw.note,
      format: raw.format,
      ruleIds: raw.ruleIds,
      createdAt: raw.createdAt,
      expiresAt: raw.expiresAt,
      structure: structure(raw.structure),
    })
  }
  const settings: Record<string, string> = {}
  for (const [key, value] of Object.entries(parsed.settings)) {
    if (
      !KEYS.includes(key as (typeof KEYS)[number]) ||
      typeof value !== 'string' ||
      value.length > 10000
    )
      throw new Error('Invalid backup setting')
    if (
      (key === 'decoding-theme' && !['light', 'dark'].includes(value)) ||
      (key === 'decoding-time-zone' && !['UTC', 'local'].includes(value)) ||
      (['decoding-count-optout', 'decoding-install-dismissed'].includes(key) &&
        !['true', 'false'].includes(value))
    )
      throw new Error('Invalid setting choice')
    if (key.endsWith('-tools')) {
      const ids: unknown = JSON.parse(value)
      if (
        !Array.isArray(ids) ||
        ids.length > 100 ||
        !ids.every((id) => typeof id === 'string' && /^[a-z0-9-]{1,80}$/.test(id))
      )
        throw new Error('Invalid tool settings')
    }
    if (key === 'decoding-copy-feedback') {
      const feedback: unknown = JSON.parse(value)
      if (
        !feedback ||
        typeof feedback !== 'object' ||
        Array.isArray(feedback) ||
        !('enabled' in feedback) ||
        typeof feedback.enabled !== 'boolean' ||
        !('volume' in feedback) ||
        typeof feedback.volume !== 'number' ||
        !Number.isFinite(feedback.volume) ||
        feedback.volume < 0 ||
        feedback.volume > 1 ||
        Object.keys(feedback).some((k) => !['enabled', 'volume'].includes(k))
      )
        throw new Error('Invalid copy preferences')
    }
    settings[key] = value
  }
  return { version: 1, product: 'decoding-v6', records, settings }
}
export async function exportBackup(): Promise<Backup> {
  const settings: Record<string, string> = {}
  for (const key of KEYS) {
    const value = localStorage.getItem(key)
    if (value !== null) settings[key] = value
  }
  return { version: 1, product: 'decoding-v6', records: await listWorkspaceRecords(), settings }
}
export async function restoreBackup(text: string): Promise<number> {
  const backup = parseBackup(text)
  const before = new Map(
    Object.keys(backup.settings).map((key) => [key, localStorage.getItem(key)]),
  )
  try {
    for (const [key, value] of Object.entries(backup.settings)) localStorage.setItem(key, value)
    return await importWorkspaceRecords(backup.records)
  } catch (error) {
    for (const [key, value] of before) {
      if (value === null) localStorage.removeItem(key)
      else localStorage.setItem(key, value)
    }
    throw error
  }
}
