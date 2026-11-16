import { createProofObservation } from '../lib/proof-observation'
import { offlineDecoderReady } from '../lib/offline-readiness'
import { readPhoto } from '../lib/read-photo'
import { uiMessage } from '@decoding/workbench-ui'
import { ErrorBoundary } from '@decoding/workbench-ui'
import type { DecodeInput } from '@decoding/engine'
import ProofMonitor from '../components/ProofMonitor'
import InstallHint from '../components/InstallHint'
import { listWorkspaceRecords, saveWorkspaceRecord, type WorkspaceRecord } from '../lib/workspace'
import { sendToTool, takeHandoff } from '../lib/handoff'
import { DecoderWorkbench, answerMessages } from '@decoding/workbench-ui'
import type { DecoderMessages } from '@decoding/workbench-ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { countOpen } from '../lib/telemetry'
import { createDecoderWorkerClient } from '../lib/decoder-worker-client'
import { toolNavigationCopy } from '../i18n/tool-navigation'

export type WebDecoderSample = {
  id: string
  label: string
  value: string
}

type Props = {
  initialInput?: string | undefined
  proofMode?: boolean
  messages: DecoderMessages
  sampleLabel?: string
  samples?: WebDecoderSample[]
  initialExampleLabel?: string
}

export default function WebDecoder({
  messages,
  initialInput,
  sampleLabel,
  samples = [],
  proofMode = false,
  initialExampleLabel,
}: Props) {
  const [hydrated, setHydrated] = useState(false)
  const earlyInput = useRef(
    typeof document === 'undefined'
      ? ''
      : (document.querySelector<HTMLTextAreaElement>('#decoder-input')?.value ?? ''),
  )
  const ownInputBeforeReady = Boolean(earlyInput.current && earlyInput.current !== initialInput)
  const sampleGeneration = useRef(0)
  const pendingSampleValue = useRef<string | undefined>(
    initialExampleLabel && !ownInputBeforeReady ? initialInput : undefined,
  )
  const generatedExampleFile = useRef<File>()
  useEffect(() => setHydrated(true), [])
  const [example, setExample] = useState(
    initialInput && initialExampleLabel && !ownInputBeforeReady
      ? { value: initialInput, label: initialExampleLabel }
      : undefined,
  )
  const navigation = toolNavigationCopy(messages.locale)
  const proof = useMemo(() => (proofMode ? createProofObservation() : undefined), [proofMode])
  const [proofReady, setProofReady] = useState(false)
  const [offlineState, setOfflineState] = useState<'waiting' | 'ready' | 'unavailable'>('waiting')
  useEffect(() => proof?.start(), [proof])
  const restoreInput = useRef<{ input: DecodeInput; source: string }>()
  const [boundaryAttempt, setBoundaryAttempt] = useState(0)
  const [externalFile, setExternalFile] = useState<{ id: number; file: File }>()
  const [recentSaved, setRecentSaved] = useState<WorkspaceRecord[]>([])
  useEffect(() => {
    void listWorkspaceRecords().then(
      (records) => setRecentSaved(records.slice(0, 2)),
      () => {},
    )
  }, [])
  const [decodeCount, setDecodeCount] = useState(0)
  const [shareMessage, setShareMessage] = useState('')
  const [externalInput, setExternalInput] = useState<{
    id: number
    value: string
    focus?: boolean
  }>()
  useEffect(() => {
    const handoff = initialInput ?? takeHandoff('decoder')
    const value = earlyInput.current || handoff
    if (value) setExternalInput({ id: Date.now(), value })
  }, [initialInput])
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
  const decodeObserved = useCallback(
    async (input: DecodeInput, overrides?: Record<string, string>) => {
      const revision = proof?.revision()
      const result = await client.decodeInput(input, overrides)
      if (revision !== undefined) proof?.addResult(result, revision)
      return result
    },
    [client, proof],
  )
  useEffect(() => {
    if (!proofMode) return
    const controller = new AbortController()
    void client
      .decodeInput('{"local":true}')
      .then(async () => {
        if (controller.signal.aborted) return
        setProofReady(true)
        const ready = await offlineDecoderReady(controller.signal)
        if (!controller.signal.aborted) setOfflineState(ready ? 'ready' : 'unavailable')
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setOfflineState('unavailable')
          setShareMessage(messages.decodeFailed)
        }
      })
    return () => controller.abort()
  }, [proofMode, client, messages.decodeFailed])
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
      const timer = setTimeout(
        () =>
          setShareMessage(
            uiMessage(messages.locale, 'the_shared_value_was_lost_share_again_or_use_paste'),
          ),
        2500,
      )
      if ('serviceWorker' in navigator)
        void navigator.serviceWorker.ready.then((registration) => {
          const channel = new MessageChannel()
          channel.port1.onmessage = (event) => {
            clearTimeout(timer)
            if (event.data?.file instanceof File)
              setExternalFile({ id: Date.now(), file: event.data.file })
            else if (
              typeof event.data?.text === 'string' &&
              event.data.text.length <= 10 * 1024 * 1024
            )
              setExternalInput({ id: Date.now(), value: event.data.text })
            else if (typeof event.data === 'string' && event.data.length <= 10 * 1024 * 1024)
              setExternalInput({ id: Date.now(), value: event.data })
            else
              setShareMessage(
                uiMessage(messages.locale, 'the_shared_value_was_lost_share_again_or_use_paste'),
              )
            channel.port1.close()
          }
          registration.active?.postMessage({ type: 'decoding:take-share' }, [channel.port2])
        })
    }
    return () => removeEventListener('message', receive)
  }, [])
  const inputAddon =
    sampleLabel && samples.length ? (
      <div class="triage-launchpad" role="group" aria-label={sampleLabel} aria-busy={!hydrated}>
        <span class="eyebrow">{sampleLabel}</span>
        <div class="triage-sample-grid">
          {samples.map((sample, index) => (
            <button
              key={sample.id}
              class="triage-sample"
              type="button"
              data-sample-id={sample.id}
              disabled={!hydrated}
              onClick={() => {
                const generation = ++sampleGeneration.current
                pendingSampleValue.current = sample.value
                setExample(
                  sample.id === 'qr' ? undefined : { value: sample.value, label: sample.label },
                )
                if (sample.id === 'qr') {
                  void import('@decoding/operations')
                    .then(async ({ executeOperation }) => {
                      const result = await executeOperation('qr-code', sample.value)
                      const image = new Image()
                      const url = URL.createObjectURL(
                        new Blob(
                          [decodeURIComponent(String(result.output).split(',').slice(1).join(','))],
                          { type: 'image/svg+xml' },
                        ),
                      )
                      try {
                        await new Promise<void>((resolve, reject) => {
                          image.onload = () => resolve()
                          image.onerror = () => reject(new Error())
                          image.src = url
                        })
                        const canvas = document.createElement('canvas')
                        canvas.width = image.naturalWidth
                        canvas.height = image.naturalHeight
                        canvas.getContext('2d')?.drawImage(image, 0, 0)
                        const blob = await new Promise<Blob | null>((resolve) =>
                          canvas.toBlob(resolve, 'image/png'),
                        )
                        if (!blob) throw new Error('QR image unavailable')
                        if (generation === sampleGeneration.current) {
                          const file = new File([blob], 'example-qr.png', { type: 'image/png' })
                          generatedExampleFile.current = file
                          setExample({ value: sample.value, label: sample.label })
                          setExternalFile({
                            id: Date.now(),
                            file,
                          })
                        }
                      } finally {
                        URL.revokeObjectURL(url)
                      }
                    })
                    .catch(() => {
                      if (generation === sampleGeneration.current) {
                        setExample(undefined)
                        setShareMessage(messages.decodeFailed)
                      }
                    })
                } else
                  setExternalInput((previous) => ({
                    id: (previous?.id ?? 0) + 1,
                    value: sample.value,
                  }))
              }}
            >
              <span aria-hidden="true">{['文', '↗', '◇', '≡', '@', '#', '▦'][index]}</span>
              <strong>{sample.label}</strong>
            </button>
          ))}
        </div>
        {recentSaved.length ? (
          <div class="returning-saved">
            <h3>{answerMessages(messages.locale).saved}</h3>
            {recentSaved.map((record) => (
              <a
                href={`${messages.locale === 'en' ? '' : `/${messages.locale}`}/workspace/`}
                key={record.id}
              >
                {record.name} · {record.format}
              </a>
            ))}
          </div>
        ) : null}
      </div>
    ) : null
  return (
    <div class="decoder-frame">
      {example ? (
        <div class="example-context" role="status">
          <p>
            <strong>{navigation.example}</strong> {example.label}
          </p>
          <button
            class="button secondary"
            type="button"
            disabled={!hydrated}
            onClick={() => {
              sampleGeneration.current += 1
              pendingSampleValue.current = undefined
              setExample(undefined)
              setExternalInput((previous) => ({
                id: (previous?.id ?? 0) + 1,
                value: '',
                focus: true,
              }))
            }}
          >
            {navigation.ownInput}
          </button>
        </div>
      ) : null}
      {shareMessage ? (
        <p role="status" class="notice warning">
          {shareMessage}
        </p>
      ) : null}
      {proof ? (
        <ProofMonitor
          locale={messages.locale}
          observer={proof}
          ready={proofReady}
          offline={offlineState}
        />
      ) : null}
      <ErrorBoundary
        locale={messages.locale}
        onReset={() => {
          client.terminate()
          setExternalInput(undefined)
          setExternalFile(undefined)
          setBoundaryAttempt((previous) => previous + 1)
        }}
        onClear={() => {
          restoreInput.current = undefined
          sampleGeneration.current += 1
          pendingSampleValue.current = undefined
          generatedExampleFile.current = undefined
          setExample(undefined)
        }}
        render={() => (
          <DecoderWorkbench
            key={boundaryAttempt}
            inputAddon={inputAddon}
            isExampleInput={() => pendingSampleValue.current !== undefined}
            restoreInput={restoreInput.current}
            onFileStart={(file) => {
              if (file !== generatedExampleFile.current) {
                sampleGeneration.current += 1
                pendingSampleValue.current = undefined
                setExample(undefined)
              }
            }}
            onInputState={(input, source, kind) => {
              if (
                kind !== 'file' &&
                typeof input === 'string' &&
                input !== pendingSampleValue.current
              ) {
                sampleGeneration.current += 1
                pendingSampleValue.current = undefined
                setExample(undefined)
              }
              proof?.setInput(input, kind ?? (typeof input === 'string' ? 'text' : 'file'))
              restoreInput.current = { input, source }
            }}
            decodeInput={proof ? decodeObserved : client.decodeInput}
            readPhoto={readPhoto}
            onEvent={(name) => {
              if (!proofMode) {
                countOpen(name)
                if (name === 'decode_completed') setDecodeCount((n) => n + 1)
              }
            }}
            onTool={(id, text) => sendToTool(id, text, messages.locale)}
            onSave={async (selected, ttl, options) => {
              await saveWorkspaceRecord({
                name: options.name,
                valueMode: options.valueMode,
                note: '',
                format: selected.detector,
                structure: selected.value,
                ruleIds: selected.warnings.map((warning) => warning.ruleId),
                ttl,
              })
              setRecentSaved((await listWorkspaceRecords()).slice(0, 2))
            }}
            externalInput={externalInput}
            externalFile={externalFile}
            messages={messages}
          />
        )}
      />
      {!proofMode ? <InstallHint locale={messages.locale} eligible={decodeCount >= 2} /> : null}
    </div>
  )
}
