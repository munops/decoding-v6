import { redactSecrets } from '@decoding/engine'
export function outputText(value: unknown): string {
  if (value instanceof Uint8Array)
    return [...value].map((byte) => byte.toString(16).padStart(2, '0')).join(' ')
  if (typeof value === 'string') return redactSecrets(value)
  try {
    return redactSecrets(
      JSON.stringify(value, (_key, item) => (typeof item === 'bigint' ? `${item}n` : item), 2),
    )
  } catch {
    return String(value)
  }
}

/** A detected private key stays hidden even when an ancestor decoded its raw bytes. */
export function privateKeyDetection(
  root: import('@decoding/engine').ChainNode,
): import('@decoding/engine').Detection | undefined {
  const own = [root.selected, ...root.candidates].find((candidate) =>
    candidate?.warnings.some((warning) => warning.ruleId === 'PRIVATE-KEY-EXPOSED'),
  )
  return own ?? root.children.map(privateKeyDetection).find(Boolean)
}

export function hasUnavailableParser(node: import('@decoding/engine').ChainNode): boolean {
  return (
    [node.selected, ...node.candidates].some((item) =>
      item?.warnings.some((warning) => warning.ruleId === 'LOCAL-PARSER-UNAVAILABLE'),
    ) || node.children.some(hasUnavailableParser)
  )
}
