import type { ChainNode, DecodeResult, Detection } from '@decoding/engine'
export function withPhotoResult(
  result: DecodeResult,
  text: string,
  photo: { format: string; width: number; height: number },
): DecodeResult {
  const selected: Detection = {
    detector: 'magic-bytes',
    label: photo.format,
    confidence: 1,
    evidence: [{ code: 'photo-read', message: { code: 'photo-read' }, weight: 1 }],
    summary: { code: 'photo-read' },
    value: text,
    warnings: [],
    metadata: { photoRead: photo.format, width: photo.width, height: photo.height },
  }
  const descend = (node: ChainNode): ChainNode => ({
    ...node,
    id: `photo-${node.id}`,
    depth: node.depth + 1,
    children: node.children.map(descend),
  })
  return {
    ...result,
    nodes: result.nodes + 1,
    root: {
      id: 'photo',
      depth: 0,
      inputKind: 'bytes',
      inputSize: new TextEncoder().encode(text).length,
      candidates: [selected],
      selected,
      children: [descend(result.root)],
      status: 'confident',
    },
  }
}
