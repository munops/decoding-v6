import type { Detection } from '@decoding/engine'
import { useEffect, useState } from 'preact/hooks'
import type { DecoderMessages } from './messages'
import { completionMessages } from './completion-messages'
export function EmbeddedValues({
  detection,
  messages,
  onInspect,
}: {
  detection: Detection
  messages: DecoderMessages
  onInspect: (text: string) => void
}) {
  const copy = completionMessages[messages.locale],
    [revealed, setRevealed] = useState<Set<number>>(new Set())
  useEffect(() => setRevealed(new Set()), [detection])
  const fields = detection.metadata?.embedded as
    Array<{ path?: string; offset?: number; encoded: string }> | undefined
  const secrets = detection.metadata?.secretFields as
    Array<{ name: string; decoded: string }> | undefined
  return (
    <>
      {fields?.map((field, i) => (
        <div class="embedded-field" key={i}>
          <code>{field.path ?? `${copy.path} ${field.offset}`}</code>
          <button type="button" class="button secondary" onClick={() => onInspect(field.encoded)}>
            {copy.inspect}
          </button>
        </div>
      ))}
      {secrets?.length ? <p>{copy.private}</p> : null}
      {secrets?.map((field, i) => (
        <div class="embedded-field" key={i}>
          <strong>{field.name}</strong>
          <button
            type="button"
            class="button secondary"
            onClick={() =>
              setRevealed((previous) => {
                const next = new Set(previous)
                if (next.has(i)) next.delete(i)
                else next.add(i)
                return next
              })
            }
          >
            {revealed.has(i) ? copy.hide : copy.reveal}
          </button>
          {revealed.has(i) ? (
            <pre>
              <code>{field.decoded}</code>
            </pre>
          ) : null}
        </div>
      ))}
    </>
  )
}
