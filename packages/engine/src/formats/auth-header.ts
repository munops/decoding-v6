import type { Detector } from '../types'
import { decodeBase64, inputText } from '../utils'
import { found, warning } from './common'
export const authHeader: Detector = {
  id: 'auth-header',
  detect(input) {
    const match = /^(?:Authorization:\s*)?(Bearer|Basic)\s*(.*)$/is.exec(inputText(input).trim())
    if (!match) return null
    const scheme = match[1]?.toLowerCase(),
      body = match[2]?.trim() ?? ''
    if (!body)
      return found('auth-header', 'Authorization', { scheme, error: 'Header value is empty' }, 0.99)
    if (scheme === 'bearer')
      return found('auth-header', 'Authorization: Bearer', { scheme: 'Bearer' }, 0.999, {
        decoded: body,
      })
    const bytes = decodeBase64(body)
    if (!bytes)
      return found('auth-header', 'Authorization: Basic', { error: 'Invalid Base64' }, 0.99)
    const [user, ...password] = inputText(bytes).split(':')
    return found(
      'auth-header',
      'Authorization: Basic',
      { user, password: password.length ? '****' : '(missing)' },
      0.999,
      {
        warnings: [
          warning(
            'BASIC-CREDENTIAL',
            'Basic credentials are reversible. Password hidden; rotate exposed credentials.',
          ),
        ],
      },
    )
  },
}
