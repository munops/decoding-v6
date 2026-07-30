import { describe, expect, it, vi } from 'vitest'
import {
  COPY_FEEDBACK_STORAGE_KEY,
  DEFAULT_COPY_FEEDBACK,
  playCopyFeedback,
  readCopyFeedback,
  writeCopyFeedback,
} from '../src/copy-feedback'

function memoryStorage() {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  }
}

function fakeAudioContext() {
  const starts: number[] = []
  const stops: number[] = []
  return {
    starts,
    stops,
    context: {
      currentTime: 10,
      destination: {},
      resume: vi.fn(async () => undefined),
      createGain: () => ({
        gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      }),
      createOscillator: () => ({
        frequency: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
        type: 'sine' as OscillatorType,
        connect: vi.fn(),
        start: (when: number) => starts.push(when),
        stop: (when: number) => stops.push(when),
      }),
    },
  }
}

describe('copy feedback', () => {
  it('uses and persists the local 0.3 default without any payload field', () => {
    const storage = memoryStorage()
    expect(readCopyFeedback({ storage })).toEqual(DEFAULT_COPY_FEEDBACK)
    expect(writeCopyFeedback({ enabled: false, volume: 3 }, { storage })).toEqual({
      enabled: false,
      volume: 1,
    })
    expect(JSON.parse(storage.getItem(COPY_FEEDBACK_STORAGE_KEY) ?? '{}')).toEqual({
      enabled: false,
      volume: 1,
    })
  })

  it('does not construct audio for disabled or reduced-motion feedback', async () => {
    const createAudioContext = vi.fn()
    await expect(
      playCopyFeedback({ enabled: false, volume: 0.3 }, { createAudioContext }),
    ).resolves.toBe('visual-only')
    await expect(
      playCopyFeedback(
        { enabled: true, volume: 0.3 },
        { createAudioContext, reducedMotion: () => true },
      ),
    ).resolves.toBe('visual-only')
    expect(createAudioContext).not.toHaveBeenCalled()
  })

  it('plays a bounded two-tone local confirmation only when requested', async () => {
    const audio = fakeAudioContext()
    await expect(
      playCopyFeedback(
        { enabled: true, volume: 0.3 },
        { createAudioContext: () => audio.context, reducedMotion: () => false },
      ),
    ).resolves.toBe('played')
    expect(audio.starts).toEqual([10, 10.055])
    expect(audio.stops[0]).toBeCloseTo(10.12)
    expect(audio.stops[1]).toBeCloseTo(10.175)
  })
})
