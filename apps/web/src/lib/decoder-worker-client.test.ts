import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createDecoderWorkerClient,
  type DecoderWorkerLike,
} from './decoder-worker-client'

class FakeWorker implements DecoderWorkerLike {
  onmessage: DecoderWorkerLike['onmessage'] = null
  onerror: DecoderWorkerLike['onerror'] = null
  onmessageerror: DecoderWorkerLike['onmessageerror'] = null
  terminate = vi.fn()
  postMessage = vi.fn()
}

afterEach(() => {
  vi.useRealTimers()
})

describe('decoder worker client failure closure', () => {
  it('rejects a worker error and creates a fresh worker for retry', async () => {
    const firstWorker = new FakeWorker()
    const secondWorker = new FakeWorker()
    const workers = [firstWorker, secondWorker]
    const client = createDecoderWorkerClient(() => workers.shift()!, 100)

    const first = client.decodeInput('first')
    firstWorker.onerror?.({
      message: 'worker boom',
      preventDefault: vi.fn(),
    } as unknown as ErrorEvent)
    await expect(first).rejects.toThrow('worker boom')

    const second = client.decodeInput('retry')
    expect(workers).toHaveLength(0)
    client.terminate()
    await expect(second).rejects.toThrow('closed')
  })

  it('rejects an unreadable worker message instead of staying pending', async () => {
    const worker = new FakeWorker()
    const client = createDecoderWorkerClient(() => worker, 100)
    const request = client.decodeInput('payload')

    worker.onmessageerror?.({ data: null } as MessageEvent<unknown>)

    await expect(request).rejects.toThrow('unreadable')
    expect(worker.terminate).toHaveBeenCalledOnce()
  })

  it('rejects and terminates after the request timeout', async () => {
    vi.useFakeTimers()
    const worker = new FakeWorker()
    const client = createDecoderWorkerClient(() => worker, 25)
    const request = client.decodeInput('payload')
    const rejection = expect(request).rejects.toThrow('timed out')

    await vi.advanceTimersByTimeAsync(25)

    await rejection
    expect(worker.terminate).toHaveBeenCalledOnce()
  })
})
