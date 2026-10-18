import type { DecodeResult } from '@decoding/engine'
import type { WorkbenchLocale } from './messages'
import { completionMessages } from './completion-messages'
import { nearbyTools, safeReport } from './safe-report'
import { useState } from 'preact/hooks'
export function NextStep({
  source,
  result,
  locale,
  onTool,
}: {
  source: string
  result: DecodeResult
  locale: WorkbenchLocale
  onTool?: (tool: string, text: string) => void
}) {
  const [message, setMessage] = useState(''),
    copy = completionMessages[locale],
    report = safeReport(source, result),
    tools = nearbyTools(source)
  return (
    <section class="next-step">
      {tools.length ? (
        <div class="input-actions">
          {tools.map((id) => (
            <a
              class="button secondary"
              href={`/${id}/`}
              onClick={(event) => {
                if (onTool) {
                  event.preventDefault()
                  onTool(id, source)
                }
              }}
              key={id}
            >
              {id}
            </a>
          ))}
        </div>
      ) : (
        <p>{copy.noNext}</p>
      )}
      <button
        type="button"
        class="button secondary"
        onClick={() =>
          void navigator.clipboard.writeText(report).then(
            () =>
              setMessage(
                locale === 'ko' ? '값 없는 신고문을 복사했어요.' : 'Value-free report copied.',
              ),
            () => setMessage('support@munops.com'),
          )
        }
      >
        {copy.request}
      </button>
      <a
        class="button ghost"
        href={`mailto:support@munops.com?subject=decod.ing%20format%20request&body=${encodeURIComponent(report)}`}
      >
        support@munops.com
      </a>
      <p role="status">{message}</p>
    </section>
  )
}
