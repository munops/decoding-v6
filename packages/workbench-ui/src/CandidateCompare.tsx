import { uiMessage } from './ui-copy'
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
      <summary>{uiMessage(messages.locale, 'why_these_candidates')}</summary>
      <table>
        <thead>
          <tr>
            <th>{messages.possibleFormats}</th>
            <th>%</th>
            <th>{uiMessage(messages.locale, 'evidence_reason_automatic_selection_stopped')}</th>
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
                  ? uiMessage(
                      messages.locale,
                      'at_least_15_confidence_points_below_the_first_candidate',
                    )
                  : uiMessage(
                      messages.locale,
                      'automatic_selection_requires_85_confidence_and_a_15_point_lead',
                    )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  )
}
