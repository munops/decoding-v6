import { completionMessages } from './completion-messages'
import type { ChainNode, Detection } from '@decoding/engine'
import type { DecoderMessages } from './messages'
import { detectionLabel, limitReason, localizedDetection } from './detection-copy'
export function EvidenceList({
  detection,
  messages,
}: {
  detection: Detection
  messages: DecoderMessages
}) {
  const displayDetection = localizedDetection(detection, messages)
  return (
    <div class="evidence-stack">
      <div class="confidence-line">
        <span class="confidence-badge">{Math.round(displayDetection.confidence * 100)}%</span>
        <strong>{displayDetection.label}</strong>
      </div>
      <p>{displayDetection.summary}</p>
      <ul class="evidence-list">
        {displayDetection.evidence.map((evidence) => (
          <li key={evidence.code}>{evidence.message}</li>
        ))}
      </ul>
      {displayDetection.warnings.map((warning) => (
        <div class={`notice ${warning.severity}`} role="status" key={warning.ruleId}>
          <strong>
            <a href={`/rules/${warning.ruleId.toLowerCase()}/`}>{warning.ruleId}</a>
          </strong>
          <span>{warning.message}</span>
        </div>
      ))}
    </div>
  )
}

function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''))
}

function chainLabel(node: ChainNode, messages: DecoderMessages): string {
  if (node.selected) return detectionLabel(node.selected.label, messages)
  if (node.status === 'ambiguous') return messages.ambiguousStep
  if (node.status === 'limit') return messages.limitStep
  return messages.unsupportedStep
}

export function ChainStage({ node, messages }: { node: ChainNode; messages: DecoderMessages }) {
  const step = interpolate(messages.chainStep, { step: node.depth + 1 })
  const inputSize = interpolate(messages.inputSize, { size: node.inputSize.toLocaleString() })
  const label = chainLabel(node, messages)
  return (
    <div class="chain-stage" aria-label={`${step}: ${label}. ${inputSize}`}>
      <span class="chain-step-badge">{step}</span>
      <strong class="chain-detector-label">{label}</strong>
      <span class="chain-size-badge">{inputSize}</span>
    </div>
  )
}

type ChainViewProps = {
  node: ChainNode
  messages: DecoderMessages
  activeNodeId: string | null
  onActivate: (nodeId: string) => void
  onOverride?: (nodeId: string, format: string) => void
  rootSize?: number
  onKeyDown: (event: KeyboardEvent) => void
}

export function LayerBand({
  node,
  messages,
  activeNodeId,
  onActivate,
  onKeyDown,
  rootSize = node.inputSize,
  onOverride,
}: ChainViewProps) {
  return (
    <li
      class="chain-node"
      style={{
        '--depth': node.depth,
        '--layer': node.depth % 4,
        '--byte-width': `${Math.max(8, Math.min(100, (100 * node.inputSize) / Math.max(1, rootSize)))}%`,
      }}
      data-layer={node.depth % 4}
      role="treeitem"
      aria-level={node.depth + 1}
      aria-expanded={node.children.length ? true : undefined}
      tabIndex={activeNodeId === node.id ? 0 : -1}
      data-chain-node-id={node.id}
      onFocus={(event) => {
        event.stopPropagation()
        onActivate(node.id)
      }}
      onClick={(event) => {
        event.stopPropagation()
        onActivate(node.id)
      }}
      onKeyDown={onKeyDown}
    >
      {node.sourcePath ? <p class="layer-source-path">{node.sourcePath}</p> : null}
      <ChainStage node={node} messages={messages} />
      {node.selected ? <EvidenceList detection={node.selected} messages={messages} /> : null}
      {node.limitReason ? (
        <div class="notice warning" role="status">
          {messages.stopped}: {limitReason(node.limitReason, messages)}
        </div>
      ) : null}
      {onOverride ? (
        <label class="manual-format">
          {completionMessages[messages.locale].manual}
          <select
            value="automatic"
            onChange={(event) => onOverride(node.id, event.currentTarget.value)}
          >
            <option value="automatic">{completionMessages[messages.locale].automatic}</option>
            {[
              ...new Set([
                ...node.candidates.map((candidate) => candidate.detector),
                'base64',
                'hex',
                'url',
                'gzip',
                'zlib',
                'deflate',
                'zstd',
                'brotli',
                'base32',
                'base58',
                'html-entities',
              ]),
            ].map((id) => (
              <option value={id}>{id}</option>
            ))}
          </select>
          <button
            type="button"
            class="button ghost"
            onClick={() => onOverride(node.id, 'automatic')}
          >
            {completionMessages[messages.locale].undo}
          </button>
        </label>
      ) : null}
      {node.children.length ? (
        <ol class="chain-list" role="group">
          {node.children.map((child) => (
            <LayerBand
              node={child}
              rootSize={rootSize}
              {...(onOverride ? { onOverride } : {})}
              messages={messages}
              activeNodeId={activeNodeId}
              onActivate={onActivate}
              onKeyDown={onKeyDown}
              key={child.id}
            />
          ))}
        </ol>
      ) : null}
    </li>
  )
}
