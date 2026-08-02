import type { ChainNode, DecodeInput, DecodeResult, Detection } from '@decoding/engine'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import {
  playCopyFeedback,
  readCopyFeedback,
  writeCopyFeedback,
  type CopyFeedbackPreferences,
} from './copy-feedback'
import type { DecoderMessages } from './messages'
import { safeShareCardSvg, safeShareMarkdown, safeShareProjection } from './safe-share'

export type DecoderWorkbenchProps = {
  decodeInput: (input: DecodeInput) => Promise<DecodeResult>
  externalInput?: { id: number; value: string } | undefined
  messages: DecoderMessages
}

function outputText(value: unknown): string {
  if (value instanceof Uint8Array)
    return [...value].map((byte) => byte.toString(16).padStart(2, '0')).join(' ')
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function redactValue(value: unknown, depth = 0): unknown {
  if (depth > 12) return '[depth limited]'
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => redactValue(item, depth + 1))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .slice(0, 200)
        .map(([key, item]) => [
          key,
          /secret|token|password|authorization|cookie|private|signature|key/i.test(key)
            ? '[redacted]'
            : redactValue(item, depth + 1),
        ]),
    )
  }
  if (value === null) return null
  return `[${typeof value}]`
}

function EvidenceList({ detection }: { detection: Detection }) {
  return (
    <div class="evidence-stack">
      <div class="confidence-line">
        <span class="confidence-badge">{Math.round(detection.confidence * 100)}%</span>
        <strong>{detection.label}</strong>
      </div>
      <p>{detection.summary}</p>
      <ul class="evidence-list">
        {detection.evidence.map((evidence) => (
          <li key={evidence.code}>{evidence.message}</li>
        ))}
      </ul>
      {detection.warnings.map((warning) => (
        <div class={`notice ${warning.severity}`} role="status" key={warning.ruleId}>
          <strong>{warning.ruleId}</strong>
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
  if (node.selected) return node.selected.label
  if (node.status === 'ambiguous') return messages.ambiguousStep
  if (node.status === 'limit') return messages.limitStep
  return messages.unsupportedStep
}

function ChainStage({ node, messages }: { node: ChainNode; messages: DecoderMessages }) {
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
  onKeyDown: (event: KeyboardEvent) => void
}

function ChainView({ node, messages, activeNodeId, onActivate, onKeyDown }: ChainViewProps) {
  return (
    <li
      class="chain-node"
      style={{ '--depth': node.depth }}
      role="treeitem"
      aria-level={node.depth + 1}
      aria-expanded={node.children.length ? true : undefined}
      tabIndex={activeNodeId === node.id ? 0 : -1}
      data-chain-node-id={node.id}
      onFocus={() => onActivate(node.id)}
      onKeyDown={onKeyDown}
    >
      <ChainStage node={node} messages={messages} />
      {node.selected ? <EvidenceList detection={node.selected} /> : null}
      {node.limitReason ? (
        <div class="notice warning" role="status">
          {messages.stopped}: {node.limitReason}
        </div>
      ) : null}
      {node.children.length ? (
        <ol class="chain-list" role="group">
          {node.children.map((child) => (
            <ChainView
              node={child}
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

export function DecoderWorkbench({ decodeInput, externalInput, messages }: DecoderWorkbenchProps) {
  const [source, setSource] = useState('')
  const [result, setResult] = useState<DecodeResult | null>(null)
  const [selected, setSelected] = useState<Detection | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [showCandidates, setShowCandidates] = useState(false)
  const [activeChainNode, setActiveChainNode] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedbackPreferences>(() =>
    readCopyFeedback(),
  )
  const requestId = useRef(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const run = useCallback(
    async (input: DecodeInput) => {
      const current = ++requestId.current
      setStatus('processing')
      setMessage(messages.checking)
      try {
        const next = await decodeInput(input)
        if (current !== requestId.current) return
        setResult(next)
        setSelected(next.root.selected ?? next.root.candidates[0] ?? null)
        setShowCandidates(next.root.status === 'ambiguous')
        setActiveChainNode(next.root.id)
        setStatus('done')
        setMessage(next.root.status === 'unsupported' ? messages.unsupported : '')
      } catch (error) {
        if (current !== requestId.current) return
        setStatus('error')
        setMessage(error instanceof Error ? error.message : messages.decodeFailed)
      }
    },
    [decodeInput, messages],
  )

  const handleSource = (value: string) => {
    setSource(value)
    if (!value) {
      requestId.current += 1
      setResult(null)
      setSelected(null)
      setStatus('idle')
      setMessage('')
      setShowCandidates(false)
      setActiveChainNode(null)
      return
    }
    void run(value)
  }

  const handleFile = async (file?: File) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setStatus('error')
      setMessage(messages.fileLimit)
      return
    }
    setSource(
      `[${messages.localFile}: ${file.name}, ${file.size.toLocaleString()} ${messages.bytes}]`,
    )
    await run(new Uint8Array(await file.arrayBuffer()))
  }

  const copySelected = async () => {
    if (!selected) return
    try {
      await navigator.clipboard.writeText(outputText(selected.value))
      setMessage(messages.copied)
      void playCopyFeedback(copyFeedback)
    } catch {
      setMessage(messages.copyFailed)
    }
  }

  const copySafeSummary = async () => {
    if (!result || !selected) return
    const projection = safeShareProjection(result.root, selected, messages)
    if (!projection) return
    try {
      await navigator.clipboard.writeText(safeShareMarkdown(projection, messages))
      setMessage(messages.shareCopied)
      void playCopyFeedback(copyFeedback)
    } catch {
      setMessage(messages.copyFailed)
    }
  }

  const downloadSafeShareCard = () => {
    if (!result || !selected) return
    const projection = safeShareProjection(result.root, selected, messages)
    if (!projection) return
    const blob = new Blob([safeShareCardSvg(projection, messages)], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'decoding-safe-share-card.svg'
    document.body.append(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 0)
    setMessage(messages.shareCardDownloaded)
  }

  const updateCopyFeedback = (next: CopyFeedbackPreferences) => {
    const saved = writeCopyFeedback(next)
    setCopyFeedback(saved)
  }

  const previewCopyFeedback = async () => {
    const outcome = await playCopyFeedback(copyFeedback)
    setMessage(
      outcome === 'played' ? messages.copyFeedbackPreviewed : messages.copyFeedbackVisualOnly,
    )
  }

  const exportRedacted = () => {
    if (!selected) return
    const payload = {
      version: 1,
      detector: selected.detector,
      label: selected.label,
      confidence: selected.confidence,
      evidence: selected.evidence.map(({ code, message }) => ({ code, message })),
      warnings: selected.warnings.map(({ ruleId, severity, message: warningMessage }) => ({
        ruleId,
        severity,
        message: warningMessage,
      })),
      structure: redactValue(selected.value),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'decoding-redacted-result.json'
    link.click()
    URL.revokeObjectURL(link.href)
    setMessage(messages.exported)
  }

  const handleChainKeyDown = (event: KeyboardEvent) => {
    const current = event.currentTarget as HTMLElement
    const tree = current.closest<HTMLElement>('[role="tree"]')
    if (!tree) return
    const items = [...tree.querySelectorAll<HTMLElement>('[role="treeitem"]')]
    const index = items.indexOf(current)
    const focus = (item?: HTMLElement) => {
      if (!item) return
      setActiveChainNode(item.dataset.chainNodeId ?? null)
      item.focus()
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focus(items[index + 1] ?? items[0])
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focus(items[index - 1] ?? items.at(-1))
    } else if (event.key === 'Home') {
      event.preventDefault()
      focus(items[0])
    } else if (event.key === 'End') {
      event.preventDefault()
      focus(items.at(-1))
    } else if (event.key === 'ArrowRight') {
      const child = current.querySelector<HTMLElement>(
        ':scope > [role="group"] > [role="treeitem"]',
      )
      if (child) {
        event.preventDefault()
        focus(child)
      }
    } else if (event.key === 'ArrowLeft') {
      const parent = current.parentElement?.closest<HTMLElement>('[role="treeitem"]')
      if (parent) {
        event.preventDefault()
        focus(parent)
      }
    }
  }

  useEffect(() => {
    if (externalInput?.value) handleSource(externalInput.value)
  }, [externalInput?.id])

  useEffect(() => {
    const focusInput = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return
      event.preventDefault()
      inputRef.current?.focus()
    }
    addEventListener('keydown', focusInput)
    return () => removeEventListener('keydown', focusInput)
  }, [])

  return (
    <section class="decoder-shell" aria-label={messages.ariaLabel}>
      <div class="workbench-bar">
        <div class="privacy-line">
          <span class="privacy-dot" aria-hidden="true" />
          {messages.privacy}
        </div>
        <details class="copy-feedback-settings">
          <summary>{messages.copyFeedback}</summary>
          <div class="copy-feedback-controls">
            <p>{messages.copyFeedbackDescription}</p>
            <label class="copy-feedback-toggle">
              <input
                type="checkbox"
                checked={copyFeedback.enabled}
                onChange={(event) =>
                  updateCopyFeedback({ ...copyFeedback, enabled: event.currentTarget.checked })
                }
              />
              {messages.copyFeedbackEnabled}
            </label>
            <label class="copy-feedback-volume" for="copy-feedback-volume">
              <span>{messages.copyFeedbackVolume}</span>
              <input
                id="copy-feedback-volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={copyFeedback.volume}
                disabled={!copyFeedback.enabled}
                onInput={(event) =>
                  updateCopyFeedback({ ...copyFeedback, volume: Number(event.currentTarget.value) })
                }
              />
              <output>{Math.round(copyFeedback.volume * 100)}%</output>
            </label>
            <button
              class="button ghost small"
              type="button"
              onClick={() => void previewCopyFeedback()}
              disabled={!copyFeedback.enabled}
            >
              {messages.copyFeedbackPreview}
            </button>
          </div>
        </details>
      </div>
      <div
        class="paste-surface"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          void handleFile(event.dataTransfer?.files[0])
        }}
      >
        <label for="decoder-input">{messages.pasteLabel}</label>
        <textarea
          id="decoder-input"
          ref={inputRef}
          value={source}
          onInput={(event) => handleSource(event.currentTarget.value)}
          placeholder={messages.placeholder}
          spellcheck={false}
          autocomplete="off"
          autocapitalize="off"
          autofocus
        />
        <div class="input-actions">
          <label class="button secondary">
            {messages.openFile}
            <input
              class="visually-hidden"
              type="file"
              onChange={(event) => void handleFile(event.currentTarget.files?.[0])}
            />
          </label>
          <button
            type="button"
            class="button ghost"
            onClick={() => handleSource('')}
            disabled={!source}
          >
            {messages.clear}
          </button>
          <span>{messages.maxSize}</span>
        </div>
      </div>

      {status === 'processing' ? (
        <div class="processing" aria-live="polite">
          {message}
        </div>
      ) : null}
      {message && status !== 'processing' ? (
        <div class={`notice ${status === 'error' ? 'danger' : 'info'}`} aria-live="polite">
          {message}
        </div>
      ) : null}

      {result ? (
        <div class="result-grid">
          <div class="result-chain">
            <div class="panel-heading">
              <div>
                <span class="eyebrow">{messages.decodeChain}</span>
                <h2>
                  {result.root.status === 'ambiguous'
                    ? messages.possibleFormats
                    : messages.localResult}
                </h2>
              </div>
              <small>{result.elapsedMs.toFixed(1)} ms</small>
            </div>
            {showCandidates ? (
              <>
                <ol class="chain-list" role="tree" aria-label={messages.decodeChain}>
                  <li
                    class="chain-node"
                    style={{ '--depth': result.root.depth }}
                    role="treeitem"
                    aria-level={result.root.depth + 1}
                    tabIndex={activeChainNode === result.root.id ? 0 : -1}
                    data-chain-node-id={result.root.id}
                    onFocus={() => setActiveChainNode(result.root.id)}
                    onKeyDown={handleChainKeyDown}
                  >
                    <ChainStage node={result.root} messages={messages} />
                  </li>
                </ol>
                <p class="notice warning" role="status">
                  {messages.ambiguousStep}
                </p>
                <div class="candidate-list" role="listbox" aria-label={messages.possibleFormats}>
                  {result.root.candidates.map((candidate) => (
                    <button
                      type="button"
                      class={
                        selected?.detector === candidate.detector
                          ? 'candidate selected'
                          : 'candidate'
                      }
                      role="option"
                      aria-selected={selected?.detector === candidate.detector}
                      onClick={() => setSelected(candidate)}
                      key={candidate.detector}
                    >
                      <span>{candidate.label}</span>
                      <strong>{Math.round(candidate.confidence * 100)}%</strong>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <ol class="chain-list" role="tree" aria-label={messages.decodeChain}>
                <ChainView
                  node={result.root}
                  messages={messages}
                  activeNodeId={activeChainNode}
                  onActivate={setActiveChainNode}
                  onKeyDown={handleChainKeyDown}
                />
              </ol>
            )}
          </div>
          <aside class="inspector-panel">
            <div class="panel-heading">
              <div>
                <span class="eyebrow">{messages.inspector}</span>
                <h2>{selected?.label ?? messages.noCandidate}</h2>
              </div>
              <div class="inline-actions">
                <button
                  class="button small"
                  type="button"
                  onClick={() => void copySelected()}
                  disabled={!selected}
                >
                  {messages.copy}
                </button>
                <button
                  class="button small secondary"
                  type="button"
                  onClick={exportRedacted}
                  disabled={!selected}
                >
                  {messages.exportRedacted}
                </button>
              </div>
            </div>
            {selected ? (
              <>
                {result.root.status === 'ambiguous' ? <EvidenceList detection={selected} /> : null}
                <pre class="output-view">
                  <code>{outputText(selected.value)}</code>
                </pre>
                <div
                  class="safe-share"
                  role="group"
                  aria-label={messages.shareTitle}
                  data-safe-share
                >
                  <div>
                    <span class="eyebrow">{messages.shareTitle}</span>
                    <p>{messages.shareOmitted}</p>
                  </div>
                  <div class="safe-share-actions">
                    <button
                      class="button small secondary"
                      type="button"
                      data-safe-share-action="copy"
                      onClick={() => void copySafeSummary()}
                    >
                      {messages.copySafeSummary}
                    </button>
                    <button
                      class="button small ghost"
                      type="button"
                      data-safe-share-action="download"
                      onClick={downloadSafeShareCard}
                    >
                      {messages.downloadShareCard}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p>{messages.trySupported}</p>
            )}
            {result.root.candidates.length ? (
              <button
                class="button ghost small"
                type="button"
                onClick={() => {
                  setShowCandidates(true)
                  setMessage(messages.chooseCandidate)
                }}
              >
                {messages.wrongFormat}
              </button>
            ) : null}
          </aside>
        </div>
      ) : null}
    </section>
  )
}
