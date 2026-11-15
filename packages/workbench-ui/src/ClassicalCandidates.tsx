import { useState } from 'preact/hooks'
import { caesarCandidates } from '@decoding/operations'
import type { ChainNode } from '@decoding/engine'
import type { DecoderMessages } from './messages'
import { answerMessages } from './answer-copy'
export function canCompareCaesar(root: ChainNode, source: string): boolean {
  const weak = new Set([
    'base64',
    'base32',
    'base58',
    'ascii85',
    'hash',
    'roman',
    'uuid-ulid',
    'ip',
    'epoch',
  ])
  return (
    /^[A-Za-z]+(?:[ \t]+[A-Za-z]+)*$/.test(source.trim()) &&
    source.trim().length >= 3 &&
    source.trim().length <= 256 &&
    root.status !== 'confident' &&
    (!root.selected || root.selected.confidence < 0.85) &&
    root.candidates.every((candidate) => weak.has(candidate.detector))
  )
}
export function ClassicalCandidates({
  root,
  source,
  messages,
}: {
  root: ChainNode
  source: string
  messages: DecoderMessages
}) {
  const [notice, setNotice] = useState(''),
    copy = answerMessages(messages.locale)
  if (!canCompareCaesar(root, source)) return null
  return (
    <section class="caesar-comparison" aria-label={copy.cipherChoicesTitle}>
      <h3>{copy.cipherChoicesTitle}</h3>
      <p>{copy.cipherChoicesHelp}</p>
      <ol class="caesar-options">
        {caesarCandidates(source.trim()).map((candidate) => (
          <li key={candidate.shift}>
            <span>{candidate.shift}</span>
            <code>{candidate.text}</code>
            <button
              type="button"
              class="button small secondary"
              aria-label={`${messages.copy} ${candidate.shift}`}
              onClick={() =>
                void navigator.clipboard.writeText(candidate.text).then(
                  () => setNotice(messages.copied),
                  () => setNotice(messages.copyFailed),
                )
              }
            >
              {messages.copy}
            </button>
          </li>
        ))}
      </ol>
      <p role="status">{notice}</p>
    </section>
  )
}
