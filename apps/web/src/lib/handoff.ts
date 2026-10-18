const KEY = 'decoding-handoff'
export function sendToTool(tool: string, text: string): void {
  if (!/^[a-z0-9-]+$/.test(tool)) return
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ tool, text, at: Date.now() }))
  } catch {
    /* The tool remains usable with its example and explicit paste. */
  }
  location.assign(`/${tool}/`)
}
export function takeHandoff(tool: string): string | undefined {
  try {
    const raw = sessionStorage.getItem(KEY)
    sessionStorage.removeItem(KEY)
    if (!raw) return
    const record = JSON.parse(raw) as { tool?: unknown; text?: unknown; at?: unknown }
    if (
      record.tool === tool &&
      typeof record.text === 'string' &&
      record.text.length <= 10 * 1024 * 1024 &&
      typeof record.at === 'number' &&
      Date.now() - record.at < 60000
    )
      return record.text
  } catch {
    /* Invalid or blocked storage never replaces the sample. */
  }
  return undefined
}
