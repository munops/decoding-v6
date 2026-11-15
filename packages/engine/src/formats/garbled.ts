import type { Detector } from '../types'
import { inputText } from '../utils'
import { found, warning } from './common'

const western = new TextDecoder('windows-1252')
const inverse = new Map<string, number>()
for (let i = 0; i < 256; i++) inverse.set(western.decode(Uint8Array.of(i)), i)
const suspicious = /[ÃÂìëíðÏÐæåäµ¾¿]/g
function reverse(text: string, mode: 'windows-1252' | 'latin1'): Uint8Array | null {
  const bytes = new Uint8Array(text.length)
  for (let i = 0; i < text.length; i++) {
    const n = mode === 'latin1' ? text.charCodeAt(i) : inverse.get(text[i]!)
    if (n === undefined || n > 255) return null
    bytes[i] = n
  }
  return bytes
}
function quality(text: string): number {
  const hangul = (text.match(/[가-힣]/g) ?? []).length
  const kana = (text.match(/[ぁ-ヿ]/g) ?? []).length
  const han = (text.match(/[一-鿿]/g) ?? []).length
  const common = (
    text.match(/[한글안녕하세요일본어中文你好世界繁體測試测试文字こんにちは日本語]/g) ?? []
  ).length
  return hangul * 3 + kana * 4 + han + common * 3
}
/** Inverse encoding only. No replacement characters or guessed missing letters. */
export function repairGarbled(text: string, requested?: string) {
  if (
    !text ||
    !/[\u0080-\uffff]/.test(text) ||
    text.length > 1_048_576 ||
    /[가-힣ぁ-ヿ一-鿿]/.test(text)
  )
    return null
  const candidates: Array<{ value: string; charset: string; misreadAs: string; score: number }> = []
  for (const mode of ['windows-1252', 'latin1'] as const) {
    const bytes = reverse(text, mode)
    if (!bytes || !bytes.some((b) => b >= 128)) continue
    for (const charset of requested
      ? [requested]
      : ['utf-8', 'euc-kr', 'shift_jis', 'euc-jp', 'gbk', 'big5']) {
      try {
        const value = new TextDecoder(charset, { fatal: true }).decode(bytes)
        if (
          value === text ||
          Array.from(value).some(
            (c) => c === '\ufffd' || (c.charCodeAt(0) < 32 && !'\t\r\n'.includes(c)),
          )
        )
          continue
        const before = (text.match(suspicious) ?? []).length
        const after = (value.match(suspicious) ?? []).length
        if (charset === 'utf-8') {
          if (before > after || quality(value) >= 3)
            candidates.push({ value, charset, misreadAs: mode, score: 1000 + quality(value) })
        } else {
          const highRatio = bytes.filter((b) => b >= 128).length / bytes.length
          if (
            highRatio > 0.5 &&
            quality(value) >= 8 &&
            (before >= 1 ||
              /[\u0080-\u009f]/.test(text) ||
              (text.match(/[\u00a0-\u00bf×÷]/g) ?? []).length / text.length >= 0.2)
          )
            candidates.push({ value, charset, misreadAs: mode, score: quality(value) })
        }
      } catch {
        /* This charset cannot decode these bytes losslessly. */
      }
    }
  }
  candidates.sort((a, b) => b.score - a.score)
  return candidates[0]
    ? {
        ...candidates[0],
        alternatives: [
          ...new Set(
            candidates.filter((x) => x.value !== candidates[0]!.value).map((x) => x.charset),
          ),
        ],
      }
    : null
}
export const mojibake: Detector = {
  id: 'mojibake',
  detect(input) {
    if (typeof input !== 'string') {
      try {
        new TextDecoder('utf-8', { fatal: true }).decode(input)
      } catch {
        return null
      }
    }
    const text = inputText(input).trim()
    const repaired = repairGarbled(text)
    if (!repaired) return null
    return found(
      'mojibake',
      'Garbled text',
      repaired.value,
      repaired.charset === 'utf-8' ? 0.99 : 0.82,
      {
        decoded: repaired.value,
        metadata: {
          charset: repaired.charset,
          misreadAs: repaired.misreadAs,
          alternatives: repaired.alternatives,
        },
      },
    )
  },
}
export const unicodeNormalization: Detector = {
  id: 'unicode-normalization',
  detect(input) {
    if (typeof input !== 'string') {
      try {
        new TextDecoder('utf-8', { fatal: true }).decode(input)
      } catch {
        return null
      }
    }
    const text = inputText(input).trim()
    if (!/[\u1100-\u11ff]/.test(text)) return null
    const value = text.normalize('NFC')
    if (value === text) return null
    return found('unicode-normalization', 'Hangul normalization', value, 0.999, {
      decoded: value,
      metadata: { from: 'NFD', to: 'NFC' },
    })
  },
}
export const damagedText: Detector = {
  id: 'damaged-text',
  detect(input) {
    if (typeof input !== 'string') {
      try {
        new TextDecoder('utf-8', { fatal: true }).decode(input)
      } catch {
        return null
      }
    }
    const text = inputText(input).trim()
    const replacementCount = (text.match(/\ufffd/g) ?? []).length
    const placeholders =
      /^(?:\?{3,}[\s.,!]*|[가-힣]+\?{3,})+$/.test(text) ||
      (/[가-힣]/.test(text) && /\?{2,}/.test(text))
    if (!replacementCount && !placeholders) return null
    return found('damaged-text', 'Lost characters', text, replacementCount ? 0.99 : 0.8, {
      warnings: [
        warning('TEXT-LOST', {
          code: replacementCount ? 'warning-text-lost' : 'warning-text-maybe-lost',
        }),
      ],
      metadata: { replacementCount, placeholders },
    })
  },
}

export function decodeLegacyPercent(text: string): string | null {
  if (/%(?![\da-f]{2})/i.test(text)) return null
  const values: number[] = []
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '%') {
      values.push(parseInt(text.slice(i + 1, i + 3), 16))
      i += 2
    } else if (text.charCodeAt(i) < 128) values.push(text[i] === '+' ? 32 : text.charCodeAt(i))
    else return null
  }
  try {
    const value = new TextDecoder('euc-kr', { fatal: true }).decode(Uint8Array.from(values))
    return /[가-힣]/.test(value) ? value : null
  } catch {
    return null
  }
}
