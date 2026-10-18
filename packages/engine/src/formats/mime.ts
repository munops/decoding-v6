import type { Detector } from '../types'
import { decodeBase64, inputText } from '../utils'
import { found } from './common'
export const mime: Detector = {
  id: 'mime',
  detect(input) {
    const text = inputText(input)
    const encoded = /=\?([^?]+)\?([BQ])\?([^?]*)\?=/gi
    if (encoded.test(text)) {
      encoded.lastIndex = 0
      const charsets: string[] = []
      const decoded = text.replace(encoded, (all, charset: string, kind: string, body: string) => {
        charsets.push(charset)
        try {
          const bytes =
            kind.toUpperCase() === 'B'
              ? decodeBase64(body)
              : Uint8Array.from(
                  body
                    .replace(/_/g, ' ')
                    .replace(/=([\da-f]{2})/gi, (_, h: string) =>
                      String.fromCharCode(parseInt(h, 16)),
                    ),
                  (c) => c.charCodeAt(0),
                )
          return bytes ? new TextDecoder(charset).decode(bytes) : all
        } catch {
          return all
        }
      })
      return found('mime', 'MIME encoded words', decoded, 0.995, {
        decoded,
        metadata: { charsets },
      })
    }
    if (!/=[\da-f]{2}/i.test(text) || !/(?:=[89a-f][\da-f]){2}|=\r?\n/i.test(text)) return null
    const bytes = Uint8Array.from(
      text
        .replace(/=\r?\n/g, '')
        .replace(/=([\da-f]{2})/gi, (_, h: string) => String.fromCharCode(parseInt(h, 16))),
      (c) => c.charCodeAt(0),
    )
    const decoded = inputText(bytes)
    return found('mime', 'Quoted-printable', decoded, 0.98, { decoded })
  },
}
