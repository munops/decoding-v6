import type { Detector } from '../types'
import { inputText } from '../utils'
import { found, warning } from './common'
export const dnsTxt: Detector = {
  id: 'dns-txt',
  detect(input) {
    const text = inputText(input).trim().replace(/^"|"$/g, '')
    if (!/^v=(?:spf1|DMARC1|DKIM1)\b/i.test(text)) return null
    const isSpf = /^v=spf1/i.test(text),
      tags = isSpf
        ? text.split(/\s+/)
        : text
            .split(';')
            .map((x) => x.trim())
            .filter(Boolean)
    const meanings: Record<string, string> = {
      include: 'Include another SPF policy',
      ip4: 'Allow an IPv4 range',
      ip6: 'Allow an IPv6 range',
      all: 'Default sender policy',
      p: 'Domain policy',
      rua: 'Aggregate reports',
      ruf: 'Failure reports',
      adkim: 'DKIM alignment',
      aspf: 'SPF alignment',
      k: 'Public key algorithm',
      v: 'Version',
    }
    return found(
      'dns-txt',
      isSpf ? 'SPF policy' : /^v=DMARC1/i.test(text) ? 'DMARC policy' : 'DKIM public record',
      {
        tags: tags.map((tag) => ({
          tag,
          meaning: meanings[tag.split(/[=:]/)[0] ?? ''] ?? 'Unknown tag; preserved unchanged',
        })),
      },
      0.999,
      {
        warnings: /\+all\b|\bp=none\b/i.test(text)
          ? [
              warning(
                'DNS-WEAK-POLICY',
                'This DNS policy permits all senders or monitors without enforcement.',
              ),
            ]
          : [],
      },
    )
  },
}
