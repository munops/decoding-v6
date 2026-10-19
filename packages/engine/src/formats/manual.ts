import { boundedInflate } from '../bounded-inflate'
import type { DecodeInput, Detection, DetectorContext } from '../types'
import { decodeBase64, inputBytes, inputText } from '../utils'
import { found, readable, warning, parserUnavailable, unavailableDetection } from './common'
import { decode32, decode58 } from './base-n'
export async function manualDecode(
  input: DecodeInput,
  format: string,
  context: DetectorContext,
): Promise<Detection | null> {
  const bytes = inputBytes(input),
    text = inputText(input).trim()
  let output: DecodeInput | undefined
  try {
    if (format === 'base64') {
      const decoded = decodeBase64(text)
      if (!decoded) throw new Error('Invalid Base64')
      output = readable(decoded)
    } else if (format === 'hex') {
      const raw = text.replace(/^0x/i, '').replace(/[\s:-]/g, '')
      if (!raw || raw.length % 2 || !/^[0-9a-f]+$/i.test(raw)) throw new Error('Invalid hex')
      output = readable(Uint8Array.from(raw.match(/.{2}/g) ?? [], (pair) => parseInt(pair, 16)))
    } else if (format === 'base32') output = readable(decode32(text))
    else if (format === 'base58') output = readable(decode58(text))
    else if (format === 'url') output = decodeURIComponent(text.replace(/\+/g, ' '))
    else if (format === 'gzip') output = readable(boundedInflate(bytes, 'gzip', context.limits))
    else if (format === 'zlib') output = readable(boundedInflate(bytes, 'zlib', context.limits))
    else if (format === 'deflate')
      output = readable(boundedInflate(bytes, 'deflate', context.limits))
    else if (format === 'brotli') {
      if (!context.codecs?.brotli) throw new Error('Parser unavailable')
      output = readable(await context.codecs.brotli(bytes, context.limits))
    } else return null
    if (
      inputBytes(output).length > context.limits.maxExpandedBytes ||
      (['gzip', 'zlib', 'deflate', 'brotli'].includes(format) &&
        inputBytes(output).length > bytes.length * context.limits.maxCompressionRatio)
    )
      throw new Error('Expansion limit')
    return found(format, `${format} (chosen by you)`, output, 1, { decoded: output })
  } catch (error) {
    if (parserUnavailable(error))
      return unavailableDetection(format, `${format} (chosen by you)`, input, 1)
    return found(
      format,
      `${format} (chosen by you)`,
      {
        error: `Cannot decode this layer as ${format}. Check the format, or open its local parser online once and retry.`,
      },
      1,
      {
        warnings: [
          warning(
            'MANUAL-DECODE-FAILED',
            `This layer cannot be decoded as ${format}. Undo to restore automatic detection.`,
          ),
        ],
      },
    )
  }
}

export function manualFailure(format: string): Detection {
  return found(
    format,
    `${format} (chosen by you)`,
    { error: `Cannot decode this layer as ${format}.` },
    1,
    {
      warnings: [
        warning(
          'MANUAL-DECODE-FAILED',
          `This layer cannot be decoded as ${format}. Undo to restore automatic detection.`,
        ),
      ],
    },
  )
}
