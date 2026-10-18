import type { ChainNode, Detection } from '@decoding/engine'
import type { DecoderMessages } from './messages'
import { detectionLabel } from './detection-copy'

type SafeShareMessages = Pick<
  DecoderMessages,
  | 'ambiguousStep'
  | 'unsupportedStep'
  | 'limitStep'
  | 'shareFormat'
  | 'shareChain'
  | 'shareWarnings'
  | 'shareNoWarnings'
  | 'shareOmitted'
  | 'shareFooter'
  | 'shareHeadline'
  | 'locale'
>

export type SafeShareProjection = {
  format: string
  chain: string[]
  warningRuleIds: string[]
}

function publicLabel(value: string): string {
  return value.replace(/\s+/g, ' ').trim().slice(0, 80)
}

function nodeLabel(
  node: ChainNode,
  selectedAtNode: Detection | null,
  messages: SafeShareMessages,
): string {
  if (selectedAtNode) return publicLabel(detectionLabel(selectedAtNode.label, messages))
  if (node.selected) return publicLabel(detectionLabel(node.selected.label, messages))
  if (node.status === 'ambiguous') return messages.ambiguousStep
  if (node.status === 'limit') return messages.limitStep
  return messages.unsupportedStep
}

function appendNode(
  node: ChainNode,
  rootSelection: Detection | null,
  messages: SafeShareMessages,
  chain: string[],
  warningRuleIds: string[],
) {
  const detection = rootSelection ?? node.selected ?? null
  chain.push(nodeLabel(node, detection, messages))
  for (const warning of detection?.warnings ?? []) {
    if (!warningRuleIds.includes(warning.ruleId)) warningRuleIds.push(warning.ruleId)
  }
  if (rootSelection && rootSelection.detector !== node.selected?.detector) return
  for (const child of node.children) appendNode(child, null, messages, chain, warningRuleIds)
}

export function safeShareProjection(
  root: ChainNode,
  selected: Detection | null,
  messages: SafeShareMessages,
): SafeShareProjection | null {
  if (!selected) return null
  const chain: string[] = []
  const warningRuleIds: string[] = []
  appendNode(root, selected, messages, chain, warningRuleIds)
  return { format: publicLabel(detectionLabel(selected.label, messages)), chain, warningRuleIds }
}

export function safeShareMarkdown(
  projection: SafeShareProjection,
  messages: SafeShareMessages,
): string {
  const warningSummary = projection.warningRuleIds.length
    ? projection.warningRuleIds.map((ruleId) => `\`${ruleId}\``).join(', ')
    : messages.shareNoWarnings
  return [
    `## ${messages.shareHeadline}`,
    '',
    `**${messages.shareFormat}:** ${projection.format}`,
    `**${messages.shareChain}:** ${projection.chain.join(' → ')}`,
    `**${messages.shareWarnings}:** ${warningSummary}`,
    '',
    messages.shareOmitted,
    messages.shareFooter,
  ].join('\n')
}

function escapeXml(value: string): string {
  return value.replace(/[<>&"']/g, (character) => {
    if (character === '<') return '&lt;'
    if (character === '>') return '&gt;'
    if (character === '&') return '&amp;'
    if (character === '"') return '&quot;'
    return '&apos;'
  })
}

function wrappedLines(value: string, maxLength = 52): string[] {
  const words = value.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (line && next.length > maxLength) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['—']
}

export function safeShareCardSvg(
  projection: SafeShareProjection,
  messages: SafeShareMessages,
): string {
  const sections = [
    { label: messages.shareFormat, lines: [projection.format] },
    {
      label: messages.shareChain,
      lines: projection.chain.map((item, index) => `${index + 1}. ${item}`),
    },
    {
      label: messages.shareWarnings,
      lines: projection.warningRuleIds.length
        ? projection.warningRuleIds
        : [messages.shareNoWarnings],
    },
  ]
  const bodyLines = sections.flatMap((section) => [
    { text: messages.locale === 'ko' ? section.label : section.label.toUpperCase(), kind: 'label' },
    ...section.lines.flatMap((line) => wrappedLines(line).map((text) => ({ text, kind: 'body' }))),
  ])
  const height = Math.max(630, 234 + bodyLines.length * 34 + 116)
  let y = 210
  const renderedLines = bodyLines
    .map((line) => {
      const output =
        line.kind === 'label'
          ? `<text x="88" y="${y}" fill="#33465c" font-family="${messages.locale === 'ko' ? 'ui-sans-serif, system-ui, sans-serif' : 'ui-monospace, SFMono-Regular, Menlo, monospace'}" font-size="17" font-weight="700" letter-spacing="${messages.locale === 'ko' ? '0' : '2'}">${escapeXml(line.text)}</text>`
          : `<text x="88" y="${y}" fill="#1b2128" font-family="ui-sans-serif, system-ui, sans-serif" font-size="26" font-weight="600">${escapeXml(line.text)}</text>`
      y += line.kind === 'label' ? 34 : 36
      return output
    })
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}" role="img" aria-label="${escapeXml(messages.shareHeadline)}"><rect width="1200" height="${height}" fill="#ffffff"/><rect x="52" y="48" width="1096" height="${height - 96}" rx="28" fill="#f5f7fa" stroke="#cbd2da"/><path d="M88 116h32l18-24h-32z" fill="#33465c"/><text x="144" y="124" fill="#1b2128" font-family="ui-sans-serif, system-ui, sans-serif" font-size="28" font-weight="750">decod.ing</text><text x="88" y="174" fill="#1b2128" font-family="ui-sans-serif, system-ui, sans-serif" font-size="42" font-weight="760">${escapeXml(messages.shareHeadline)}</text>${renderedLines}<path d="M88 ${height - 88}h1024" stroke="#cbd2da"/><text x="88" y="${height - 48}" fill="#606b78" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20">${escapeXml(messages.shareOmitted)}</text><text x="1112" y="${height - 48}" text-anchor="end" fill="#296247" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="18" font-weight="700">${escapeXml(messages.shareFooter)}</text></svg>`
}

/** Raster card uses only the already value-free projection. */
export async function safeShareCardPng(
  projection: SafeShareProjection,
  messages: SafeShareMessages,
  slug: string,
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 1200
  canvas.height = Math.max(
    630,
    320 + Math.max(projection.chain.length, 1) * 72 + projection.warningRuleIds.length * 32,
  )
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#1b2128'
  ctx.font = '28px monospace'
  ctx.fillText('decod.ing', 64, 66)
  ctx.font = '38px sans-serif'
  ctx.fillText(messages.shareHeadline, 64, 126, 1070)
  const colors = ['#dce7f9', '#ddf1e2', '#f9edc8', '#eee0f4']
  let y = 174
  for (const [label, index] of projection.chain
    .slice(0, 12)
    .map((label, index) => [label, index] as const)) {
    ctx.fillStyle = colors[index % 4]!
    ctx.fillRect(64, y, 1072, 58)
    ctx.fillStyle = '#1b2128'
    ctx.font = '23px monospace'
    ctx.fillText(`${String(index + 1).padStart(2, '0')}  ${label}`, 82, y + 37, 1020)
    y += 70
  }
  ctx.fillStyle = '#c4302b'
  ctx.font = '21px monospace'
  for (const rule of projection.warningRuleIds.slice(0, 16)) {
    ctx.fillText(rule, 64, y + 28, 1070)
    y += 32
  }
  ctx.fillStyle = '#606b78'
  ctx.font = '20px sans-serif'
  ctx.fillText(messages.shareOmitted, 64, canvas.height - 70, 1070)
  ctx.font = '22px monospace'
  ctx.fillText(
    /^[a-z0-9-]+$/.test(slug) ? `decod.ing/detect/${slug}/` : 'decod.ing/',
    64,
    canvas.height - 30,
    1070,
  )
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('PNG unavailable'))),
      'image/png',
    ),
  )
}
