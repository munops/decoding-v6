import InstallHint from '../components/InstallHint'
import { saveWorkspaceRecord } from '../lib/workspace'
import { sendToTool } from '../lib/handoff'
import { DecoderWorkbench } from '@decoding/workbench-ui'
import type { DecoderMessages } from '@decoding/workbench-ui'
import { useEffect, useMemo, useState } from 'preact/hooks'
import { countOpen } from '../lib/telemetry'
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
  const [shareMessage, setShareMessage] = useState('')
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
  useEffect(() => {
    const opener = window.opener
    const receive = (event: MessageEvent) => {
      if (
        opener &&
        event.source === opener &&
        event.data?.type === 'decoding:selection' &&
        typeof event.data.text === 'string' &&
        event.data.text.length <= 10 * 1024 * 1024
      )
        setExternalInput({ id: Date.now(), value: event.data.text })
    }
    addEventListener('message', receive)
    if (opener) opener.postMessage('decoding:ready', '*')
    if (location.hash === '#share') {
      history.replaceState(history.state, '', location.pathname)
      if ('serviceWorker' in navigator)
        void navigator.serviceWorker.ready.then((registration) => {
          const channel = new MessageChannel(),
            timer = setTimeout(
              () =>
                setShareMessage(
                  messages.locale === 'ko'
                    ? '공유된 값을 받지 못했어요. 다시 공유하거나 붙여 넣어 주세요.'
                    : 'The shared value was lost. Share again, or use Paste.',
                ),
              2500,
            )
          channel.port1.onmessage = (event) => {
            clearTimeout(timer)
            if (typeof event.data === 'string' && event.data.length <= 10 * 1024 * 1024)
              setExternalInput({ id: Date.now(), value: event.data })
            else
              setShareMessage(
                messages.locale === 'ko'
                  ? '공유된 값을 받지 못했어요. 다시 공유하거나 붙여 넣어 주세요.'
                  : 'The shared value was lost. Share again, or use Paste.',
              )
            channel.port1.close()
          }
          registration.active?.postMessage({ type: 'decoding:take-share' }, [channel.port2])
        })
    }
    return () => removeEventListener('message', receive)
  }, [])
  return (
    <div class="decoder-frame">
      {shareMessage ? (
        <p role="status" class="notice warning">
          {shareMessage}
        </p>
      ) : null}
      <DecoderWorkbench
        decodeInput={client.decodeInput}
        onEvent={countOpen}
        onTool={sendToTool}
        onSave={async (selected, ttl) => {
          await saveWorkspaceRecord({
            name: `${selected.label} · ${new Date().toLocaleString()}`,
            note: '',
            format: selected.detector,
            structure: selected.value,
            ruleIds: selected.warnings.map((warning) => warning.ruleId),
            ttl,
          })
        }}
        externalInput={externalInput}
        messages={messages}
      />
      <InstallHint locale={messages.locale} />
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
