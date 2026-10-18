import type { DecodeCodecs, DecodeLimits } from '@decoding/engine'
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
export const webCodecs: DecodeCodecs = {
  async zstd(bytes, limits) {
    const { Decompress } = await import('fzstd')
    const output = collector(limits, bytes.length)
    new Decompress((chunk) => output.push(chunk)).push(bytes, true)
    return output.finish()
  },
  async msgpack(bytes) {
    const { decode } = await import('@msgpack/msgpack')
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
    const { decode } = await import('cbor-x')
    return decode(bytes)
  },
  async toml(text) {
    const { parse } = await import('smol-toml')
    return parse(text, { integersAsBigInt: 'asNeeded', unsafeKeyBehaviour: 'throw' })
  },
  async brotli(bytes, limits) {
    const module = await import('brotli-dec-wasm')
    const brotli = await module.default
    const stream = new brotli.DecompressStream()
    const output = collector(limits, bytes.length)
    let offset = 0
    try {
      for (let step = 0; step < Math.ceil(limits.maxExpandedBytes / 16384) + 2; step++) {
        const next = stream.decompress(bytes.subarray(offset), 16384)
        offset += next.input_offset
        output.push(next.buf)
        if (next.code === brotli.BrotliStreamResultCode.ResultSuccess) return output.finish()
        if (next.code !== brotli.BrotliStreamResultCode.NeedsMoreOutput)
          throw new Error('Invalid or incomplete Brotli stream')
      }
      throw new Error('Expansion limit')
    } finally {
      stream.free()
    }
  },
}
