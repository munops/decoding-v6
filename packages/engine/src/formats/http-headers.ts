import type { Detector } from '../types'
import { inputText } from '../utils'
import { mime } from './mime'
import { encodedFields, found, sensitiveKey, warning } from './common'
export const httpHeaders: Detector = {
  id: 'http-headers',
  async detect(input, context) {
    const text = inputText(input).trim(),
      lines = text.replace(/\r?\n[ \t]+/g, ' ').split(/\r?\n/)
    let startLine: string | undefined
    if (/^(?:HTTP\/\d|(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s)/.test(lines[0] ?? ''))
      startLine = lines.shift()
    if (
      !lines.length ||
      !lines.every((x) => /^[\w-]+:\s*[^\r\n]*$/.test(x)) ||
      (!startLine && lines.length < 2)
    )
      return null
    const mail =
      lines.filter((line) => /^(?:From|To|Subject|Received|Date|Message-ID|Reply-To):/i.test(line))
        .length >= 2
    if (
      !startLine &&
      !mail &&
      !lines.some((line) =>
        /^(?:Content-Type|Content-Length|Host|Cache-Control|Authorization|Cookie|Set-Cookie|Accept|User-Agent):/i.test(
          line,
        ),
      )
    )
      return null
    const raw = (name: string) =>
      lines
        .find((line) => line.toLowerCase().startsWith(`${name}:`))
        ?.slice(name.length + 1)
        .trim() ?? ''
    const mailbox = (value: string) =>
      (
        value.match(/<([^>]+@[^>]+)>/)?.[1] ??
        value.match(/[\w.+-]+@[\w.-]+/)?.[0] ??
        ''
      ).toLowerCase()
    const from = mailbox(raw('from')),
      replyTo = mailbox(raw('reply-to'))
    const subject = mail ? await mime.detect(raw('subject'), context) : null
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
    if (mail && from && replyTo && replyTo !== from)
      warnings.push(warning('MAIL-REPLY-TO', 'MAIL-REPLY-TO'))
    const displayAddress = raw('from')
      .split('<')[0]
      ?.match(/[\w.+-]+@[\w.-]+/)?.[0]
      ?.toLowerCase()
    if (mail && from && displayAddress && displayAddress !== from)
      warnings.push(warning('MAIL-DISPLAY-ADDRESS', 'MAIL-DISPLAY-ADDRESS'))
    return found(
      'http-headers',
      mail ? 'Mail headers' : 'HTTP headers',
      { startLine, headers: entries },
      0.999,
      {
        warnings,
        metadata: {
          kind: mail ? 'mail' : 'http',
          ...(mail
            ? {
                sender: from,
                receivedCount: lines.filter((line) => /^Received:/i.test(line)).length,
                subject: subject?.value ?? raw('subject'),
              }
            : {}),
          embedded: encodedFields(
            lines.map((line) => ({
              name: line.slice(0, line.indexOf(':')),
              raw: line.slice(line.indexOf(':') + 1).trim(),
            })),
          ),
        },
      },
    )
  },
}
