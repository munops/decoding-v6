import type { Detector } from '../types'
import { decodeBase64, inputText, printableRatio } from '../utils'
import { found, maskFields, warning } from './common'
export const jsonDeep: Detector = {
  id: 'json-deep',
  detect(input, context) {
    const text = inputText(input).trim()
    if (!/^[{[]/.test(text)) return null
    try {
      const value: unknown = JSON.parse(text),
        matches: Array<{ path: string; encoding: string; encoded: string }> = []
      let nodes = 0
      const visit = (v: unknown, path: string) => {
        if (++nodes > context.limits.maxNodes) return
        if (typeof v === 'string') {
          if (/^[\w-]+\.[\w-]+\.[\w-]*$/.test(v))
            matches.push({ path, encoding: 'JWT', encoded: v })
          else if (
            /^[A-Za-z0-9+/_-]+={0,2}$/.test(v) &&
            v.length >= 12 &&
            v.length % 4 !== 1 &&
            printableRatio(decodeBase64(v) ?? new Uint8Array()) > 0.85
          )
            matches.push({ path, encoding: 'Base64', encoded: v })
          else if (/%[\da-f]{2}/i.test(v))
            matches.push({ path, encoding: 'URL encoding', encoded: v })
        } else if (v && typeof v === 'object')
          for (const [k, x] of Object.entries(v)) visit(x, `${path}.${k}`)
      }
      visit(value, '$')
      return matches.length
        ? found(
            'json-deep',
            'Encoded JSON fields',
            {
              structure: maskFields(value),
              fields: matches.map(({ path, encoding }) => ({ path, encoding })),
            },
            0.7,
            {
              metadata: { embedded: matches },
              warnings:
                nodes > context.limits.maxNodes
                  ? [
                      warning(
                        'JSON-MORE-NODES',
                        'More fields exist beyond the 64-node scan limit.',
                        'info',
                      ),
                    ]
                  : [],
            },
          )
        : null
    } catch {
      return null
    }
  },
}
