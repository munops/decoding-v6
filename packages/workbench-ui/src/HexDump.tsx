import { useState } from 'preact/hooks'
import { completionMessages } from './completion-messages'
import type { WorkbenchLocale } from './messages'
export function hexDump(bytes: Uint8Array, maxBytes = 4096): string {
  return Array.from({ length: Math.ceil(Math.min(bytes.length, maxBytes) / 8) }, (_, i) => {
    const offset = i * 8,
      chunk = bytes.subarray(offset, offset + 8)
    return `${offset.toString(16).padStart(6, '0')}  ${Array.from(chunk, (b) =>
      b.toString(16).padStart(2, '0'),
    )
      .join(' ')
      .padEnd(
        23,
      )}  ${Array.from(chunk, (b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.')).join('')}`
  }).join('\n')
}
export function HexDump({ bytes, locale }: { bytes: Uint8Array; locale: WorkbenchLocale }) {
  const [limit, setLimit] = useState(4096),
    [message, setMessage] = useState(''),
    copy = completionMessages[locale]
  return (
    <details class="hex-inspector">
      <summary>{copy.hex}</summary>
      {bytes.length ? (
        <>
          <pre>
            <code>{hexDump(bytes, limit)}</code>
          </pre>
          {limit < bytes.length ? (
            <button class="button secondary" type="button" onClick={() => setLimit(limit + 4096)}>
              {copy.more} · 4 KiB
            </button>
          ) : null}
          <button
            class="button secondary"
            type="button"
            onClick={() =>
              void navigator.clipboard.writeText(hexDump(bytes, limit)).then(
                () => setMessage('Copied'),
                () => setMessage('Clipboard unavailable'),
              )
            }
          >
            {locale === 'ko' ? '덤프 복사' : 'Copy dump'}
          </button>
          <p role="status">{message}</p>
        </>
      ) : (
        <p>{copy.noBytes}</p>
      )}
    </details>
  )
}
