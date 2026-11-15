import { useState } from 'preact/hooks'
import { maskCredentialFields, type DecodeResult } from '@decoding/engine'
import type { DecoderMessages } from './messages'
import { savedCopy } from './saved-copy'
import { safeShareMarkdown, safeShareProjection } from './safe-share'
import { displayValue, finalSelection } from './result-text'
import { reproduceCommands } from './reproduce-commands'
const text = (value: unknown): string =>
  typeof value === 'string'
    ? value
    : JSON.stringify(value, (_, item) => (typeof item === 'bigint' ? String(item) : item), 2)
export function SendPanel({
  result,
  messages,
  onCard,
  onClose,
}: {
  result: DecodeResult
  messages: DecoderMessages
  onCard: () => void
  onClose: () => void
}) {
  const copy = savedCopy(messages.locale),
    [mode, setMode] = useState('summary'),
    [unmask, setUnmask] = useState(false),
    [notice, setNotice] = useState('')
  const final = finalSelection(result.root)
  const commands = reproduceCommands(result.root)
  const value = final ? displayValue(final) : null
  const projection = safeShareProjection(result.root, final ?? null, messages)
  const output =
    mode === 'summary'
      ? projection
        ? safeShareMarkdown(projection, messages)
        : copy.noResult
      : mode === 'commands'
        ? Object.entries(commands)
            .map(([name, command]) => `${name}\n${command}`)
            .join('\n\n')
        : value === null
          ? copy.noResult
          : text(unmask ? value : maskCredentialFields(value))
  const download = () => {
    const href = URL.createObjectURL(new Blob([output], { type: 'text/plain;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = href
    link.download = 'decoded-value.txt'
    link.click()
    setTimeout(() => URL.revokeObjectURL(href), 0)
  }
  return (
    <section class="send-panel" aria-label={copy.send}>
      <h3>{copy.send}</h3>
      <p>{copy.shareInfo}</p>
      <label>
        {copy.mode}
        <select
          value={mode}
          onChange={(event) => {
            setMode(event.currentTarget.value)
            setUnmask(false)
          }}
        >
          <option value="summary">{copy.summary}</option>
          <option value="value">{copy.decoded}</option>
          <option value="commands">{copy.commands}</option>
        </select>
      </label>
      {mode === 'value' ? (
        <label class="inline-check">
          <input
            type="checkbox"
            checked={unmask}
            onChange={(event) => {
              if (!event.currentTarget.checked || confirm(copy.unmaskConfirm))
                setUnmask(event.currentTarget.checked)
              else event.currentTarget.checked = false
            }}
          />
          {copy.unmask}
        </label>
      ) : null}
      <div class="input-actions">
        <button
          class="button primary"
          type="button"
          onClick={() => {
            setNotice('')
            void navigator.clipboard.writeText(output).then(
              () => setNotice(copy.copied),
              () => setNotice(copy.sharingFailed),
            )
          }}
        >
          {copy.copy}
        </button>
        {mode === 'summary' ? (
          <button class="button secondary" type="button" onClick={onCard}>
            {copy.card}
          </button>
        ) : null}
        {mode === 'value' ? (
          <>
            <button class="button secondary" type="button" onClick={download}>
              {copy.file}
            </button>
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' ? (
              <button
                class="button secondary"
                type="button"
                onClick={() =>
                  void navigator.share({ text: output }).catch(() => setNotice(copy.sharingFailed))
                }
              >
                {copy.native}
              </button>
            ) : null}
          </>
        ) : null}
        <button class="button ghost" type="button" onClick={onClose}>
          {copy.cancel}
        </button>
      </div>
      {mode === 'commands' ? <p class="preview-scroll-hint">{copy.scrollPreview}</p> : null}
      <pre class="output-view" tabIndex={0}>
        <code>{output}</code>
      </pre>
      {notice ? <p role="status">{notice}</p> : null}
    </section>
  )
}
