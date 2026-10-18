import type { Detection } from '@decoding/engine'
import type { DecoderMessages } from './messages'
export function CandidateCompare({
  candidates,
  messages,
}: {
  candidates: Detection[]
  messages: DecoderMessages
}) {
  if (candidates.length < 2) return null
  return (
    <details class="candidate-comparison">
      <summary>{messages.locale === 'ko' ? '왜 이 후보인가요?' : 'Why these candidates?'}</summary>
      <table>
        <thead>
          <tr>
            <th>{messages.possibleFormats}</th>
            <th>%</th>
            <th>
              {messages.locale === 'ko'
                ? '근거 / 자동 선택을 멈춘 이유'
                : 'Evidence / reason automatic selection stopped'}
            </th>
          </tr>
        </thead>
        <tbody>
          {candidates.slice(0, 5).map((candidate, i) => (
            <tr key={candidate.detector}>
              <th>{candidate.label}</th>
              <td>{Math.round(candidate.confidence * 100)}</td>
              <td>
                {candidate.evidence.map((e) => e.message).join('; ')}
                <br />
                {candidate.rejection ? <code>{candidate.rejection.code}</code> : null}
                <br />
                {i > 0 && candidates[0]!.confidence - candidate.confidence >= 0.15
                  ? messages.locale === 'ko'
                    ? '1위보다 근거 점수가 15점 이상 낮아요.'
                    : 'At least 15 confidence points below the first candidate.'
                  : messages.locale === 'ko'
                    ? '85% 확신과 15점 차이가 없으면 자동 확정하지 않아요.'
                    : 'Automatic selection requires 85% confidence and a 15-point lead.'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}
