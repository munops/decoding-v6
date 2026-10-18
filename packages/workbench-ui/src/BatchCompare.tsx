import { useState } from 'preact/hooks'
import type { DecodeInput, DecodeResult } from '@decoding/engine'
import type { DecoderMessages } from './messages'
import { completionMessages } from './completion-messages'
import { linearChain } from './reproduce-commands'
import { outputText } from './result-text'
export function BatchCompare({
  source,
  decodeInput,
  messages,
  onInput,
}: {
  source: string
  decodeInput: (input: DecodeInput) => Promise<DecodeResult>
  messages: DecoderMessages
  onInput: (text: string) => void
}) {
  const [rows, setRows] = useState<Array<{ line: string; format: string; warnings: number }>>([]),
    [second, setSecond] = useState(''),
    [diff, setDiff] = useState<Array<{ value: string; added: boolean; removed: boolean }>>([]),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    copy = completionMessages[messages.locale]
  const batch = async () => {
    setBusy(true)
    setRows([])
    setMessage(source.split(/\r?\n/).length > 200 ? copy.limit : '')
    try {
      const next = []
      for (const line of source.split(/\r?\n/).slice(0, 200)) {
        if (!line.trim()) continue
        const result = await decodeInput(line)
        next.push({
          line,
          format:
            result.root.selected?.label ?? result.root.candidates[0]?.label ?? messages.unsupported,
          warnings: linearChain(result.root).reduce(
            (n, node) => n + (node.selected?.warnings.length ?? 0),
            0,
          ),
        })
      }
      setRows(next)
    } catch {
      setMessage(messages.decodeFailed)
    } finally {
      setBusy(false)
    }
  }
  const compare = async () => {
    setBusy(true)
    try {
      const left = await decodeInput(source),
        right = await decodeInput(second),
        { executeOperation } = await import('@decoding/operations')
      const pick = (result: DecodeResult) =>
        outputText(
          linearChain(result.root).at(-1)?.selected?.value ?? result.root.selected?.value ?? '',
        )
      const result = await executeOperation('text-diff', pick(left), { compareTo: pick(right) })
      setDiff(result.output as typeof diff)
    } catch {
      setMessage(messages.decodeFailed)
    } finally {
      setBusy(false)
    }
  }
  return (
    <details class="batch-compare">
      <summary>
        {copy.batch} / {copy.compare}
      </summary>
      <button
        class="button secondary"
        type="button"
        disabled={!source || busy}
        onClick={() => void batch()}
      >
        {copy.batch}
      </button>
      {rows.length ? (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>{messages.possibleFormats}</th>
              <th>{messages.shareWarnings}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <button class="button ghost" type="button" onClick={() => onInput(row.line)}>
                    {row.format}
                  </button>
                </td>
                <td>{row.warnings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      <label>
        {copy.compare}
        <textarea
          value={second}
          onInput={(event) => setSecond(event.currentTarget.value)}
          spellcheck={false}
        />
      </label>
      <button
        class="button secondary"
        type="button"
        disabled={!source || !second || busy}
        onClick={() => void compare()}
      >
        {copy.compare}
      </button>
      <pre class="unified-diff">
        {diff.map((part, i) => (
          <code class={part.added ? 'diff-added' : part.removed ? 'diff-removed' : ''} key={i}>
            {part.added ? '+ ' : part.removed ? '- ' : '  '}
            {part.value}
          </code>
        ))}
      </pre>
      <p role="status">{busy ? messages.checking : message}</p>
    </details>
  )
}
