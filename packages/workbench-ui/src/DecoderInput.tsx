import { completionMessages } from './completion-messages'
import type { RefObject } from 'preact'
import type { DecoderMessages } from './messages'
type Props = {
  onPaste: () => void

  source: string
  messages: DecoderMessages
  inputRef: RefObject<HTMLTextAreaElement>
  handleSource: (text: string) => void
  handleFile: (file?: File) => Promise<void>
}
export function DecoderInput({
  onPaste,
  source,
  messages,
  inputRef,
  handleSource,
  handleFile,
}: Props) {
  return (
    <div
      class="paste-surface"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        void handleFile(event.dataTransfer?.files[0])
      }}
    >
      <label for="decoder-input">{messages.pasteLabel}</label>
      <textarea
        id="decoder-input"
        ref={inputRef}
        value={source}
        onInput={(event) => handleSource(event.currentTarget.value)}
        placeholder={messages.placeholder}
        spellcheck={false}
        autocomplete="off"
        autocapitalize="off"
      />
      <div class="input-actions">
        <button class="button" type="button" onClick={onPaste}>
          {completionMessages[messages.locale].paste}
        </button>
        <label class="button ghost file-action">
          {messages.openFile}
          <input
            class="visually-hidden"
            type="file"
            onChange={(event) => void handleFile(event.currentTarget.files?.[0])}
          />
        </label>
        <button
          type="button"
          class="button ghost"
          onClick={() => handleSource('')}
          disabled={!source}
        >
          {messages.clear}
        </button>
        <span>{messages.maxSize}</span>
      </div>
    </div>
  )
}
