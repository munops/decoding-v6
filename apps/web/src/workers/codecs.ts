import { LocalParserUnavailableError, type DecodeCodecs, type DecodeLimits } from '@decoding/engine'
async function loadParser<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load()
  } catch {
    throw new LocalParserUnavailableError()
  }
}
function collector(limits: DecodeLimits, inputBytes: number) {
  const chunks: Uint8Array[] = []
  let size = 0
  return {
    push(chunk: Uint8Array) {
      size += chunk.length
      if (size > limits.maxExpandedBytes || size > inputBytes * limits.maxCompressionRatio)
        throw new Error('Expansion limit')
      chunks.push(new Uint8Array(chunk))
    },
    finish() {
      const output = new Uint8Array(size)
      let offset = 0
      for (const chunk of chunks) {
        output.set(chunk, offset)
        offset += chunk.length
      }
      return output
    },
  }
}
let brotliModule: Promise<typeof import('brotli-dec-wasm/web')> | undefined
function loadBrotliModule() {
  return (brotliModule ??= (async () => {
    const module = await loadParser(() => import('brotli-dec-wasm/web'))
    await loadParser(() => module.default())
    return module
  })().catch((error) => {
    brotliModule = undefined
    throw error
  }))
}
export async function decodeBrotliStream(
  bytes: Uint8Array,
  limits: DecodeLimits,
  loadBrotli: () => Promise<typeof import('brotli-dec-wasm/web')> = loadBrotliModule,
) {
  const brotli = await loadBrotli()
  const stream = new brotli.DecompressStream()
  const output = collector(limits, bytes.length)
  let offset = 0
  const started = performance.now()
  try {
    for (let step = 0; step < Math.ceil(limits.maxExpandedBytes / 16384) + 2; step++) {
      const next = stream.decompress(bytes.subarray(offset), 16384)
      try {
        offset += next.input_offset
        output.push(next.buf)
        if (performance.now() - started > limits.maxCpuMs) throw new Error('Brotli CPU limit')
        if (next.code === brotli.BrotliStreamResultCode.ResultSuccess) {
          if (offset !== bytes.length) throw new Error('Trailing Brotli data')
          return { output: output.finish(), consumedInputBytes: offset, complete: true }
        }
        if (next.code !== brotli.BrotliStreamResultCode.NeedsMoreOutput)
          throw new Error('Invalid or incomplete Brotli stream')
      } finally {
        next.free()
      }
    }
    throw new Error('Expansion limit')
  } finally {
    stream.free()
  }
}
export const webCodecs: DecodeCodecs = {
  async zstd(bytes, limits) {
    const { Decompress } = await loadParser(() => import('fzstd'))
    const output = collector(limits, bytes.length)
    new Decompress((chunk) => output.push(chunk)).push(bytes, true)
    return output.finish()
  },
  async msgpack(bytes) {
    const { decode } = await loadParser(() => import('@msgpack/msgpack'))
    return decode(bytes, {
      maxStrLength: 10 * 1024 * 1024,
      maxBinLength: 10 * 1024 * 1024,
      maxArrayLength: 10000,
      maxMapLength: 10000,
      maxExtLength: 1024 * 1024,
      useBigInt64: true,
    })
  },
  async cbor(bytes) {
    const { decode } = await loadParser(() => import('cbor-x'))
    return decode(bytes)
  },
  async toml(text) {
    const { parse } = await loadParser(() => import('smol-toml'))
    return parse(text, { integersAsBigInt: 'asNeeded', unsafeKeyBehaviour: 'throw' })
  },
  brotli: async (bytes, limits) => (await decodeBrotliStream(bytes, limits)).output,
  brotliProbe: decodeBrotliStream,
}
