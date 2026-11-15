import type { Detector } from '../../types'
import { parseCurlRequest } from '../curl-request'
import { found, maskFields, warning } from '../common'
export const curlCommand: Detector = {
  id: 'curl-command',
  detect(input) {
    if (typeof input !== 'string' || !/^\s*(?:curl(?:\.exe)?|\/[\w./-]*curl)\s/i.test(input))
      return null
    try {
      const request = parseCurlRequest(input)
      return found('curl-command', 'cURL HTTP request', maskFields(request), 0.999, {
        warnings: [
          warning('CURL-TEXT-ONLY', { code: 'warning-curl-text-only' }, 'info'),
          ...(request.unmodeledOptions
            ? [
                warning('CURL-UNMODELED', {
                  code: 'warning-curl-unmodeled',
                  params: { optionCount: request.unmodeledOptions.length },
                }),
              ]
            : []),
          ...(request.shellExpressions
            ? [warning('CURL-SHELL-LITERAL', { code: 'warning-curl-shell-literal' })]
            : []),
          ...(request.bodyFromFile
            ? [warning('CURL-FILE-BODY', { code: 'warning-curl-file-body' })]
            : []),
        ],
        metadata: { tool: 'curl-to-code' },
      })
    } catch {
      return null
    }
  },
}
