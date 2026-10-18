import { completionMessages } from './completion-messages'
import { WorkflowActions } from './WorkflowActions'
import { BatchCompare } from './BatchCompare'
import { outputText } from './result-text'
import { DecoderInput } from './DecoderInput'
import { ResultInspector } from './ResultInspector'
import type { DecodeInput, DecodeResult, Detection } from '@decoding/engine'
import { useCallback, useEffect, useRef, useState } from 'preact/hooks'
import { PortfolioThemeControl } from './PortfolioThemeControl'
import {
  playCopyFeedback,
  readCopyFeedback,
  writeCopyFeedback,
  type CopyFeedbackPreferences,
} from './copy-feedback'
import { detectionLabel } from './detection-copy'
import type { DecoderMessages } from './messages'
import { ChainStage, LayerBand } from './LayerBand'
import { safeShareCardSvg, safeShareMarkdown, safeShareProjection } from './safe-share'

export type DecoderWorkbenchProps = {
  decodeInput: (input: DecodeInput, overrides?: Record<string, string>) => Promise<DecodeResult>
  externalInput?: { id: number; value: string } | undefined
  onSave?: (selected: Detection, ttl: 'session' | '24h' | '7d' | 'keep') => Promise<void>
  onTool?: (tool: string, text: string) => void
  onEvent?: (name: 'decode_completed' | 'decode_unsupported' | 'share_action') => void
  messages: DecoderMessages
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

export function DecoderWorkbench({
  decodeInput,
  externalInput,
  messages,
  onEvent,
  onTool,
  onSave,
}: DecoderWorkbenchProps) {
  const [sessionHistory, setSessionHistory] = useState<Array<{ input: string; label: string }>>([])
  const [shortcuts, setShortcuts] = useState(false)
  const copy = completionMessages[messages.locale]
  const [source, setSource] = useState(() =>
    typeof document === 'undefined'
      ? ''
      : (document.querySelector<HTMLTextAreaElement>('#decoder-input')?.value ?? ''),
  )
  const [result, setResult] = useState<DecodeResult | null>(null)
  const [selected, setSelected] = useState<Detection | null>(null)
  const [status, setStatus] = useState<'idle' | 'processing' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [diagnostic, setDiagnostic] = useState('')
  const [showCandidates, setShowCandidates] = useState(false)
  const [activeChainNode, setActiveChainNode] = useState<string | null>(null)
  const [copyFeedback, setCopyFeedback] = useState<CopyFeedbackPreferences>(() =>
    readCopyFeedback(),
  )
  const overrides = useRef<Record<string, string>>({})
  const requestId = useRef(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const lastInput = useRef<DecodeInput | null>(null)

  const run = useCallback(
    async (input: DecodeInput) => {
      lastInput.current = input
      const current = ++requestId.current
      setStatus('processing')
      setMessage(messages.checking)
      setDiagnostic('')
      try {
        const next = await decodeInput(input, overrides.current)
        if (current !== requestId.current) return
        setResult(next)
        setSelected(next.root.selected ?? next.root.candidates[0] ?? null)
        setShowCandidates(next.root.status === 'ambiguous')
        setActiveChainNode(next.root.id)
        setStatus('done')
        if (typeof input === 'string')
          setSessionHistory((previous) =>
            [
              {
                input,
                label:
                  next.root.selected?.label ??
                  next.root.candidates[0]?.label ??
                  messages.unsupportedStep,
              },
              ...previous.filter((entry) => entry.input !== input),
            ].slice(0, 10),
          )
        if (next.root.status === 'confident') onEvent?.('decode_completed')
        else if (next.root.status === 'unsupported') onEvent?.('decode_unsupported')
        setMessage(next.root.status === 'unsupported' ? messages.unsupported : '')
      } catch (error) {
        if (current !== requestId.current) return
        setStatus('error')
        setMessage(messages.decodeFailed)
        setDiagnostic(error instanceof Error ? error.message : String(error))
      }
    },
    [decodeInput, messages],
  )

  const handleSource = (value: string) => {
    overrides.current = {}
    setSource(value)
    if (!value) {
      requestId.current += 1
      setResult(null)
      setSelected(null)
      setStatus('idle')
      setMessage('')
      setDiagnostic('')
      lastInput.current = null
      setShowCandidates(false)
      setActiveChainNode(null)
      return
    }
    void run(value)
  }

  const paste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      handleSource(text)
      setMessage(
        messages.locale === 'ko'
          ? '누를 때만 클립보드를 읽고 기기에서 처리해요.'
          : 'Clipboard read only after your tap; processing stays on this device.',
      )
    } catch {
      setMessage(copy.pasteHelp)
      inputRef.current?.focus()
    }
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

  const activateLayer = (nodeId: string) => {
    setActiveChainNode(nodeId)
    const visit = (node: DecodeResult['root']): void => {
      if (node.id === nodeId) setSelected(node.selected ?? node.candidates[0] ?? null)
      else node.children.forEach(visit)
    }
    if (result) visit(result.root)
  }
  const overrideLayer = (nodeId: string, format: string) => {
    const depth = Number(nodeId.split('-')[0])
    for (const key of Object.keys(overrides.current))
      if (Number(key.split('-')[0]) > depth) delete overrides.current[key]
    if (format === 'automatic') delete overrides.current[nodeId]
    else overrides.current[nodeId] = format
    if (lastInput.current) void run(lastInput.current)
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
      onEvent?.('share_action')
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
    onEvent?.('share_action')
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
    event.stopPropagation()
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
    if (source) void run(source)
  }, [])

  useEffect(() => {
    if (externalInput?.value) handleSource(externalInput.value)
  }, [externalInput?.id])

  useEffect(() => {
    const focusInput = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        if (lastInput.current) void run(lastInput.current)
        return
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'c') {
        event.preventDefault()
        void copySelected()
        return
      }
      const typing = (event.target as HTMLElement | null)?.matches(
        'input, textarea, select, [contenteditable="true"]',
      )
      if (event.key === '?' && !typing) {
        event.preventDefault()
        setShortcuts((previous) => !previous)
        return
      }
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return
      event.preventDefault()
      inputRef.current?.focus()
    }
    addEventListener('keydown', focusInput)
    return () => removeEventListener('keydown', focusInput)
  }, [selected, source, copyFeedback])

  return (
    <section class="decoder-shell" aria-label={messages.ariaLabel}>
      <div class="workbench-bar">
        <div class="privacy-line">
          <span class="privacy-dot" aria-hidden="true" />
          {messages.privacy}
        </div>
      </div>
      <DecoderInput
        onPaste={() => void paste()}
        source={source}
        messages={messages}
        inputRef={inputRef}
        handleSource={handleSource}
        handleFile={handleFile}
      />

      {shortcuts ? (
        <div class="notice info">
          <button class="button ghost" type="button" onClick={() => setShortcuts(false)}>
            {copy.close}
          </button>
          <p>
            / · {messages.pasteLabel}
            <br />
            Ctrl/⌘ + Enter · {copy.retry}
            <br />
            Ctrl/⌘ + Shift + C · {messages.copy}
            <br />? · {messages.locale === 'ko' ? '단축키' : 'Shortcuts'}
          </p>
        </div>
      ) : null}
      {sessionHistory.length > 1 ? (
        <details class="session-history">
          <summary>{copy.history}</summary>
          {sessionHistory.map((entry, i) => (
            <button
              class="button ghost"
              type="button"
              key={i}
              onClick={() => handleSource(entry.input)}
            >
              {i + 1} · {entry.label}
            </button>
          ))}
        </details>
      ) : null}
      <BatchCompare
        source={source}
        decodeInput={decodeInput}
        messages={messages}
        onInput={handleSource}
      />
      {status === 'processing' ? (
        <div class="processing" aria-live="polite">
          {message}
        </div>
      ) : null}
      {message && status !== 'processing' ? (
        <div class={`notice ${status === 'error' ? 'danger' : 'info'}`} aria-live="polite">
          <span>{message}</span>
          {status === 'error' && lastInput.current ? (
            <button
              class="button secondary small"
              type="button"
              onClick={() => lastInput.current && void run(lastInput.current)}
            >
              {messages.retry}
            </button>
          ) : null}
          {status === 'error' && diagnostic ? (
            <details>
              <summary>{messages.diagnosticDetails}</summary>
              <code>{diagnostic}</code>
            </details>
          ) : null}
        </div>
      ) : null}

      {result ? (
        <div class="result-grid">
          {result.root.candidates
            .flatMap((candidate) => candidate.warnings)
            .filter((warning) => warning.severity === 'danger')
            .filter(
              (warning, i, list) =>
                list.findIndex((other) => other.ruleId === warning.ruleId) === i,
            )
            .map((warning) => (
              <div class="notice danger result-alert" role="status" key={warning.ruleId}>
                <strong>{warning.ruleId}</strong> {warning.message}
              </div>
            ))}
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
                      onClick={() => {
                        setSelected(candidate)
                        overrideLayer(result.root.id, candidate.detector)
                      }}
                      key={candidate.detector}
                    >
                      <span>{detectionLabel(candidate.label, messages)}</span>
                      <strong>{Math.round(candidate.confidence * 100)}%</strong>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <ol class="chain-list" role="tree" aria-label={messages.decodeChain}>
                <LayerBand
                  node={result.root}
                  onOverride={overrideLayer}
                  messages={messages}
                  activeNodeId={activeChainNode}
                  onActivate={activateLayer}
                  onKeyDown={handleChainKeyDown}
                />
              </ol>
            )}
          </div>
          <ResultInspector
            source={source}
            {...(onTool ? { onTool } : {})}
            onInspectValue={handleSource}
            selected={selected}
            result={result}
            messages={messages}
            copySelected={copySelected}
            exportRedacted={exportRedacted}
            copySafeSummary={copySafeSummary}
            downloadSafeShareCard={downloadSafeShareCard}
            setShowCandidates={setShowCandidates}
            setMessage={setMessage}
          />
        </div>
      ) : null}
      {result ? (
        <WorkflowActions
          result={result}
          selected={selected}
          messages={messages}
          {...(onTool ? { onTool } : {})}
          {...(onSave ? { onSave } : {})}
          onInput={handleSource}
          onCopy={() => void copySelected()}
          onShare={downloadSafeShareCard}
        />
      ) : null}
      <details class="copy-feedback-settings result-preference">
        <summary>{messages.copyFeedback}</summary>
        <div class="copy-feedback-controls">
          <PortfolioThemeControl messages={messages.portfolioTheme} />
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
                updateCopyFeedback({
                  ...copyFeedback,
                  volume: Number(event.currentTarget.value),
                })
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
    </section>
  )
}
