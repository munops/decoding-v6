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

/** Persist the whole observed chain, never raw input or private metadata. */
export function structureSelection(
  root: import('@decoding/engine').ChainNode,
  selected: import('@decoding/engine').Detection,
): import('@decoding/engine').Detection {
  const nodes = (
    node: import('@decoding/engine').ChainNode,
  ): import('@decoding/engine').ChainNode[] => [node, ...node.children.flatMap(nodes)]
  const chain = nodes(root)
  return {
    ...selected,
    value:
      chain.length === 1
        ? selected.value
        : {
            layers: chain
              .filter((node) => node.selected)
              .map((node) => ({ [node.selected!.detector]: node.selected!.value })),
          },
    warnings: chain
      .flatMap((node) => node.selected?.warnings ?? [])
      .filter((warning, i, all) => all.findIndex((item) => item.ruleId === warning.ruleId) === i),
  }
}
