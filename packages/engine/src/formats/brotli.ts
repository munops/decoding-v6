import type { DecodeInput, DetectorContext, Detection } from '../types'
import { isProbablyUtf8 } from '../utils'
import { identifyMagic } from './magic-bytes'
import { found, readable, warning } from './common'
/** No magic signature: classify only after a bounded, fully consumed local decode. */
export async function detectBrotli(
  input: DecodeInput,
  context: DetectorContext,
): Promise<Detection | null> {
  if (
    typeof input === 'string' ||
    input.length < 4 ||
    input.length > 65536 ||
    !context.codecs?.brotliProbe ||
    isProbablyUtf8(input) ||
    (identifyMagic(input) && identifyMagic(input)?.extension !== 'gz')
  )
    return null
  const limits = {
    ...context.limits,
    maxExpandedBytes: Math.min(context.limits.maxExpandedBytes, 1_048_576),
    maxCpuMs: Math.min(context.limits.maxCpuMs, 100),
  }
  try {
    const probe = await context.codecs.brotliProbe(input, limits)
    if (!probe.complete || probe.consumedInputBytes !== input.length) return null
    const bytes = probe.output
    if (
      !bytes.length ||
      bytes.length > limits.maxExpandedBytes ||
      bytes.length / input.length > limits.maxCompressionRatio
    )
      return null
    const output = readable(bytes)
    return found(
      'compression',
      'Brotli stream',
      {
        compressedBytes: input.length,
        expandedBytes: bytes.length,
        ratio: bytes.length / input.length,
      },
      identifyMagic(input)
        ? 0.78
        : typeof output === 'string' || identifyMagic(bytes)
          ? 0.95
          : 0.78,
      {
        decoded: output,
        warnings: [warning('BROTLI-TRIAL-DECODE', { code: 'warning-brotli-trial' }, 'info')],
      },
    )
  } catch {
    return null
  }
}
