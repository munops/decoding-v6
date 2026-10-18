import { redactSecrets } from '@decoding/engine'
export function outputText(value: unknown): string {
  if (value instanceof Uint8Array)
    return [...value].map((byte) => byte.toString(16).padStart(2, '0')).join(' ')
  if (typeof value === 'string') return redactSecrets(value)
  try {
    return redactSecrets(JSON.stringify(value, null, 2))
  } catch {
    return String(value)
  }
}
