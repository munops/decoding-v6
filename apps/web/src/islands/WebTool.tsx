import { operations } from '@decoding/operations'
import { localizeOperations } from '../i18n/operations'
import { uiMessage } from '@decoding/workbench-ui'
import { ErrorBoundary } from '@decoding/workbench-ui'
import { takeHandoff, sendToTool } from '../lib/handoff'
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
import { rememberOpenedTool } from '../lib/tool-preferences'
import { toolNavigationCopy } from '../i18n/tool-navigation'

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
  const [preferencesUnavailable, setPreferencesUnavailable] = useState(false)
  useEffect(() => {
    setPreferencesUnavailable(
      !rememberOpenedTool(
        operation.id,
        operations.map((tool) => tool.id),
      ),
    )
  }, [operation.id])
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
          new Error(uiMessage(locale, 'operation_stopped_your_input_is_preserved_retry')),
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
    <>
      {preferencesUnavailable ? (
        <p class="notice info" role="status">
          {toolNavigationCopy(locale).unavailable}
        </p>
      ) : null}
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
            relatedTools={localizeOperations(locale, operations)
              .filter((item) => item.id !== operation.id && item.category === operation.category)
              .slice(0, 3)}
            onDecode={(text) => sendToTool('decoder', text, locale)}
            onTool={(id, text) => sendToTool(id, text, locale)}
            messages={messages}
          />
        )}
      />
    </>
  )
}
