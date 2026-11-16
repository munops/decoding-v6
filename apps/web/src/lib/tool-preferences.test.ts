import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearToolPreferenceMemory,
  readToolPreferences,
  rememberOpenedTool,
  toggleFavoriteTool,
} from './tool-preferences'

const ids = Array.from({ length: 20 }, (_, i) => `tool-${i}`)
function storage() {
  const data = new Map<string, string>()
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  }
}
beforeEach(clearToolPreferenceMemory)

describe('ID-only tool preferences', () => {
  it('restores more than twelve favorites after a fresh page', () => {
    const local = storage()
    for (const id of ids.slice(0, 15)) toggleFavoriteTool(id, ids, local)
    clearToolPreferenceMemory()
    expect(readToolPreferences(ids, local).favorites).toEqual(ids.slice(0, 15).reverse())
    toggleFavoriteTool('tool-4', ids, local)
    expect(readToolPreferences(ids, local).favorites).not.toContain('tool-4')
  })
  it('filters corrupt, duplicate, missing and payload-like entries', () => {
    const local = storage()
    local.data.set(
      'decoding-favorite-tools',
      JSON.stringify(['tool-1', 'tool-1', 'unknown', { input: 'secret' }, 'secret']),
    )
    expect(readToolPreferences(ids, local).favorites).toEqual(['tool-1'])
    local.data.set('decoding-favorite-tools', '{bad json')
    expect(readToolPreferences(ids, local).favorites).toEqual([])
    toggleFavoriteTool('input-secret', ids, local)
    expect(local.data.get('decoding-favorite-tools')).not.toContain('input-secret')
  })
  it('records opened tools in recency order, deduplicates and caps at eight IDs', () => {
    const local = storage()
    for (const id of ids) rememberOpenedTool(id, ids, local)
    rememberOpenedTool('tool-15', ids, local)
    expect(readToolPreferences(ids, local).recent).toEqual([
      'tool-15',
      'tool-19',
      'tool-18',
      'tool-17',
      'tool-16',
      'tool-14',
      'tool-13',
      'tool-12',
    ])
    expect([...local.data.values()].join('')).not.toContain('input')
  })
  it('keeps the current page usable when storage is denied or quota is exhausted', () => {
    const denied = {
      getItem: () => {
        throw new Error('denied')
      },
      setItem: () => {
        throw new Error('denied')
      },
    }
    expect(toggleFavoriteTool('tool-1', ids, denied).persisted).toBe(false)
    expect(rememberOpenedTool('tool-2', ids, denied)).toBe(false)
    expect(readToolPreferences(ids, denied)).toEqual({
      favorites: ['tool-1'],
      recent: ['tool-2'],
      temporary: true,
    })
    clearToolPreferenceMemory()
    const quota = {
      getItem: () => '[]',
      setItem: () => {
        throw new Error('quota')
      },
    }
    toggleFavoriteTool('tool-3', ids, quota)
    expect(readToolPreferences(ids, quota).favorites).toEqual(['tool-3'])
    clearToolPreferenceMemory()
    expect(readToolPreferences(ids, quota).favorites).toEqual([])
  })
})
