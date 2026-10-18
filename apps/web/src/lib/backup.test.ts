import { afterEach, describe, expect, it, vi } from 'vitest'
import { parseBackup, restoreBackup } from './backup'
const record = {
  id: 'fixture',
  name: 'Fixture',
  note: 'Synthetic note',
  format: 'json',
  structure: { count: '[number]', token: 'unsafe_canary' },
  ruleIds: ['JWT-EXPIRED'],
  createdAt: '2026-10-17T00:00:00Z',
  expiresAt: null,
}
const backup = () => ({
  version: 1,
  product: 'decoding-v6',
  records: [record],
  settings: { 'decoding-theme': 'dark' },
})
afterEach(() => vi.unstubAllGlobals())
describe('backup admission before any write', () => {
  it('preserves redacted types while never importing raw scalar payloads', () => {
    expect(parseBackup(JSON.stringify(backup())).records[0]?.structure).toEqual({
      count: '[number]',
      token: '[redacted]',
    })
  })
  it('rejects unsupported versions, duplicate IDs, foreign settings and malformed records', () => {
    expect(() => parseBackup(JSON.stringify({ ...backup(), version: 2 }))).toThrow()
    expect(() => parseBackup(JSON.stringify({ ...backup(), records: [record, record] }))).toThrow()
    expect(() =>
      parseBackup(JSON.stringify({ ...backup(), settings: { 'foreign-key': 'raw' } })),
    ).toThrow()
    expect(() =>
      parseBackup(JSON.stringify({ ...backup(), records: [{ ...record, name: null }] })),
    ).toThrow()
    expect(() =>
      parseBackup(
        JSON.stringify({ ...backup(), settings: { 'decoding-favorite-tools': 'not JSON' } }),
      ),
    ).toThrow()
  })
  it('changes no storage when the file is invalid', async () => {
    const open = vi.fn(),
      setItem = vi.fn()
    vi.stubGlobal('indexedDB', { open })
    vi.stubGlobal('localStorage', { setItem })
    await expect(restoreBackup('{"version":2}')).rejects.toThrow()
    expect(open).not.toHaveBeenCalled()
    expect(setItem).not.toHaveBeenCalled()
  })
})
