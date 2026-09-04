import { DecoderWorkbench } from '@decoding/workbench-ui'
import type { DecoderMessages } from '@decoding/workbench-ui'
import { useEffect, useMemo, useState } from 'preact/hooks'
import { createDecoderWorkerClient } from '../lib/decoder-worker-client'

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
  const client = useMemo(
    () =>
      createDecoderWorkerClient(
        () =>
          new Worker(new URL('../workers/decoder.worker.ts', import.meta.url), {
            type: 'module',
          }),
      ),
    [],
  )
  useEffect(() => () => client.terminate(), [client])
  return (
    <div class="decoder-frame">
      <DecoderWorkbench
        decodeInput={client.decodeInput}
        externalInput={externalInput}
        messages={messages}
      />
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
    </div>
  )
}
