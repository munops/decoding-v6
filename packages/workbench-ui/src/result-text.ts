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

/** Known private keys and schema-less DER stay hidden, including ancestor byte views. */
export function privateKeyDetection(
  root: import('@decoding/engine').ChainNode,
): import('@decoding/engine').Detection | undefined {
  const own = [root.selected, ...root.candidates].find(
    (candidate) =>
      candidate?.detector === 'asn1-der' ||
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
  const protectedContent = privateKeyDetection(root)
  if (protectedContent) {
    const safe = { ...protectedContent }
    delete safe.decoded
    delete safe.metadata
    return safe
  }
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

/** Follow only the primary decoded branch; embedded fields are a different task. */
export function finalSelection(
  root: import('@decoding/engine').ChainNode,
): import('@decoding/engine').Detection | undefined {
  const privateKey = privateKeyDetection(root)
  if (privateKey) return privateKey
  let node = root
  const hasConfidentResult = (branch: import('@decoding/engine').ChainNode): boolean =>
    (branch.status === 'confident' && Boolean(branch.selected)) ||
    branch.children.some((child) => !child.sourcePath && hasConfidentResult(child))
  for (;;) {
    const child = node.children.find((item) => !item.sourcePath && item.selected)
    if (!child) break
    // A readable result is preferable to an extra, unconfirmed byte interpretation.
    // Recognized binary containers and their decoded descendants still take precedence.
    if (
      typeof node.selected?.decoded === 'string' &&
      child.status === 'ambiguous' &&
      child.selected?.decoded instanceof Uint8Array &&
      !hasConfidentResult(child)
    )
      break
    node = child
  }
  return node.selected ?? node.candidates[0]
}

export function displayValue(selected: import('@decoding/engine').Detection): unknown {
  return selected.detector === 'url' && typeof selected.metadata?.originalUrl === 'string'
    ? selected.metadata.originalUrl
    : selected.value
}

export function selectionNode(
  root: import('@decoding/engine').ChainNode,
  selected: import('@decoding/engine').Detection | undefined,
): import('@decoding/engine').ChainNode | undefined {
  return root.selected === selected || root.candidates.includes(selected!)
    ? root
    : root.children.map((child) => selectionNode(child, selected)).find(Boolean)
}

/** A reproducible primary prefix ends at the chosen result, never an embedded field. */
export function selectedPrimaryRoot(
  root: import('@decoding/engine').ChainNode,
  selected: import('@decoding/engine').Detection | null,
): import('@decoding/engine').ChainNode | undefined {
  if (!selected || privateKeyDetection(root)) return undefined
  if (root.selected === selected) return { ...root, children: [] }
  const child = root.children.find((node) => !node.sourcePath)
  const prefix = child ? selectedPrimaryRoot(child, selected) : undefined
  return prefix ? { ...root, children: [prefix] } : undefined
}
