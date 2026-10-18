import { ByteMap } from './ByteMap'
import { HexDump } from './HexDump'
import { CandidateCompare } from './CandidateCompare'
import { NextStep } from './NextStep'
import { JwtTimes } from './JwtTimes'
import { JwtVerify } from './JwtVerify'
import { BinaryPreview } from './BinaryPreview'
import { EmbeddedValues } from './EmbeddedValues'
import type { Detection, DecodeResult } from '@decoding/engine'
import type { DecoderMessages } from './messages'
import { EvidenceList } from './LayerBand'
import { detectionLabel } from './detection-copy'
import { outputText } from './result-text'
type Props = {
  source: string
  onTool?: (tool: string, text: string) => void
  onInspectValue: (text: string) => void
  selected: Detection | null
  result: DecodeResult
  messages: DecoderMessages
  exportRedacted: () => void
  copySafeSummary: () => Promise<void>
  downloadSafeShareCard: () => void
  setShowCandidates: (show: boolean) => void
  setMessage: (text: string) => void
}
export function ResultInspector({
  source,
  onTool,
  onInspectValue,
  selected,
  result,
  messages,
  exportRedacted,
  copySafeSummary,
  downloadSafeShareCard,
  setShowCandidates,
  setMessage,
}: Props) {
  const nodeFor = (node: DecodeResult['root']): DecodeResult['root'] | undefined =>
    node.selected === selected ? node : node.children.map(nodeFor).find(Boolean)
  const node = nodeFor(result.root)
  const privateKey = selected?.warnings.some((warning) => warning.ruleId === 'PRIVATE-KEY-EXPOSED')
  const bytes = privateKey
    ? null
    : (node?.bytes ?? (selected?.decoded instanceof Uint8Array ? selected.decoded : null))
  return (
    <aside class="inspector-panel">
      <div class="panel-heading">
        <div>
          <span class="eyebrow">{messages.inspector}</span>
          <h2>{selected ? detectionLabel(selected.label, messages) : messages.noCandidate}</h2>
        </div>
        <div class="inline-actions">
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
          <JwtTimes detection={selected} locale={messages.locale} />
          <BinaryPreview detection={selected} />
          <EmbeddedValues detection={selected} messages={messages} onInspect={onInspectValue} />
          <pre class="output-view">
            <code>{outputText(selected.value)}</code>
          </pre>
          {bytes ? (
            <>
              <ByteMap bytes={bytes} locale={messages.locale} />
              <HexDump bytes={bytes} locale={messages.locale} />
            </>
          ) : null}
          {selected.detector === 'jwt' && typeof selected.metadata?.token === 'string' ? (
            <JwtVerify token={selected.metadata.token} locale={messages.locale} />
          ) : null}
          <CandidateCompare candidates={result.root.candidates} messages={messages} />
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
        <>
          <p>{messages.trySupported}</p>
          {result.root.bytes ? (
            <>
              <ByteMap bytes={result.root.bytes} locale={messages.locale} />
              <HexDump bytes={result.root.bytes} locale={messages.locale} />
            </>
          ) : null}
          <NextStep
            source={source}
            result={result}
            locale={messages.locale}
            {...(onTool ? { onTool } : {})}
          />
        </>
      )}
      {selected ? (
        <details class="safe-report">
          <summary>{messages.wrongFormat}</summary>
          <NextStep
            source={source}
            result={result}
            locale={messages.locale}
            {...(onTool && !privateKey ? { onTool } : {})}
          />
        </details>
      ) : null}
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
