import { BinaryPreview } from './BinaryPreview'
import { EmbeddedValues } from './EmbeddedValues'
import type { Detection, DecodeResult } from '@decoding/engine'
import type { DecoderMessages } from './messages'
import { EvidenceList } from './LayerBand'
import { detectionLabel } from './detection-copy'
import { outputText } from './result-text'
type Props = {
  onInspectValue: (text: string) => void
  selected: Detection | null
  result: DecodeResult
  messages: DecoderMessages
  copySelected: () => Promise<void>
  exportRedacted: () => void
  copySafeSummary: () => Promise<void>
  downloadSafeShareCard: () => void
  setShowCandidates: (show: boolean) => void
  setMessage: (text: string) => void
}
export function ResultInspector({
  onInspectValue,
  selected,
  result,
  messages,
  copySelected,
  exportRedacted,
  copySafeSummary,
  downloadSafeShareCard,
  setShowCandidates,
  setMessage,
}: Props) {
  return (
    <aside class="inspector-panel">
      <div class="panel-heading">
        <div>
          <span class="eyebrow">{messages.inspector}</span>
          <h2>{selected ? detectionLabel(selected.label, messages) : messages.noCandidate}</h2>
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
          {result.root.status === 'ambiguous' ? (
            <EvidenceList detection={selected} messages={messages} />
          ) : null}
          <BinaryPreview detection={selected} />
          <EmbeddedValues detection={selected} messages={messages} onInspect={onInspectValue} />
          <pre class="output-view">
            <code>{outputText(selected.value)}</code>
          </pre>
          <div class="safe-share" role="group" aria-label={messages.shareTitle} data-safe-share>
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
  )
}
