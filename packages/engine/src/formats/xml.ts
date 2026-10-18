import type { Detector } from '../types'
import { inputText } from '../utils'
import { found, warning } from './common'
export const xml: Detector = {
  id: 'xml',
  detect(input) {
    const text = inputText(input).trim()
    if (!/^<\??[A-Za-z_]/.test(text) || !/(?:<\/[^>]+>|\/>)$/.test(text)) return null
    const root = /<([A-Za-z_][\w:.-]*)[\s/>]/.exec(text)?.[1]
    if (!root) return null
    const stack: string[] = []
    let broken = false
    for (const match of text.matchAll(/<(\/?)([\w:.-]+)\b[^>]*(\/?)>/g)) {
      if (match[1]) {
        if (stack.pop() !== match[2]) broken = true
      } else if (!match[3]) stack.push(match[2]!)
    }
    return found('xml', 'XML', { root, xml: text }, 0.98, {
      warnings:
        broken || stack.length
          ? [
              warning(
                'XML-MALFORMED',
                'Mismatched or unclosed XML element. Untrusted XML is never executed.',
              ),
            ]
          : [],
      metadata: { detail: 'xml' },
    })
  },
}
