import { encodeBase64, type ChainNode } from '@decoding/engine'
import { linearChain } from './reproduce-commands'
export function canReencode(root: ChainNode): { allowed: boolean; reason: string } {
  const ids = linearChain(root).flatMap((n) => (n.selected ? [n.selected.detector] : []))
  const blocked = ids.find((id) => !['json', 'base64', 'hex', 'url', 'jwt'].includes(id))
  return blocked
    ? {
        allowed: false,
        reason: `${blocked}: this layer cannot be reversed with the same encoding settings.`,
      }
    : { allowed: ids.length > 0, reason: ids.length ? '' : 'No selected chain.' }
}
export function reencode(root: ChainNode, edited: string): { text: string; unsignedJwt: boolean } {
  const gate = canReencode(root)
  if (!gate.allowed) throw new Error(gate.reason)
  let text = edited,
    unsignedJwt = false
  for (const node of linearChain(root).reverse()) {
    const id = node.selected?.detector
    if (id === 'json') {
      text = JSON.stringify(JSON.parse(text))
    } else if (id === 'base64') text = encodeBase64(new TextEncoder().encode(text))
    else if (id === 'hex')
      text = Array.from(new TextEncoder().encode(text), (b) =>
        b.toString(16).padStart(2, '0'),
      ).join('')
    else if (id === 'url') text = encodeURIComponent(text)
    else if (id === 'jwt') {
      const value = JSON.parse(text) as { header?: Record<string, unknown>; payload?: unknown }
      const header = { ...value.header, alg: 'none' }
      text = `${encodeBase64(new TextEncoder().encode(JSON.stringify(header)), true)}.${encodeBase64(new TextEncoder().encode(JSON.stringify(value.payload ?? value)), true)}.`
      unsignedJwt = true
    }
  }
  return { text, unsignedJwt }
}
export function maskSensitiveFields(value: unknown, depth = 0): unknown {
  if (depth > 12) return '[depth limited]'
  if (Array.isArray(value)) return value.map((v) => maskSensitiveFields(v, depth + 1))
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        /secret|token|password|authorization|cookie|private|signature|api.?key|session/i.test(key)
          ? '[redacted]'
          : maskSensitiveFields(item, depth + 1),
      ]),
    )
  return value
}
