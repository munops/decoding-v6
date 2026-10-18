import { exportBackup, restoreBackup } from '../lib/backup'
import { useEffect, useMemo, useState } from 'preact/hooks'
import {
  clearWorkspace,
  deleteWorkspaceRecord,
  listWorkspaceRecords,
  redactStructure,
  saveWorkspaceRecord,
  workspaceUsage,
  updateWorkspaceRecord,
  type WorkspaceRecord,
  type WorkspaceTtl,
} from '../lib/workspace'

const sample = '{\n  "userId": 42,\n  "token": "never stored",\n  "roles": ["admin"]\n}'

function bytes(value: number): string {
  if (!value) return '0 B'
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KiB`
  return `${(value / 1024 / 1024).toFixed(1)} MiB`
}

export default function WorkspaceManager() {
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [records, setRecords] = useState<WorkspaceRecord[]>([])
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [format, setFormat] = useState('JSON')
  const [source, setSource] = useState(sample)
  const [rules, setRules] = useState('')
  const [ttl, setTtl] = useState<WorkspaceTtl>('24h')
  const [message, setMessage] = useState('')
  const [usage, setUsage] = useState<{ usage: number | null; quota: number | null }>({
    usage: null,
    quota: null,
  })

  const preview = useMemo(() => {
    try {
      return JSON.stringify(redactStructure(JSON.parse(source) as unknown), null, 2)
    } catch {
      return 'Enter valid JSON to preview its redacted structure.'
    }
  }, [source])

  const refresh = async () => {
    setRecords(await listWorkspaceRecords())
    setUsage(await workspaceUsage())
  }

  useEffect(() => {
    void refresh().catch(() =>
      setMessage(
        'This browser blocked local storage. You can still use the decoder without saving.',
      ),
    )
  }, [])

  const save = async () => {
    if (!name.trim()) {
      setMessage('Add a local name before saving.')
      return
    }
    let structure: unknown
    try {
      structure = JSON.parse(source) as unknown
    } catch {
      setMessage('Structure must be valid JSON. The original text is not stored.')
      return
    }
    try {
      if (editingId) {
        await updateWorkspaceRecord(editingId, { name, note })
        setEditingId(null)
      } else
        await saveWorkspaceRecord({
          name,
          note,
          format,
          structure,
          ruleIds: rules.split(',').map((rule) => rule.trim()),
          ttl,
        })
      setName('')
      setNote('')
      setMessage('Redacted structure saved in this browser only.')
      await refresh()
    } catch {
      setMessage('This browser blocked saving. Your draft is kept; try a redacted export instead.')
    }
  }

  const exportRecords = () => {
    const blob = new Blob(
      [JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), records }, null, 2)],
      {
        type: 'application/json',
      },
    )
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'decoding-redacted-workspace.json'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <section class="workspace-manager" data-hydrated="true">
      <div class="privacy-line">
        <span class="privacy-dot" aria-hidden="true" />
        IndexedDB on this browser. No sync, account, content hash, or raw payload storage.
      </div>
      <div class="workspace-grid">
        <form
          class="workspace-editor"
          onSubmit={(event) => {
            event.preventDefault()
            void save()
          }}
        >
          <div class="panel-heading">
            <div>
              <span class="eyebrow">Explicit opt-in</span>
              <h2>New redacted record</h2>
            </div>
          </div>
          <div class="tool-options">
            <label>
              Name
              <input
                value={name}
                maxlength={100}
                onInput={(event) => setName(event.currentTarget.value)}
                placeholder="Incident note"
              />
            </label>
            <label>
              Format
              <input
                value={format}
                maxlength={80}
                onInput={(event) => setFormat(event.currentTarget.value)}
              />
            </label>
            <label>
              TTL
              <select
                value={ttl}
                onChange={(event) => setTtl(event.currentTarget.value as WorkspaceTtl)}
              >
                <option value="session">Session</option>
                <option value="24h">24 hours</option>
                <option value="7d">7 days</option>
                <option value="keep">Keep locally</option>
              </select>
            </label>
          </div>
          <label>
            Structure JSON
            <textarea
              value={source}
              onInput={(event) => setSource(event.currentTarget.value)}
              spellcheck={false}
            />
          </label>
          <label>
            Rule IDs, comma-separated
            <input
              value={rules}
              onInput={(event) => setRules(event.currentTarget.value)}
              placeholder="JWT-EXPIRED"
            />
          </label>
          <label>
            Note
            <textarea
              class="short-textarea"
              value={note}
              maxlength={2000}
              onInput={(event) => setNote(event.currentTarget.value)}
              placeholder="Do not paste credentials."
            />
          </label>
          <div class="input-actions">
            <button class="button primary" type="submit">
              {editingId ? 'Save name and note' : 'Save redacted structure'}
            </button>
          </div>
        </form>
        <aside class="workspace-preview">
          <div class="panel-heading">
            <div>
              <span class="eyebrow">Before storage</span>
              <h2>Redaction preview</h2>
            </div>
          </div>
          <pre class="output-view">
            <code>{preview}</code>
          </pre>
          <p>
            All scalar values become type placeholders. Secret-like fields are always replaced with{' '}
            <code>[redacted]</code>.
          </p>
        </aside>
      </div>
      {message ? (
        <div class="notice info" aria-live="polite">
          {message}
        </div>
      ) : null}
      <div class="backup-actions">
        <p>
          This backup contains saved redacted structures, names, notes and settings. Keep the file
          private.
        </p>
        <button
          class="button secondary"
          type="button"
          onClick={() =>
            void exportBackup().then(
              (backup) => {
                const href = URL.createObjectURL(
                    new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }),
                  ),
                  link = document.createElement('a')
                link.href = href
                link.download = 'decoding-local-backup.json'
                link.click()
                setTimeout(() => URL.revokeObjectURL(href), 0)
              },
              () => setMessage('Backup unavailable: this browser blocked local storage.'),
            )
          }
        >
          Back up this device
        </button>
        <label class="button secondary">
          Restore backup
          <input
            class="visually-hidden"
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0]
              if (file)
                void file
                  .text()
                  .then(restoreBackup)
                  .then(
                    async (count) => {
                      setMessage(`Restored ${count} new records. Existing IDs were kept.`)
                      await refresh()
                    },
                    () =>
                      setMessage(
                        'This backup could not be restored. Invalid files change nothing; check browser storage access.',
                      ),
                  )
            }}
          />
        </label>
      </div>
      <label>
        Find saved records
        <input
          type="search"
          value={query}
          onInput={(event) => setQuery(event.currentTarget.value)}
          placeholder="Name, format or warning rule"
        />
      </label>
      <div class="workspace-list-heading">
        <div>
          <span class="eyebrow">Stored locally</span>
          <h2>
            {records.length
              ? `${records.length} redacted records`
              : 'Save a result to collect it here'}
          </h2>
          <p>
            {usage.usage !== null && usage.quota !== null
              ? `${bytes(usage.usage)} used of an estimated ${bytes(usage.quota)} browser quota.`
              : 'Browser storage usage is unavailable.'}
          </p>
        </div>
        <div class="input-actions">
          <button
            class="button secondary"
            type="button"
            disabled={!records.length}
            onClick={exportRecords}
          >
            Export preview
          </button>
          <button
            class="button danger"
            type="button"
            disabled={!records.length}
            onClick={() => void clearWorkspace().then(refresh)}
          >
            Clear workspace
          </button>
        </div>
      </div>
      <div class="workspace-records">
        {records
          .filter(
            (record) =>
              !query ||
              [record.name, record.note, record.format, ...record.ruleIds]
                .join(' ')
                .toLowerCase()
                .includes(query.toLowerCase()),
          )
          .map((record) => (
            <article class="workspace-record" key={record.id}>
              <div>
                <span class="pack-badge">{record.format}</span>
                <h3>{record.name}</h3>
                <p>{record.note || 'No note.'}</p>
                <small>
                  Created {new Date(record.createdAt).toLocaleString()} ·{' '}
                  {record.expiresAt
                    ? `expires ${new Date(record.expiresAt).toLocaleString()}`
                    : 'kept locally'}
                </small>
              </div>
              <pre>
                <code>{JSON.stringify(record.structure, null, 2)}</code>
              </pre>
              <button
                class="button secondary"
                type="button"
                onClick={() => {
                  setEditingId(record.id)
                  setName(record.name)
                  setNote(record.note)
                  setFormat(record.format)
                  setSource(JSON.stringify(record.structure, null, 2))
                  setRules(record.ruleIds.join(', '))
                  document.querySelector<HTMLInputElement>('.workspace-editor input')?.focus()
                }}
              >
                Open / edit
              </button>
              <button
                class="button ghost small"
                type="button"
                onClick={() => void deleteWorkspaceRecord(record.id).then(refresh)}
              >
                Delete
              </button>
            </article>
          ))}
        {records.length &&
        query &&
        !records.some((record) =>
          [record.name, record.note, record.format, ...record.ruleIds]
            .join(' ')
            .toLowerCase()
            .includes(query.toLowerCase()),
        ) ? (
          <div class="empty-catalog">
            No records match.
            <button class="button ghost" type="button" onClick={() => setQuery('')}>
              Clear filter
            </button>
          </div>
        ) : null}
        {!records.length ? (
          <div class="empty-catalog">
            Nothing saved. Raw decoder input is never added automatically.
          </div>
        ) : null}
      </div>
    </section>
  )
}
