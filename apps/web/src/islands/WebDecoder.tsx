import type { DecodeInput, DecodeResult } from '@decoding/engine'
import { DecoderWorkbench } from '@decoding/workbench-ui'
import type { DecoderMessages } from '@decoding/workbench-ui'
import { useEffect, useMemo, useState } from 'preact/hooks'

type Pending = { resolve: (result: DecodeResult) => void; reject: (error: Error) => void }

export type WebDecoderSample = {
  id: string
  label: string
  value: string
}

type Props = {
  messages: DecoderMessages
  sampleLabel?: string
  samples?: WebDecoderSample[]
}

export default function WebDecoder({ messages, sampleLabel, samples = [] }: Props) {
  const [externalInput, setExternalInput] = useState<{ id: number; value: string }>()
  const client = useMemo(() => {
    const worker = new Worker(new URL('../workers/decoder.worker.ts', import.meta.url), {
      type: 'module',
    })
    const pending = new Map<number, Pending>()
    let id = 0
    worker.onmessage = (
      event: MessageEvent<{ id: number; result?: DecodeResult; error?: string }>,
    ) => {
      const request = pending.get(event.data.id)
      if (!request) return
      pending.delete(event.data.id)
      if (event.data.error) request.reject(new Error(event.data.error))
      else if (event.data.result) request.resolve(event.data.result)
    }
    return {
      worker,
      decodeInput(input: DecodeInput) {
        const requestId = ++id
        return new Promise<DecodeResult>((resolve, reject) => {
          pending.set(requestId, { resolve, reject })
          worker.postMessage({ id: requestId, input })
        })
      },
    }
  }, [])
  useEffect(() => () => client.worker.terminate(), [client])
  return (
    <>
      {sampleLabel && samples.length ? (
        <div class="triage-launchpad" role="group" aria-label={sampleLabel}>
          <span class="eyebrow">{sampleLabel}</span>
          <div class="triage-sample-grid">
            {samples.map((sample, index) => (
              <button
                key={sample.id}
                class="triage-sample"
                type="button"
                data-sample-id={sample.id}
                onClick={() =>
                  setExternalInput((previous) => ({
                    id: (previous?.id ?? 0) + 1,
                    value: sample.value,
                  }))
                }
              >
                <span aria-hidden="true">0{index + 1}</span>
                <strong>{sample.label}</strong>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <DecoderWorkbench
        decodeInput={client.decodeInput}
        externalInput={externalInput}
        messages={messages}
      />
    </>
  )
}
