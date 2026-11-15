import type { MessageFact } from '../message-facts'
export class CurlParseError extends Error {
  readonly fact: MessageFact
  constructor(code: MessageFact['code']) {
    super(code)
    this.name = 'CurlParseError'
    this.fact = { code }
  }
}
export type CurlRequest = {
  url: string
  method: string
  headers: Record<string, string>
  body?: string
  unmodeledOptions?: string[]
  shellExpressions?: boolean
  bodyFromFile?: boolean
}
function words(source: string) {
  const result: string[] = []
  let word = '',
    quote: '"' | "'" | null = null,
    escaped = false,
    started = false,
    shellExpressions = false
  for (let index = 0; index < source.length; index++) {
    const char = source[index]!
    if (escaped) {
      if (char === '\r' && source[index + 1] === '\n') index++
      else if (char !== '\n')
        word += quote === '"' && !['$', '`', '"', '\\'].includes(char) ? '\\' + char : char
      escaped = false
      continue
    }
    if (char === '\\' && quote !== "'") {
      escaped = true
      started = true
      continue
    }
    if (
      quote !== "'" &&
      (char === '`' || (char === '$' && /[A-Za-z0-9_({?*#!@$-]/.test(source[index + 1] ?? '')))
    )
      shellExpressions = true
    if (quote) {
      if (char === quote) quote = null
      else word += char
      started = true
    } else if (char === '"' || char === "'") {
      quote = char
      started = true
    } else if (/\s/.test(char)) {
      if (started) result.push(word)
      word = ''
      started = false
    } else {
      word += char
      started = true
    }
  }
  if (quote || escaped) throw new CurlParseError('diagnostic-curl-unclosed')
  if (started) result.push(word)
  return { args: result, shellExpressions }
}
/** Literal request reader shared with code conversion. No shell, file or network access. */
export function parseCurlRequest(source: string): CurlRequest {
  if (source.length > 1_048_576) throw new CurlParseError('diagnostic-curl-size')
  const { args, shellExpressions } = words(
    source.trim().replace(/^(?:curl(?:\.exe)?|\/[\w./-]*curl)\s+/i, ''),
  )
  let url = '',
    method = 'GET',
    body: string | undefined,
    explicit = false,
    bodyFromFile = false
  const headers: Record<string, string> = Object.create(null),
    unmodeledOptions: string[] = []
  for (let index = 0; index < args.length; index++) {
    let option = args[index]!,
      inline: string | undefined
    const equal = option.indexOf('=')
    if (option.startsWith('--') && equal > 0) {
      inline = option.slice(equal + 1)
      option = option.slice(0, equal)
    } else if (/^-[XHd].+/.test(option)) {
      inline = option.slice(2)
      option = option.slice(0, 2)
    }
    const next = () => {
      const value = inline ?? args[++index]
      if (value === undefined) throw new CurlParseError('diagnostic-curl-argument')
      return value
    }
    if (['-X', '--request'].includes(option)) {
      method = next().toUpperCase()
      explicit = true
      if (!/^[A-Z0-9_-]+$/.test(method)) throw new CurlParseError('diagnostic-curl-method')
    } else if (['-H', '--header'].includes(option)) {
      const header = next(),
        separator = header.indexOf(':')
      if (separator < 1 || /[\r\n]/.test(header)) throw new CurlParseError('diagnostic-curl-header')
      const name = header.slice(0, separator).trim(),
        value = header.slice(separator + 1).trim()
      if (Object.keys(headers).some((key) => key.toLowerCase() === name.toLowerCase()))
        unmodeledOptions.push('--header')
      headers[name] = value
    } else if (['-d', '--data', '--data-raw', '--data-binary'].includes(option)) {
      const value = next()
      body = body === undefined ? value : body + '&' + value
      if (!explicit) method = 'POST'
      if (option !== '--data-raw' && value.startsWith('@')) bodyFromFile = true
    } else if (option === '--url') url = next()
    else if (['-I', '--head'].includes(option)) {
      method = 'HEAD'
      explicit = true
    } else if (
      ['-s', '-S', '--silent', '--show-error', '-v', '--verbose', '-i', '--include'].includes(
        option,
      )
    ) {
      /* output-only flags */
    } else if (/^https?:\/\//i.test(option)) url = option
    else if (option.startsWith('-'))
      unmodeledOptions.push(/^--?[A-Za-z0-9-]+/.exec(option)?.[0] ?? 'unknown-option')
    else unmodeledOptions.push('unparsed-argument')
  }
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) throw 0
  } catch {
    throw new CurlParseError('diagnostic-curl-url')
  }
  return {
    url,
    method,
    headers,
    ...(body === undefined ? {} : { body }),
    ...(unmodeledOptions.length ? { unmodeledOptions: [...new Set(unmodeledOptions)] } : {}),
    ...(shellExpressions ? { shellExpressions: true } : {}),
    ...(bodyFromFile ? { bodyFromFile: true } : {}),
  }
}
