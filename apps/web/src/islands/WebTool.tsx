import { ErrorBoundary } from '@decoding/workbench-ui'
import { takeHandoff } from '../lib/handoff'
import type {
  OperationDescriptor,
  OperationInput,
  OperationOptions,
  OperationResult,
} from '@decoding/operations'
import { SPONSOR_FIRST_VALUE_EVENT, ToolWorkbench } from '@decoding/workbench-ui'
import type { ToolMessages } from '@decoding/workbench-ui'
import { useEffect, useMemo, useState, useRef } from 'preact/hooks'
import type { Locale } from '../i18n/catalog'
import { localizeOperationError, localizeOperationResult } from '../i18n/operation-results'

type Pending = {
  resolve: (result: OperationResult) => void
  reject: (error: Error) => void
  timer: ReturnType<typeof setTimeout>
}

export default function WebTool({
  operation,
  messages,
  locale,
}: {
  operation: OperationDescriptor
  messages: ToolMessages
  locale: Locale
}) {
  const [initialInput] = useState(() =>
    typeof window === 'undefined' ? undefined : takeHandoff(operation.id),
  )
  const draft = useRef(initialInput)
  const [attempt, setAttempt] = useState(0)
  const client = useMemo(() => {
    const createWorker = () =>
      new Worker(new URL('../workers/operation.worker.ts', import.meta.url), {
        type: 'module',
      })
    const pending = new Map<number, Pending>()
    let id = 0
    let worker: Worker | undefined
    const stop = () => {
      worker?.terminate()
      worker = undefined
      for (const request of pending.values()) {
        clearTimeout(request.timer)
        request.reject(
          new Error(
            locale === 'ko'
              ? '작업이 중단됐어요. 입력을 유지했으니 다시 실행해 주세요.'
              : 'Operation stopped. Your input is preserved; retry.',
          ),
        )
      }
      pending.clear()
    }
    const receive = (
      event: MessageEvent<{ id: number; result?: OperationResult; error?: string }>,
    ) => {
      const request = pending.get(event.data.id)
      if (!request) return
      pending.delete(event.data.id)
      clearTimeout(request.timer)
      if (event.data.error)
        request.reject(new Error(localizeOperationError(locale, event.data.error)))
      else if (event.data.result) {
        request.resolve(localizeOperationResult(locale, event.data.result))
        window.dispatchEvent(new Event(SPONSOR_FIRST_VALUE_EVENT))
      }
    }
    return {
      terminate: stop,
      execute(operationId: string, input: OperationInput, options?: OperationOptions) {
        const requestId = ++id
        return new Promise<OperationResult>((resolve, reject) => {
          const timer = setTimeout(stop, 10_000)
          pending.set(requestId, { resolve, reject, timer })
          try {
            if (!worker) {
              worker = createWorker()
              worker.onmessage = receive
              worker.onerror = (event) => {
                event.preventDefault()
                stop()
              }
              worker.onmessageerror = stop
            }
            worker.postMessage({ id: requestId, operation: operationId, input, options })
          } catch {
            stop()
          }
        })
      },
    }
  }, [locale])
  useEffect(() => () => client.terminate(), [client])
  return (
    <ErrorBoundary
      locale={messages.locale}
      onReset={() => {
        client.terminate()
        setAttempt((previous) => previous + 1)
      }}
      onClear={() => {
        draft.current = ''
      }}
      render={() => (
        <ToolWorkbench
          key={attempt}
          onSourceChange={(text) => {
            draft.current = text
          }}
          initialInput={draft.current}
          operation={operation}
          execute={client.execute}
          messages={messages}
        />
      )}
    />
  )
}
