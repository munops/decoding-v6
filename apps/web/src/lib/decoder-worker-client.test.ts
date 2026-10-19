import { decode, LocalParserUnavailableError } from '@decoding/engine'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createDecoderWorkerClient, type DecoderWorkerLike } from './decoder-worker-client'

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

it('retains the unavailable result and recreates the failed import realm on retry', async () => {
  const first = new FakeWorker(),
    second = new FakeWorker()
  const workers = [first, second]
  const client = createDecoderWorkerClient(() => workers.shift()!)
  const input = '[owner]\nname = "local"'
  const result = await decode(input, {
    codecs: {
      toml: async () => {
        throw new LocalParserUnavailableError()
      },
    },
  })
  const pending = client.decodeInput(input)
  first.onmessage?.({ data: { id: 1, result } } as MessageEvent)
  expect(await pending).toEqual(result)
  expect(first.terminate).toHaveBeenCalledOnce()
  const retried = client.decodeInput(input)
  expect(second.postMessage).toHaveBeenCalledWith({ id: 2, input })
  second.onmessage?.({ data: { id: 2, result: await decode('{"ok":true}') } } as MessageEvent)
  await retried
  client.terminate()
})

it('does not orphan newer concurrent input when an older response needs a fresh parser realm', async () => {
  const worker = new FakeWorker()
  const client = createDecoderWorkerClient(() => worker, 100)
  const older = client.decodeInput('[owner]\nname = "older"')
  const latest = client.decodeInput('[owner]\nname = "latest"')
  const unavailable = await decode('[owner]\nname = "older"', {
    codecs: {
      toml: async () => {
        throw new LocalParserUnavailableError()
      },
    },
  })
  worker.onmessage?.({ data: { id: 1, result: unavailable } } as MessageEvent)
  await older
  expect(worker.terminate).not.toHaveBeenCalled()
  const result = await decode('{"latest":true}')
  worker.onmessage?.({ data: { id: 2, result } } as MessageEvent)
  await expect(latest).resolves.toEqual(result)
  expect(worker.terminate).toHaveBeenCalledOnce()
  client.terminate()
})
