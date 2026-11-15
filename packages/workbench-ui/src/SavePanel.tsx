import { useState } from 'preact/hooks'
import type { Detection } from '@decoding/engine'
import { savedCopy, type SaveOptions } from './saved-copy'
import type { WorkbenchLocale } from './messages'
export function SavePanel({
  selected,
  locale,
  onSave,
  onClose,
}: {
  selected: Detection
  locale: WorkbenchLocale
  onSave: (selection: Detection, ttl: '24h' | '7d' | 'keep', options: SaveOptions) => Promise<void>
  onClose: (saved?: boolean) => void
}) {
  const copy = savedCopy(locale),
    [name, setName] = useState(selected.label),
    [ttl, setTtl] = useState<'24h' | '7d' | 'keep'>('7d'),
    [valueMode, setMode] = useState<'structure' | 'values'>('structure'),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('')
  return (
    <form
      class="save-panel"
      onSubmit={(event) => {
        event.preventDefault()
        if (!name.trim()) {
          setMessage(copy.nameRequired)
          return
        }
        setBusy(true)
        void onSave(selected, ttl, { name, valueMode }).then(
          () => onClose(true),
          () => {
            setMessage(copy.failed)
            setBusy(false)
          },
        )
      }}
    >
      <label>
        {copy.name}
        <input
          value={name}
          maxLength={100}
          onInput={(event) => setName(event.currentTarget.value)}
          required
        />
      </label>
      <label>
        {copy.mode}
        <select
          value={valueMode}
          onChange={(event) => setMode(event.currentTarget.value as typeof valueMode)}
        >
          <option value="structure">{copy.structure}</option>
          <option value="values">{copy.values}</option>
        </select>
      </label>
      <label>
        {copy.retention}
        <select value={ttl} onChange={(event) => setTtl(event.currentTarget.value as typeof ttl)}>
          <option value="24h">{copy.day}</option>
          <option value="7d">{copy.week}</option>
          <option value="keep">{copy.keep}</option>
        </select>
      </label>
      {valueMode === 'values' ? <p class="notice warning">{copy.localWarning}</p> : null}
      <button class="button primary" type="submit" disabled={busy}>
        {busy ? copy.saving : copy.save}
      </button>
      <button class="button ghost" type="button" onClick={() => onClose(false)}>
        {copy.cancel}
      </button>
      {message ? <p role="status">{message}</p> : null}
    </form>
  )
}
