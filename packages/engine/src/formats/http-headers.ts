import type { Detector } from '../types'
import { inputText } from '../utils'
import { encodedFields, found, sensitiveKey, warning } from './common'
export const httpHeaders: Detector = {
  id: 'http-headers',
  detect(input) {
    const text = inputText(input).trim(),
      lines = text.split(/\r?\n/)
    let startLine: string | undefined
    if (/^(?:HTTP\/\d|(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s)/.test(lines[0] ?? ''))
      startLine = lines.shift()
    if (
      !lines.length ||
      !lines.every((x) => /^[\w-]+:\s*[^\r\n]*$/.test(x)) ||
      (!startLine && lines.length < 2)
    )
      return null
    const entries = lines.map((line) => {
      const i = line.indexOf(':'),
        name = line.slice(0, i),
        value = line.slice(i + 1).trim()
      return { name, value: sensitiveKey.test(name) ? '[redacted]' : value }
    })
    const warnings =
      startLine?.startsWith('HTTP/') &&
      !entries.some((x) => x.name.toLowerCase() === 'strict-transport-security')
        ? [
            warning(
              'HTTP-NO-HSTS',
              'No HSTS header is present. Applicability depends on the response origin.',
              'info',
            ),
          ]
        : []
    return found('http-headers', 'HTTP headers', { startLine, headers: entries }, 0.999, {
      warnings,
      metadata: {
        embedded: encodedFields(
          lines.map((line) => ({
            name: line.slice(0, line.indexOf(':')),
            raw: line.slice(line.indexOf(':') + 1).trim(),
          })),
        ),
      },
    })
  },
}
