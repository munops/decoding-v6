import type { ChainNode, DecodeResult, Detection } from '@decoding/engine'
import { formatEngineMessage, presentDetection } from './engine-copy'
/** CLI v6 compatibility boundary; native engine records contain codes and facts. */
export function toLegacyDetection(detection: Detection) {
  const { diagnostics, ...display } = presentDetection(detection, 'en')
  let value = display.value
  if (diagnostics?.length) {
    value = structuredClone(value)
    for (const diagnostic of detection.diagnostics ?? []) {
      let target = value as Record<string | number, unknown>
      for (const key of diagnostic.path.slice(0, -1))
        target = target[key] as Record<string | number, unknown>
      const key = diagnostic.path.at(-1)
      if (key !== undefined) target[key] = formatEngineMessage(diagnostic.message, 'en', detection)
    }
  }
  return {
    ...display,
    value,
    warnings: display.warnings.map((warning, index) => ({
      ...warning,
      message:
        detection.warnings[index]?.message.code === 'warning-text-lost' ||
        detection.warnings[index]?.message.code === 'warning-text-maybe-lost'
          ? 'TEXT-LOST'
          : warning.message,
    })),
  }
}
export function toLegacyNode(node: ChainNode): unknown {
  const { selected, ...rest } = node
  return {
    ...rest,
    candidates: node.candidates.map(toLegacyDetection),
    ...(selected ? { selected: toLegacyDetection(selected) } : {}),
    children: node.children.map(toLegacyNode),
  }
}
export function toLegacyResult(result: DecodeResult) {
  return { ...result, root: toLegacyNode(result.root) }
}
