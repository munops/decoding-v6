import { Gunzip, Inflate, Unzlib } from 'fflate'
import type { DecodeLimits } from './types'
export class ExpansionLimit extends Error {}
/** Stream small compressed slices; never allocate the entire unchecked expansion. */
export function boundedInflate(
  bytes: Uint8Array,
  format: 'gzip' | 'zlib' | 'deflate',
  limits: DecodeLimits,
): Uint8Array {
  const chunks: Uint8Array[] = []
  let size = 0
  const collect = (chunk: Uint8Array) => {
    size += chunk.length
    if (size > limits.maxExpandedBytes || size > bytes.length * limits.maxCompressionRatio)
      throw new ExpansionLimit('Expansion limit')
    chunks.push(chunk)
  }
  const stream =
    format === 'gzip'
      ? new Gunzip(collect)
      : format === 'zlib'
        ? new Unzlib(collect)
        : new Inflate(collect)
  for (let offset = 0; offset < bytes.length; offset += 1024)
    stream.push(bytes.subarray(offset, offset + 1024), offset + 1024 >= bytes.length)
  const result = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result
}
