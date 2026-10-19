import type { Detector } from '../types'
import { inputText } from '../utils'
import { found, warning } from './common'
export const xml: Detector = {
  id: 'xml',
  detect(input) {
    const text = inputText(input).trim()
    if (!/^<\??[A-Za-z_]/.test(text) || !text.includes('>')) return null
    const root = /<([A-Za-z_][\w:.-]*)[\s/>]/.exec(text)?.[1]
    if (!root) return null
    const stack: string[] = []
    let errorOffset: number | undefined
    for (const match of text.matchAll(/<(\/?)([\w:.-]+)\b[^>]*(\/?)>/g)) {
      if (match[1]) {
        if (stack.pop() !== match[2] && errorOffset === undefined) errorOffset = match.index
      } else if (!match[3]) stack.push(match[2]!)
    }
    if (stack.length && errorOffset === undefined) errorOffset = text.length
    const prefix = text.slice(0, errorOffset).split('\n')
    const position =
      errorOffset === undefined
        ? {}
        : { offset: errorOffset, line: prefix.length, column: (prefix.at(-1)?.length ?? 0) + 1 }
    return found('xml', 'XML', { root, xml: text, ...position }, 0.98, {
      warnings:
        errorOffset !== undefined
          ? [
              warning(
                'XML-MALFORMED',
                `Mismatched or unclosed XML element at line ${position.line}, column ${position.column} (offset ${position.offset}). Untrusted XML is never executed.`,
              ),
            ]
          : [],
      metadata: { detail: 'xml' },
    })
  },
}
