import { maskCredentialFields, redactSecrets } from '@decoding/engine'
import {
  importWorkspaceRecords,
  listWorkspaceRecords,
  redactStructure,
  type WorkspaceRecord,
} from './workspace'
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
      (raw.valueMode !== undefined && !['structure', 'values'].includes(raw.valueMode)) ||
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
      name: redactSecrets(raw.name),
      note: redactSecrets(raw.note),
      format: raw.format,
      ruleIds: raw.ruleIds,
      createdAt: raw.createdAt,
      expiresAt: raw.expiresAt,
      valueMode: raw.valueMode === 'values' ? 'values' : 'structure',
      structure:
        raw.valueMode === 'values'
          ? maskCredentialFields(raw.structure)
          : redactStructure(raw.structure, 0, true),
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
export async function exportBackup(options?: { allowValues?: boolean }): Promise<Backup> {
  const settings: Record<string, string> = {}
  for (const key of KEYS) {
    const value = localStorage.getItem(key)
    if (value !== null) settings[key] = value
  }
  const records = await listWorkspaceRecords()
  if (records.some((record) => record.valueMode === 'values') && !options?.allowValues)
    throw new Error('VALUES-CONFIRMATION-REQUIRED')
  return { version: 1, product: 'decoding-v6', records, settings }
}
export async function restoreBackup(
  text: string,
  options?: { allowValues?: boolean },
): Promise<number> {
  const backup = parseBackup(text)
  if (backup.records.some((record) => record.valueMode === 'values') && !options?.allowValues)
    throw new Error('VALUES-CONFIRMATION-REQUIRED')
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
