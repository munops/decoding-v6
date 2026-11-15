import type { Detector } from '../../types'
import { found, warning } from '../common'
export const userAgent: Detector = {
  id: 'user-agent',
  detect(input) {
    if (typeof input !== 'string' || input.length > 8192) return null
    const text = input.trim().replace(/^User-Agent:\s*/i, '')
    if (!/^Mozilla\/5\.0\s*\(/.test(text) || /[\r\n]/.test(text)) return null
    const candidates: [RegExp, string][] = [
      [/\bEdg(?:A|iOS)?\/([\d.]+)/, 'Edge'],
      [/\b(?:OPR|OPT)\/([\d.]+)/, 'Opera'],
      [/\bFxiOS\/([\d.]+)/, 'Firefox'],
      [/\bCriOS\/([\d.]+)/, 'Chrome'],
      [/\bFirefox\/([\d.]+)/, 'Firefox'],
      [/\bChrome\/([\d.]+)/, 'Chrome'],
      [/\bVersion\/([\d.]+).*\bSafari\//, 'Safari'],
    ]
    const browser = candidates
      .map(([pattern, name]) => ({ name, version: pattern.exec(text)?.[1] }))
      .find((item) => item.version)
    if (!browser) return null
    const os = /iPhone|iPad|iPod/.test(text)
      ? 'iOS'
      : /Android/.test(text)
        ? 'Android'
        : /Windows NT/.test(text)
          ? 'Windows'
          : /CrOS/.test(text)
            ? 'ChromeOS'
            : /Mac OS X/.test(text)
              ? 'macOS'
              : /Linux/.test(text)
                ? 'Linux'
                : 'unknown'
    const device = /iPhone/.test(text)
      ? 'iPhone'
      : /iPad/.test(text)
        ? 'iPad'
        : os === 'Android'
          ? /Mobile/.test(text)
            ? 'Android mobile'
            : 'Android tablet'
          : os
    return found(
      'user-agent',
      'User-Agent',
      { browser: browser.name, version: browser.version, os, device },
      0.995,
      { warnings: [warning('UA-SELF-REPORTED', { code: 'warning-ua-self-reported' }, 'info')] },
    )
  },
}
