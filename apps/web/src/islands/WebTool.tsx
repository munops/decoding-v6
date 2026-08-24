import type {
  OperationDescriptor,
  OperationInput,
  OperationOptions,
  OperationResult,
} from '@decoding/operations'
import { SPONSOR_FIRST_VALUE_EVENT, ToolWorkbench } from '@decoding/workbench-ui'
import type { ToolMessages } from '@decoding/workbench-ui'
import { useEffect, useMemo } from 'preact/hooks'
import type { Locale } from '../i18n/catalog'
import { localizeOperationError, localizeOperationResult } from '../i18n/operation-results'

type Pending = { resolve: (result: OperationResult) => void; reject: (error: Error) => void }

export default function WebTool({
  operation,
  messages,
  locale,
}: {
  operation: OperationDescriptor
  messages: ToolMessages
  locale: Locale
}) {
  const client = useMemo(() => {
    const worker = new Worker(new URL('../workers/operation.worker.ts', import.meta.url), {
      type: 'module',
    })
    const pending = new Map<number, Pending>()
    let id = 0
    worker.onmessage = (
      event: MessageEvent<{ id: number; result?: OperationResult; error?: string }>,
    ) => {
      const request = pending.get(event.data.id)
      if (!request) return
      pending.delete(event.data.id)
      if (event.data.error)
        request.reject(new Error(localizeOperationError(locale, event.data.error)))
      else if (event.data.result) {
        request.resolve(localizeOperationResult(locale, event.data.result))
        window.dispatchEvent(new Event(SPONSOR_FIRST_VALUE_EVENT))
      }
    }
    return {
      worker,
      execute(operationId: string, input: OperationInput, options?: OperationOptions) {
        const requestId = ++id
        return new Promise<OperationResult>((resolve, reject) => {
          pending.set(requestId, { resolve, reject })
          worker.postMessage({ id: requestId, operation: operationId, input, options })
        })
      },
    }
  }, [locale])
  useEffect(() => () => client.worker.terminate(), [client])
  return <ToolWorkbench operation={operation} execute={client.execute} messages={messages} />
}
