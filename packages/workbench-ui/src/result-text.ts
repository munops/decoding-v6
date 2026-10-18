export function outputText(value: unknown): string {
  if (value instanceof Uint8Array)
    return [...value].map((byte) => byte.toString(16).padStart(2, '0')).join(' ')
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}
