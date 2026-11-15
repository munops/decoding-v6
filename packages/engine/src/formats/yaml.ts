import { diagnosticField } from '../diagnostics'
import type { Detector } from '../types'
import { inputText } from '../utils'
import { found } from './common'
export const yaml: Detector = {
  id: 'yaml',
  detect(input) {
    const text = inputText(input).trim()
    if (/^\s*kind:\s*Secret\s*$/m.test(text)) return null
    if (!/^---(?:\s|$)/.test(text) && !/^\s*[\w.-]+:\s+\S/m.test(text)) return null
    if (text.split(/\r?\n/).length < 2 || /^\{/.test(text) || /^(?:https?:|HTTP\/)/i.test(text))
      return null
    return found(
      'yaml',
      'YAML',
      { note: diagnosticField({ code: 'diagnostic-yaml-note' }) },
      0.97,
      { metadata: { detail: 'yaml' } },
    )
  },
}
