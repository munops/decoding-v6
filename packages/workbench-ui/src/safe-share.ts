import type { ChainNode, Detection } from '@decoding/engine'
import type { DecoderMessages } from './messages'

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
  if (selectedAtNode) return publicLabel(selectedAtNode.label)
  if (node.selected) return publicLabel(node.selected.label)
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
  return { format: publicLabel(selected.label), chain, warningRuleIds }
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
    { text: section.label.toUpperCase(), kind: 'label' },
    ...section.lines.flatMap((line) => wrappedLines(line).map((text) => ({ text, kind: 'body' }))),
  ])
  const height = Math.max(630, 234 + bodyLines.length * 34 + 116)
  let y = 210
  const renderedLines = bodyLines
    .map((line) => {
      const output =
        line.kind === 'label'
          ? `<text x="88" y="${y}" fill="#f0a44d" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="17" font-weight="700" letter-spacing="2">${escapeXml(line.text)}</text>`
          : `<text x="88" y="${y}" fill="#f5f0e8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="26" font-weight="600">${escapeXml(line.text)}</text>`
      y += line.kind === 'label' ? 34 : 36
      return output
    })
    .join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}" role="img" aria-label="${escapeXml(messages.shareHeadline)}"><rect width="1200" height="${height}" fill="#101a2a"/><rect x="52" y="48" width="1096" height="${height - 96}" rx="28" fill="#17253a" stroke="#34445c"/><path d="M88 116h32l18-24h-32z" fill="#f0a44d"/><text x="144" y="124" fill="#f5f0e8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="28" font-weight="750">decod.ing</text><text x="88" y="174" fill="#f5f0e8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="42" font-weight="760">${escapeXml(messages.shareHeadline)}</text>${renderedLines}<path d="M88 ${height - 88}h1024" stroke="#34445c"/><text x="88" y="${height - 48}" fill="#aebdca" font-family="ui-sans-serif, system-ui, sans-serif" font-size="20">${escapeXml(messages.shareOmitted)}</text><text x="1112" y="${height - 48}" text-anchor="end" fill="#7bd9b7" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="18" font-weight="700">${escapeXml(messages.shareFooter)}</text></svg>`
}
