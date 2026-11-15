import type { Detector } from '../../types'
import { found } from '../common'
const numeric = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i
const round = (value: number) => Math.round(value * 1000) / 1000
function number(raw: string, scale: number): number | null {
  const percentage = raw.endsWith('%'),
    text = percentage ? raw.slice(0, -1) : raw
  if (!numeric.test(text)) return null
  const value = Number(text) * (percentage ? scale / 100 : 1)
  return Number.isFinite(value) && value >= 0 && value <= scale ? value : null
}
export function parseColor(text: string) {
  let channels: number[],
    alpha = 1
  if (/^#[\da-f]{3,4}$/i.test(text))
    text = '#' + [...text.slice(1)].map((char) => char + char).join('')
  if (/^#[\da-f]{6}(?:[\da-f]{2})?$/i.test(text)) {
    channels = [1, 3, 5].map((at) => parseInt(text.slice(at, at + 2), 16))
    if (text.length === 9) alpha = parseInt(text.slice(7), 16) / 255
  } else {
    const match = /^(rgb|rgba|hsl|hsla)\(\s*([^()]+)\s*\)$/i.exec(text)
    if (!match) return null
    const body = match[2]!,
      commas = body.includes(',')
    if (commas && body.includes('/')) return null
    const terms = commas
      ? body.split(',').map((term) => term.trim())
      : body.split('/')[0]!.trim().split(/\s+/)
    if (!commas && body.split('/').length > 2) return null
    const alphaText = commas
      ? terms.length === 4
        ? terms.pop()
        : undefined
      : body.split('/')[1]?.trim()
    if (terms.length !== 3 || terms.some((term) => !term)) return null
    if (alphaText !== undefined) {
      const value = number(alphaText, 1)
      if (value === null) return null
      alpha = value
    }
    if (/^rgb/i.test(match[1]!)) {
      if (commas && new Set(terms.map((term) => term.endsWith('%'))).size > 1) return null
      const values = terms.map((term) => number(term, 255))
      if (values.some((value) => value === null)) return null
      channels = values as number[]
    } else {
      const hueMatch = /^([+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?)(deg|grad|rad|turn)?$/i.exec(
        terms[0]!,
      )
      if (!hueMatch || !terms[1]!.endsWith('%') || !terms[2]!.endsWith('%')) return null
      const multiplier = (
        { deg: 1, grad: 0.9, rad: 180 / Math.PI, turn: 360 } as Record<string, number>
      )[hueMatch[2]?.toLowerCase() ?? 'deg']!
      const hue = Number(hueMatch[1]) * multiplier,
        s = number(terms[1]!, 100),
        l = number(terms[2]!, 100)
      if (!Number.isFinite(hue) || s === null || l === null) return null
      const h = (((hue % 360) + 360) % 360) / 60,
        c = ((1 - Math.abs((2 * l) / 100 - 1)) * s) / 100,
        x = c * (1 - Math.abs((h % 2) - 1)),
        m = l / 100 - c / 2
      const sectors = [
        [c, x, 0],
        [x, c, 0],
        [0, c, x],
        [0, x, c],
        [x, 0, c],
        [c, 0, x],
      ]
      channels = sectors[Math.floor(h)]!.map((value) => (value + m) * 255)
    }
  }
  const [r, g, b] = channels.map((value) => Math.round(value)) as [number, number, number]
  const maximum = Math.max(r, g, b) / 255,
    minimum = Math.min(r, g, b) / 255,
    delta = maximum - minimum,
    lightness = (maximum + minimum) / 2
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))
  const hue =
    delta === 0
      ? 0
      : maximum === r / 255
        ? ((g - b) / 255 / delta + 6) % 6
        : maximum === g / 255
          ? (b - r) / 255 / delta + 2
          : (r - g) / 255 / delta + 4
  const hex =
    '#' +
    [r, g, b, ...(alpha < 1 ? [Math.round(alpha * 255)] : [])]
      .map((value) => value.toString(16).padStart(2, '0'))
      .join('')
  return {
    hex,
    rgb: `rgb(${r} ${g} ${b}${alpha < 1 ? ' / ' + round(alpha) : ''})`,
    hsl: `hsl(${round(hue * 60)} ${round(saturation * 100)}% ${round(lightness * 100)}%${alpha < 1 ? ' / ' + round(alpha) : ''})`,
    alpha: round(alpha),
  }
}
export const color: Detector = {
  id: 'color',
  detect(input) {
    if (
      typeof input !== 'string' ||
      input.length > 256 ||
      !/^\s*(?:#|rgba?\(|hsla?\()/i.test(input)
    )
      return null
    const value = parseColor(input.trim())
    return value ? found('color', 'sRGB color', value, 0.999) : null
  },
}
