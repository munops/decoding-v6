export const COPY_FEEDBACK_STORAGE_KEY = 'decoding-copy-feedback'

export type CopyFeedbackPreferences = {
  enabled: boolean
  volume: number
}

export const DEFAULT_COPY_FEEDBACK: CopyFeedbackPreferences = Object.freeze({
  enabled: true,
  volume: 0.3,
})

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

type AudioParamLike = {
  setValueAtTime: (value: number, startTime: number) => void
  linearRampToValueAtTime: (value: number, endTime: number) => void
}

type AudioNodeLike = { connect: (destination: unknown) => unknown }

type AudioContextLike = {
  currentTime: number
  destination: unknown
  resume?: () => Promise<void>
  createGain: () => AudioNodeLike & { gain: AudioParamLike }
  createOscillator: () => AudioNodeLike & {
    frequency: AudioParamLike
    type: OscillatorType
    start: (when: number) => void
    stop: (when: number) => void
  }
}

export type CopyFeedbackEnvironment = {
  storage?: StorageLike | null
  reducedMotion?: () => boolean
  createAudioContext?: () => AudioContextLike | undefined
}

function clampVolume(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : DEFAULT_COPY_FEEDBACK.volume
}

function browserStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

let browserAudioContext: AudioContextLike | undefined

function createBrowserAudioContext(): AudioContextLike | undefined {
  if (browserAudioContext) return browserAudioContext
  if (typeof window === 'undefined') return undefined
  const audioWindow = window as Window & { webkitAudioContext?: typeof AudioContext }
  const AudioContextConstructor =
    typeof AudioContext === 'undefined' ? audioWindow.webkitAudioContext : AudioContext
  if (!AudioContextConstructor) return undefined
  browserAudioContext = new AudioContextConstructor() as unknown as AudioContextLike
  return browserAudioContext
}

function environmentStorage(environment?: CopyFeedbackEnvironment): StorageLike | null {
  return environment?.storage === undefined ? browserStorage() : environment.storage
}

export function readCopyFeedback(environment?: CopyFeedbackEnvironment): CopyFeedbackPreferences {
  const storage = environmentStorage(environment)
  if (!storage) return { ...DEFAULT_COPY_FEEDBACK }
  try {
    const value: unknown = JSON.parse(storage.getItem(COPY_FEEDBACK_STORAGE_KEY) ?? '')
    if (!value || typeof value !== 'object') return { ...DEFAULT_COPY_FEEDBACK }
    const record = value as Partial<CopyFeedbackPreferences>
    return {
      enabled: typeof record.enabled === 'boolean' ? record.enabled : DEFAULT_COPY_FEEDBACK.enabled,
      volume: clampVolume(record.volume),
    }
  } catch {
    return { ...DEFAULT_COPY_FEEDBACK }
  }
}

export function writeCopyFeedback(
  preference: CopyFeedbackPreferences,
  environment?: CopyFeedbackEnvironment,
): CopyFeedbackPreferences {
  const normalized = {
    enabled: Boolean(preference.enabled),
    volume: clampVolume(preference.volume),
  }
  const storage = environmentStorage(environment)
  if (!storage) return normalized
  try {
    storage.setItem(COPY_FEEDBACK_STORAGE_KEY, JSON.stringify(normalized))
  } catch {
    // Storage denial is intentionally a visual-only fallback.
  }
  return normalized
}

export async function playCopyFeedback(
  preference: CopyFeedbackPreferences,
  environment: CopyFeedbackEnvironment = {},
): Promise<'played' | 'visual-only'> {
  if (!preference.enabled || (environment.reducedMotion ?? prefersReducedMotion)())
    return 'visual-only'
  const context = (environment.createAudioContext ?? createBrowserAudioContext)()
  if (!context) return 'visual-only'
  try {
    await context.resume?.()
    const start = context.currentTime
    for (const [frequency, offset] of [
      [523.25, 0],
      [659.25, 0.055],
    ] as const) {
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const peak = preference.volume * 0.055
      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency, start + offset)
      gain.gain.setValueAtTime(0, start + offset)
      gain.gain.linearRampToValueAtTime(peak, start + offset + 0.012)
      gain.gain.linearRampToValueAtTime(0.0001, start + offset + 0.11)
      oscillator.connect(gain)
      gain.connect(context.destination)
      oscillator.start(start + offset)
      oscillator.stop(start + offset + 0.12)
    }
    return 'played'
  } catch {
    return 'visual-only'
  }
}
