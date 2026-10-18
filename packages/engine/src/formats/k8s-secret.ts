import type { Detector } from '../types'
import { decodeBase64, inputText } from '../utils'
import { found, warning } from './common'
export const k8sSecret: Detector = {
  id: 'k8s-secret',
  detect(input) {
    const text = inputText(input)
    if (!/^\s*kind:\s*Secret\s*$/m.test(text) || !/^\s*apiVersion:/m.test(text)) return null
    const data = /^data:\s*\n((?:[ \t]+[^\n]*\n?)*)/m.exec(text)?.[1] ?? '',
      entries = data
        .trim()
        .split(/\n/)
        .filter(Boolean)
        .map((line) => {
          const match = /^\s*([^:]+):\s*['"]?([^'"\s]+)['"]?/.exec(line)
          if (!match) return { name: '(invalid)', value: '[redacted]' }
          const bytes = decodeBase64(match[2] ?? '')
          return {
            name: match[1],
            value: '[redacted]',
            decoded: bytes ? inputText(bytes) : '(invalid Base64)',
          }
        })
    const stringData = /^stringData:\s*\n((?:[ \t]+[^\n]*\n?)*)/m.exec(text)?.[1]
    const plaintext = (stringData ?? '')
      .trim()
      .split(/\n/)
      .filter(Boolean)
      .map((line) => {
        const match = /^\s*([^:]+):\s*(.*)$/.exec(line)
        return {
          name: `stringData.${match?.[1] ?? '(invalid)'}`,
          value: '[redacted]',
          decoded: (match?.[2] ?? '').replace(/^(['"])([\s\S]*)\1$/, '$2'),
        }
      })
    return found(
      'k8s-secret',
      'Kubernetes Secret',
      {
        entries: entries.map(({ name, value }) => ({ name, value })),
        stringData: stringData ? '[redacted; already plaintext]' : undefined,
      },
      0.999,
      {
        metadata: {
          secretFields: [...entries, ...plaintext].filter(
            (entry): entry is { name: string; value: string; decoded: string } =>
              typeof entry.name === 'string' &&
              'decoded' in entry &&
              typeof entry.decoded === 'string',
          ),
        },
        warnings: [
          warning(
            'K8S-SECRET-PLAINTEXT',
            'Base64 is encoding, not encryption. Expand values only in a trusted environment.',
          ),
        ],
      },
    )
  },
}
