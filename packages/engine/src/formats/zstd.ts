import { diagnosticField } from '../diagnostics'
import type { Detector } from '../types'
import { found, readable, warning, parserUnavailable, unavailableDetection } from './common'
export const zstd: Detector = {
  id: 'zstd',
  async detect(input, context) {
    if (
      typeof input === 'string' ||
      input[0] !== 0x28 ||
      input[1] !== 0xb5 ||
      input[2] !== 0x2f ||
      input[3] !== 0xfd
    )
      return null
    if (!context.codecs?.zstd)
      return found(
        'zstd',
        'Zstandard compressed stream',
        {
          compressedBytes: input.length,
          note: diagnosticField({ code: 'diagnostic-zstd-note' }),
        },
        0.999,
        {
          warnings: [warning('CODEC-UNAVAILABLE', { code: 'warning-codec-unavailable' }, 'info')],
        },
      )
    try {
      const decoded = await context.codecs.zstd(input, context.limits)
      const ratio = decoded.length / Math.max(1, input.length)
      if (
        decoded.length > context.limits.maxExpandedBytes ||
        ratio > context.limits.maxCompressionRatio
      )
        throw new Error('Expansion limit')
      const output = readable(decoded)
      return found(
        'zstd',
        'Zstandard compressed stream',
        { expandedBytes: decoded.length, compressedBytes: input.length, ratio },
        0.999,
        { decoded: output, metadata: { bytes: decoded } },
      )
    } catch (error) {
      if (parserUnavailable(error))
        return unavailableDetection('zstd', 'Zstandard compressed stream', input, 0.999)
      return found(
        'zstd',
        'Zstandard compressed stream',
        { error: diagnosticField({ code: 'diagnostic-zstd-error' }) },
        0.999,
        {
          warnings: [
            warning('COMPRESSION-LIMIT', { code: 'warning-compression-limit-4' }, 'danger'),
          ],
        },
      )
    }
  },
}
