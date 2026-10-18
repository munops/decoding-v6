import { identifyMagic, redactSecrets, type DecodeResult, type Detection } from '@decoding/engine'
import { useEffect, useState } from 'preact/hooks'
import type { DecoderMessages } from './messages'
import { completionMessages } from './completion-messages'
import { outputText, privateKeyDetection } from './result-text'
import { linearChain, reproduceCommands } from './reproduce-commands'
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
  onSave?: (selected: Detection, ttl: Ttl) => Promise<void>
  onInput: (text: string) => void
  onShare: () => void
  onCopy: () => void
}) {
  const [open, setOpen] = useState(false),
    [message, setMessage] = useState(''),
    [editing, setEditing] = useState(false),
    [edited, setEdited] = useState(''),
    [ttl, setTtl] = useState<Ttl>('24h'),
    [keyboard, setKeyboard] = useState(false),
    copy = completionMessages[messages.locale]
  useEffect(() => {
    const pop = () => setOpen(false)
    addEventListener('popstate', pop)
    const viewport = () =>
      setKeyboard(
        (window.visualViewport?.height ?? innerHeight) < innerHeight * 0.75 ||
          document.activeElement?.tagName === 'TEXTAREA',
      )
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
  const gate = privateKey ? { allowed: false, reason: copy.private } : canReencode(result.root),
    last = linearChain(result.root).at(-1)?.selected
  return (
    <>
      {selected ? (
        <div class={`result-action-bar ${keyboard ? 'keyboard-open' : ''}`}>
          <button class="button" type="button" onClick={onCopy}>
            {messages.copy}
          </button>
          <button class="button secondary" type="button" onClick={onShare}>
            {messages.shareTitle}
          </button>
          <button class="button secondary" type="button" onClick={show}>
            {copy.more}
          </button>
        </div>
      ) : null}
      {open ? (
        <div class="workflow-sheet" role="dialog" aria-modal="true" aria-label={copy.more}>
          <button class="button ghost" type="button" onClick={close}>
            {copy.close}
          </button>
          {selected ? (
            <>
              {onSave ? (
                <>
                  <label>
                    TTL{' '}
                    <select
                      value={ttl}
                      onChange={(event) => setTtl(event.currentTarget.value as Ttl)}
                    >
                      <option value="24h">24 h</option>
                      <option value="7d">7 d</option>
                      <option value="keep">
                        {messages.locale === 'ko' ? '직접 지울 때까지' : 'Until deleted'}
                      </option>
                      <option value="session">
                        {messages.locale === 'ko' ? '이 탭' : 'This tab'}
                      </option>
                    </select>
                  </label>
                  <button
                    class="button"
                    type="button"
                    onClick={() =>
                      void onSave(selected, ttl).then(
                        () => setMessage(copy.saved),
                        () => setMessage(copy.storageFailed),
                      )
                    }
                  >
                    {copy.save}
                  </button>
                  <a class="button ghost" href="/workspace/">
                    {messages.locale === 'ko' ? '저장한 기록 열기' : 'Open saved records'}
                  </a>
                </>
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
                {Object.entries(reproduceCommands(result.root)).map(([language, command]) => (
                  <div key={language}>
                    <strong>{language}</strong>
                    <pre>
                      <code>{command}</code>
                    </pre>
                    <button class="button ghost" type="button" onClick={() => copyText(command)}>
                      {messages.copy} · {language}
                    </button>
                  </div>
                ))}
              </details>
              {onTool && !privateKey ? (
                <div class="input-actions">
                  {['json-format', 'json-to-code', 'json-to-csv'].map((id) => (
                    <button
                      class="button secondary"
                      key={id}
                      type="button"
                      onClick={() => onTool(id, outputText(last?.value ?? selected.value))}
                    >
                      {id}
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
                  setEdited(outputText(last?.value ?? selected.value))
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
                        const next = reencode(result.root, edited)
                        if (next.unsignedJwt)
                          setMessage(
                            messages.locale === 'ko'
                              ? '서명 없이 다시 만들었어요. 이전 서명은 맞지 않아요.'
                              : 'Rebuilt without a signature. The previous signature is invalid.',
                          )
                        onInput(next.text)
                        close()
                      } catch {
                        setMessage(
                          messages.locale === 'ko'
                            ? '편집한 JSON 문법을 확인해 주세요.'
                            : 'Check the edited JSON syntax.',
                        )
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
