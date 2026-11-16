import { operationName } from '@decoding/presentation'
import { operations } from '@decoding/operations'
import { SavePanel } from './SavePanel'
import { SendPanel } from './SendPanel'
import { savedCopy, type SaveOptions } from './saved-copy'
import { uiMessage } from './ui-copy'
import { identifyMagic, redactSecrets, type DecodeResult, type Detection } from '@decoding/engine'
import { useEffect, useState } from 'preact/hooks'
import type { DecoderMessages } from './messages'
import { completionMessages } from './completion-messages'
import { outputText, privateKeyDetection, displayValue, selectedPrimaryRoot } from './result-text'
import { reproduceCommands } from './reproduce-commands'
import { canReencode, reencode, maskSensitiveFields } from './re-encode'
type Ttl = 'session' | '24h' | '7d' | 'keep'
export function WorkflowActions({
  result,
  selected,
  messages,
  onTool,
  onSave,
  onInput,
  onShare,
  onCopy,
}: {
  result: DecodeResult
  selected: Detection | null
  messages: DecoderMessages
  onTool?: (tool: string, text: string) => void
  onSave?: (selected: Detection, ttl: Ttl, options: SaveOptions) => Promise<void>
  onInput: (text: string) => void
  onShare: () => void
  onCopy: () => void
}) {
  const [open, setOpen] = useState(false),
    [message, setMessage] = useState(''),
    [editing, setEditing] = useState(false),
    [edited, setEdited] = useState(''),
    [saveOpen, setSaveOpen] = useState(false),
    [sendOpen, setSendOpen] = useState(false),
    [keyboard, setKeyboard] = useState(false),
    copy = completionMessages[messages.locale],
    saved = savedCopy(messages.locale)
  useEffect(() => {
    const pop = () => setOpen(false)
    addEventListener('popstate', pop)
    const viewport = () =>
      setKeyboard((window.visualViewport?.height ?? innerHeight) < innerHeight * 0.75)
    viewport()
    window.visualViewport?.addEventListener('resize', viewport)
    addEventListener('focusin', viewport)
    addEventListener('focusout', viewport)
    return () => {
      removeEventListener('popstate', pop)
      window.visualViewport?.removeEventListener('resize', viewport)
      removeEventListener('focusin', viewport)
      removeEventListener('focusout', viewport)
    }
  }, [])
  useEffect(() => {
    if (!open) return
    const sheet = document.querySelector<HTMLElement>('.workflow-sheet')
    sheet?.querySelector<HTMLButtonElement>('button')?.focus()
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        if (history.state?.decodingSheet) history.back()
      }
      if (event.key === 'Tab' && sheet) {
        const controls = [
          ...sheet.querySelectorAll<HTMLElement>(
            'button:not(:disabled),a,input,select,textarea,summary',
          ),
        ]
        const first = controls[0],
          last = controls.at(-1)
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    addEventListener('keydown', key)
    return () => removeEventListener('keydown', key)
  }, [open])
  useEffect(() => {
    setEditing(false)
    setEdited('')
    setMessage('')
  }, [selected])
  const close = () => {
    setOpen(false)
    if (history.state?.decodingSheet) history.back()
  }
  const show = () => {
    if (!open) {
      history.pushState({ decodingSheet: true }, '')
      setOpen(true)
    }
  }
  const copyText = (text: string) =>
    void navigator.clipboard.writeText(text).then(
      () => setMessage(messages.copied),
      () => setMessage(messages.copyFailed),
    )
  const download = () => {
    if (!selected) return
    const raw =
      selected.value instanceof Uint8Array
        ? selected.value
        : selected.decoded instanceof Uint8Array
          ? selected.decoded
          : null
    if (!raw) return
    const magic = identifyMagic(raw),
      href = URL.createObjectURL(
        new Blob([new Uint8Array(raw)], { type: magic?.mime ?? 'application/octet-stream' }),
      ),
      link = document.createElement('a')
    link.href = href
    link.download = `decoded.${magic?.extension ?? 'bin'}`
    link.click()
    setTimeout(() => URL.revokeObjectURL(href), 0)
  }
  const privateKey = privateKeyDetection(result.root)
  const chosenRoot = selectedPrimaryRoot(result.root, selected)
  const gate = privateKey
    ? { allowed: false, reason: copy.private }
    : chosenRoot
      ? canReencode(chosenRoot)
      : {
          allowed: false,
          reason: copy.noReproduction,
        }
  return (
    <>
      {selected && onSave && !open ? (
        <div class="workflow-save">
          <button
            class="button secondary"
            type="button"
            onClick={() => setSaveOpen((value) => !value)}
          >
            {saved.save}
          </button>
          <a
            class="button ghost"
            href={`/${messages.locale === 'en' ? '' : `${messages.locale}/`}workspace/`}
          >
            {saved.open}
          </a>
          {!open && message ? <p role="status">{message}</p> : null}
        </div>
      ) : null}
      {selected ? (
        <div class={`result-action-bar ${keyboard ? 'keyboard-open' : ''}`}>
          <button class="button" type="button" onClick={onCopy}>
            {messages.copy}
          </button>
          <button
            class="button secondary"
            type="button"
            onClick={() => setSendOpen((value) => !value)}
          >
            {saved.send}
          </button>
          <button class="button secondary" type="button" onClick={show}>
            {copy.more}
          </button>
        </div>
      ) : null}
      {saveOpen && selected && onSave ? (
        <SavePanel
          selected={selected}
          locale={messages.locale}
          onSave={onSave}
          onClose={(savedSuccessfully) => {
            setSaveOpen(false)
            setMessage(savedSuccessfully ? saved.saved : '')
          }}
        />
      ) : null}
      {sendOpen ? (
        <SendPanel
          result={result}
          messages={messages}
          onCard={onShare}
          onClose={() => setSendOpen(false)}
        />
      ) : null}
      {open ? (
        <div class="workflow-sheet" role="dialog" aria-modal="true" aria-label={copy.more}>
          <button class="button ghost" type="button" onClick={close}>
            {copy.close}
          </button>
          {selected ? (
            <>
              {onSave ? (
                <button
                  class="button secondary"
                  type="button"
                  onClick={() => {
                    close()
                    setSaveOpen(true)
                  }}
                >
                  {saved.save}
                </button>
              ) : null}
              <button
                class="button secondary"
                type="button"
                onClick={() => {
                  let value = selected.value
                  if (typeof value === 'string') {
                    try {
                      value = JSON.parse(value)
                    } catch {
                      /* Plaintext uses prefix redaction. */
                    }
                  }
                  copyText(redactSecrets(outputText(maskSensitiveFields(value))))
                }}
              >
                {copy.copyMasked}
              </button>
              <details>
                <summary>{copy.command}</summary>
                {!chosenRoot ? <p>{gate.reason}</p> : null}
                {Object.entries(chosenRoot ? reproduceCommands(chosenRoot) : {}).map(
                  ([language, command]) => (
                    <div key={language}>
                      <strong>{language}</strong>
                      <pre>
                        <code>{command}</code>
                      </pre>
                      <button class="button ghost" type="button" onClick={() => copyText(command)}>
                        {messages.copy} · {language}
                      </button>
                    </div>
                  ),
                )}
              </details>
              {onTool && !privateKey ? (
                <div class="input-actions">
                  {['json-format', 'json-to-code', 'json-to-csv'].map((id) => (
                    <button
                      class="button secondary"
                      key={id}
                      type="button"
                      onClick={() => onTool(id, outputText(displayValue(selected)))}
                    >
                      {operationName(
                        id,
                        operations.find((item) => item.id === id)?.name ?? id,
                        messages.locale,
                      )}
                    </button>
                  ))}
                </div>
              ) : null}
              <button
                class="button secondary"
                type="button"
                disabled={
                  !(selected.value instanceof Uint8Array || selected.decoded instanceof Uint8Array)
                }
                onClick={download}
              >
                {copy.download}
              </button>
              <button
                class="button secondary"
                type="button"
                disabled={!gate.allowed}
                onClick={() => {
                  setEditing(true)
                  setEdited(outputText(displayValue(selected)))
                }}
              >
                {copy.edit}
              </button>
              {!gate.allowed ? <p>{gate.reason}</p> : null}
              {editing ? (
                <>
                  <textarea
                    value={edited}
                    onInput={(event) => setEdited(event.currentTarget.value)}
                    aria-label={copy.edit}
                    spellcheck={false}
                  />
                  <button
                    class="button"
                    type="button"
                    onClick={() => {
                      try {
                        const next = reencode(chosenRoot!, edited)
                        if (next.unsignedJwt)
                          setMessage(
                            uiMessage(
                              messages.locale,
                              'rebuilt_without_a_signature_the_previous_signature_is_invalid',
                            ),
                          )
                        onInput(next.text)
                        close()
                      } catch {
                        setMessage(uiMessage(messages.locale, 'check_the_edited_json_syntax'))
                      }
                    }}
                  >
                    {copy.edit}
                  </button>
                </>
              ) : null}
            </>
          ) : null}
          <p role="status">{message}</p>
        </div>
      ) : null}
    </>
  )
}
