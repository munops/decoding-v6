import type { DecodeInput, DecodeResult } from '@decoding/engine'

type DecoderWorkerMessage = { id: number; result?: DecodeResult; error?: string }

export type DecoderWorkerLike = {
  onmessage: ((event: MessageEvent<DecoderWorkerMessage>) => void) | null
  onerror: ((event: ErrorEvent) => void) | null
  onmessageerror: ((event: MessageEvent<unknown>) => void) | null
  postMessage: (message: {
    id: number
    input: DecodeInput
    overrides?: Record<string, string>
  }) => void
  terminate: () => void
}

type Pending = {
  resolve: (result: DecodeResult) => void
  reject: (error: Error) => void
  timeout: ReturnType<typeof setTimeout>
}

export type DecoderWorkerClient = {
  decodeInput: (input: DecodeInput, overrides?: Record<string, string>) => Promise<DecodeResult>
  terminate: () => void
}

export function createDecoderWorkerClient(
  createWorker: () => DecoderWorkerLike,
  timeoutMs = 15_000,
): DecoderWorkerClient {
  let worker: DecoderWorkerLike | null = null
  let requestId = 0
  let recycleWhenIdle = false
  const pending = new Map<number, Pending>()

  const rejectAll = (error: Error) => {
    for (const request of pending.values()) {
      clearTimeout(request.timeout)
      request.reject(error)
    }
    pending.clear()
  }

  const discardWorker = () => {
    const current = worker
    worker = null
    recycleWhenIdle = false
    if (!current) return
    current.onmessage = null
    current.onerror = null
    current.onmessageerror = null
    current.terminate()
  }

  const failWorker = (error: Error) => {
    rejectAll(error)
    discardWorker()
  }

  const getWorker = () => {
    if (worker) return worker
    const next = createWorker()
    next.onmessage = (event) => {
      const request = pending.get(event.data.id)
      if (!request) return
      clearTimeout(request.timeout)
      pending.delete(event.data.id)
      if (event.data.error) request.reject(new Error(event.data.error))
      else if (event.data.result) {
        const unavailable = (node: DecodeResult['root']): boolean =>
          [node.selected, ...node.candidates].some((item) =>
            item?.warnings.some((warning) => warning.ruleId === 'LOCAL-PARSER-UNAVAILABLE'),
          ) || node.children.some(unavailable)
        // A failed ESM import is cached for the worker lifetime. Retry in a fresh realm.
        if (unavailable(event.data.result.root)) recycleWhenIdle = true
        request.resolve(event.data.result)
      } else request.reject(new Error('Decoder worker returned an invalid response.'))
      // Older and newer inputs can overlap; finish every response before clearing the realm.
      if (recycleWhenIdle && pending.size === 0) discardWorker()
    }
    next.onerror = (event) => {
      event.preventDefault?.()
      failWorker(new Error(event.message || 'Decoder worker failed.'))
    }
    next.onmessageerror = () => {
      failWorker(new Error('Decoder worker returned an unreadable response.'))
    }
    worker = next
    return next
  }

  return {
    decodeInput(input, overrides) {
      const id = ++requestId
      return new Promise<DecodeResult>((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (!pending.has(id)) return
          failWorker(new Error('Decoder worker timed out.'))
        }, timeoutMs)
        pending.set(id, { resolve, reject, timeout })
        try {
          getWorker().postMessage({ id, input, ...(overrides ? { overrides } : {}) })
        } catch (error) {
          failWorker(error instanceof Error ? error : new Error('Decoder worker failed.'))
        }
      })
    },
    terminate() {
      rejectAll(new Error('Decoder worker closed.'))
      discardWorker()
    },
  }
}
