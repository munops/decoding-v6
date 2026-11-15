import { useEffect, useMemo, useState } from 'preact/hooks'
import { maskCredentialFields } from '@decoding/engine'
import { savedCopy } from '@decoding/workbench-ui'
import type { Locale } from '../i18n/catalog'
import { exportBackup, parseBackup, restoreBackup } from '../lib/backup'
import {
  clearWorkspace,
  deleteWorkspaceRecord,
  listWorkspaceRecords,
  redactStructure,
  saveWorkspaceRecord,
  updateWorkspaceRecord,
  type WorkspaceRecord,
  type WorkspaceTtl,
} from '../lib/workspace'
const sample = '{\n  "count": 42,\n  "token": "synthetic"\n}'
export default function WorkspaceManager({ locale = 'en' }: { locale?: Locale }) {
  const copy = savedCopy(locale)
  const [records, setRecords] = useState<WorkspaceRecord[]>([]),
    [query, setQuery] = useState(''),
    [name, setName] = useState(''),
    [note, setNote] = useState(''),
    [format, setFormat] = useState('JSON'),
    [source, setSource] = useState(sample),
    [rules, setRules] = useState(''),
    [ttl, setTtl] = useState<WorkspaceTtl>('7d'),
    [valueMode, setMode] = useState<'structure' | 'values'>('structure'),
    [message, setMessage] = useState(''),
    [editing, setEditing] = useState<WorkspaceRecord | null>(null)
  const refresh = async () => setRecords(await listWorkspaceRecords())
  useEffect(() => {
    void refresh().catch(() => setMessage(copy.failed))
  }, [])
  const preview = useMemo(() => {
    try {
      const value = JSON.parse(source)
      return JSON.stringify(
        valueMode === 'values' ? maskCredentialFields(value) : redactStructure(value),
        null,
        2,
      )
    } catch {
      return copy.invalidJson
    }
  }, [source, valueMode, copy])
  const save = async () => {
    if (!name.trim()) {
      setMessage(copy.nameRequired)
      return
    }
    try {
      await saveWorkspaceRecord({
        name,
        note,
        format,
        structure: JSON.parse(source),
        ruleIds: rules.split(',').map((rule) => rule.trim()),
        ttl,
        valueMode,
      })
      setMessage(copy.saved)
      await refresh()
    } catch {
      setMessage(copy.failed)
    }
  }
  const download = async () => {
    if (records.some((record) => record.valueMode === 'values') && !confirm(copy.backupWarning))
      return
    try {
      const backup = await exportBackup({ allowValues: true }),
        href = URL.createObjectURL(
          new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }),
        ),
        link = document.createElement('a')
      link.href = href
      link.download = 'decoding-local-backup.json'
      link.click()
      setTimeout(() => URL.revokeObjectURL(href), 0)
      setMessage(copy.exported)
    } catch {
      setMessage(copy.backupFailed)
    }
  }
  const restore = async (file?: File) => {
    if (!file || file.size > 10 * 1024 * 1024) return
    try {
      const text = await file.text(),
        backup = parseBackup(text)
      if (
        backup.records.some((record) => record.valueMode === 'values') &&
        !confirm(copy.restoreWarning)
      )
        return
      await restoreBackup(text, { allowValues: true })
      setMessage(copy.restored)
      await refresh()
    } catch {
      setMessage(copy.backupFailed)
    }
  }
  const visible = records.filter((record) =>
    [record.name, record.format, record.note, ...record.ruleIds]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase()),
  )
  return (
    <section class="workspace-manager" data-hydrated="true">
      <label>
        {copy.search}
        <input
          type="search"
          value={query}
          onInput={(event) => setQuery(event.currentTarget.value)}
          placeholder={copy.searchHint}
        />
      </label>
      <div class="workspace-list-heading">
        <h2>{records.length ? `${copy.records} · ${records.length}` : copy.empty}</h2>
      </div>
      <div class="workspace-records">
        {visible.map((record) => (
          <article class="workspace-record" key={record.id}>
            <div>
              <span class="eyebrow">{record.format}</span>
              <h3>{record.name}</h3>
              <p>{record.valueMode === 'values' ? copy.included : copy.masked}</p>
              <p>
                {copy.created}: {new Date(record.createdAt).toLocaleString(locale)} · {copy.expires}
                : {record.expiresAt ? new Date(record.expiresAt).toLocaleString(locale) : copy.kept}
              </p>
            </div>
            <details>
              <summary>{copy.open}</summary>
              <p>{record.note || copy.emptyNote}</p>
              <pre class="output-view">
                <code>{JSON.stringify(record.structure, null, 2)}</code>
              </pre>
              <button
                class="button secondary"
                type="button"
                onClick={() =>
                  void navigator.clipboard
                    .writeText(JSON.stringify(record.structure, null, 2))
                    .then(() => setMessage(copy.copied))
                }
              >
                {copy.copy}
              </button>
            </details>
            <button
              class="button secondary"
              type="button"
              onClick={() => setEditing({ ...record })}
            >
              {copy.edit}
            </button>
            <button
              class="button ghost"
              type="button"
              onClick={() => void deleteWorkspaceRecord(record.id).then(refresh)}
            >
              {copy.remove}
            </button>
          </article>
        ))}
      </div>
      {!visible.length && query ? <p>{copy.noMatch}</p> : null}
      {editing ? (
        <form
          class="save-panel"
          onSubmit={(event) => {
            event.preventDefault()
            void updateWorkspaceRecord(editing.id, { name: editing.name, note: editing.note }).then(
              () => {
                setEditing(null)
                setMessage(copy.editDone)
                return refresh()
              },
              () => setMessage(copy.failed),
            )
          }}
        >
          <label>
            {copy.name}
            <input
              value={editing.name}
              maxLength={100}
              required
              onInput={(event) => setEditing({ ...editing, name: event.currentTarget.value })}
            />
          </label>
          <label>
            {copy.note}
            <textarea
              value={editing.note}
              maxLength={2000}
              onInput={(event) => setEditing({ ...editing, note: event.currentTarget.value })}
            />
          </label>
          <button class="button primary" type="submit">
            {copy.save}
          </button>
          <button class="button ghost" type="button" onClick={() => setEditing(null)}>
            {copy.cancel}
          </button>
        </form>
      ) : null}
      <p class="privacy-line">
        <span class="privacy-dot" aria-hidden="true" />
        {copy.storage}
      </p>
      <div class="backup-actions">
        <button
          class="button danger"
          type="button"
          disabled={!records.length}
          onClick={() => {
            if (confirm(copy.clearConfirm)) void clearWorkspace().then(refresh)
          }}
        >
          {copy.clear}
        </button>
        <p>{copy.backupNote}</p>
        <button class="button secondary" type="button" onClick={() => void download()}>
          {copy.backup}
        </button>
        <label class="button secondary">
          {copy.restore}
          <input
            class="visually-hidden"
            type="file"
            accept="application/json,.json"
            onChange={(event) => void restore(event.currentTarget.files?.[0])}
          />
        </label>
      </div>
      <details class="workspace-manual">
        <summary>{copy.manual}</summary>
        <form
          class="workspace-editor"
          onSubmit={(event) => {
            event.preventDefault()
            void save()
          }}
        >
          <label>
            {copy.name}
            <input
              value={name}
              required
              maxLength={100}
              onInput={(event) => setName(event.currentTarget.value)}
            />
          </label>
          <label>
            {copy.format}
            <input
              value={format}
              maxLength={80}
              onInput={(event) => setFormat(event.currentTarget.value)}
            />
          </label>
          <label>
            {copy.json}
            <textarea
              value={source}
              onInput={(event) => setSource(event.currentTarget.value)}
              spellcheck={false}
            />
          </label>
          <label>
            {copy.note}
            <textarea
              value={note}
              maxLength={2000}
              onInput={(event) => setNote(event.currentTarget.value)}
            />
          </label>
          <label>
            {copy.rules}
            <input value={rules} onInput={(event) => setRules(event.currentTarget.value)} />
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
            <select
              value={ttl}
              onChange={(event) => setTtl(event.currentTarget.value as WorkspaceTtl)}
            >
              <option value="24h">{copy.day}</option>
              <option value="7d">{copy.week}</option>
              <option value="keep">{copy.keep}</option>
            </select>
          </label>
          {valueMode === 'values' ? <p class="notice warning">{copy.localWarning}</p> : null}
          <h3>{copy.preview}</h3>
          <pre class="output-view">
            <code>{preview}</code>
          </pre>
          <button class="button primary" type="submit">
            {copy.save}
          </button>
        </form>
      </details>
      {message ? (
        <p class="notice info" role="status">
          {message}
        </p>
      ) : null}
    </section>
  )
}
