import { formatEngineMessage } from '@decoding/presentation'
import { NextStep } from './NextStep'
import { ClassicalCandidates } from './ClassicalCandidates'
import type { DecodeResult, Detection } from '@decoding/engine'
import type { DecoderMessages } from './messages'
import {
  answerMessages,
  answerSentence,
  primaryLayers,
  warningTitle,
  answerFacts,
} from './answer-copy'
import {
  displayValue,
  finalSelection,
  outputText,
  privateKeyDetection,
  selectionNode,
} from './result-text'

export function AnswerCard({
  result,
  source,
  messages,
  onCopy,
  onManual,
  onTool,
  selected,
  onSelectLayer,
}: {
  result: DecodeResult
  selected: Detection | null
  onSelectLayer: (nodeId: string) => void
  source: string
  messages: DecoderMessages
  onCopy: () => void
  onManual: () => void
  onTool?: ((tool: string, text: string) => void) | undefined
}) {
  const copy = answerMessages(messages.locale),
    final = privateKeyDetection(result.root) ?? selected ?? finalSelection(result.root),
    layers = primaryLayers(result.root),
    protectedContent = privateKeyDetection(result.root)
  const allNodes = (node: DecodeResult['root']): DecodeResult['root'][] => [
    node,
    ...node.children.flatMap(allNodes),
  ]
  const warnings = allNodes(result.root)
    .flatMap((node) => [
      ...(node.selected?.warnings ?? []),
      ...node.candidates.flatMap((candidate) =>
        candidate.warnings.filter((warning) => warning.severity === 'danger'),
      ),
    ])
    .filter((item, index, all) => all.findIndex((other) => other.ruleId === item.ruleId) === index)
  const diagnostics = layers.flatMap((node) =>
    (node.selected?.diagnostics ?? []).map((item) =>
      formatEngineMessage(item.message, messages.locale, node.selected),
    ),
  )
  const color = final?.detector === 'color' ? (final.value as { hex?: string }).hex : undefined
  const facts = answerFacts(result.root.selected, messages.locale)
  return (
    <section class="answer-card" aria-label={messages.localResult}>
      <h2 class="answer-verdict">
        {answerSentence(
          result.root,
          messages.locale,
          source,
          selectionNode(result.root, final)?.id,
        )}
      </h2>
      {warnings.length ? (
        <section class="answer-concerns">
          <h3>
            {copy.concerns} · {warnings.length}
          </h3>
          <ul>
            {warnings.map((warning) => (
              <li key={warning.ruleId}>
                <strong>{warningTitle(warning, messages.locale)}</strong>
                <details>
                  <summary>{messages.diagnosticDetails}</summary>
                  <a
                    href={`/${messages.locale === 'en' ? '' : `${messages.locale}/`}rules/${warning.ruleId.toLowerCase()}/`}
                  >
                    {warning.ruleId}
                  </a>
                  <p>{formatEngineMessage(warning.message, messages.locale)}</p>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ) : final && !diagnostics.length ? (
        <p class="answer-no-concerns">{copy.none}</p>
      ) : null}
      {diagnostics.length ? (
        <ul class="answer-concerns">
          {diagnostics.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
      ) : null}
      {!final ? (
        <div class="unknown-actions">
          <button
            class="button secondary"
            type="button"
            onClick={() => onTool?.('string-inspector', source)}
          >
            {copy.inspect}
          </button>
          <button class="button secondary" type="button" onClick={onManual}>
            {copy.manual}
          </button>
          <NextStep
            source={source}
            result={result}
            locale={messages.locale}
            {...(onTool ? { onTool } : {})}
          />
        </div>
      ) : null}
      {color && /^#[a-f\d]{6}(?:[a-f\d]{2})?$/i.test(color) ? (
        <div
          class="color-preview"
          role="img"
          aria-label={`${copy.colorPreview}: ${color}`}
          style={{ backgroundColor: color }}
        />
      ) : null}
      {final ? (
        <div class="answer-final">
          <div class="answer-final-heading">
            <h3>{copy.final}</h3>
            <button class="button primary" type="button" onClick={onCopy} aria-label={copy.copy}>
              {messages.copy}
            </button>
          </div>
          {layers.length > 1 && !protectedContent ? (
            <div class="result-layer-choices" role="group" aria-label={copy.layers}>
              {layers.map((node, index) => (
                <button
                  class="button secondary"
                  type="button"
                  key={node.id}
                  aria-pressed={node.selected === final}
                  onClick={() => onSelectLayer(node.id)}
                >
                  {index + 1} · {node.selected?.label}
                  {node.status === 'ambiguous' ? ` · ${copy.uncertain}` : ''}
                </button>
              ))}
            </div>
          ) : null}
          {final === finalSelection(result.root) &&
          layers.at(-1)?.selected !== final &&
          !protectedContent ? (
            <p class="result-selection-note">{copy.readableSelection}</p>
          ) : null}
          <pre class="output-view">
            <code>{outputText(displayValue(final))}</code>
          </pre>
        </div>
      ) : null}
      {final?.detector === 'curl-command' && onTool ? (
        <button
          type="button"
          class="button secondary"
          onClick={() => onTool('curl-to-code', source)}
        >
          {copy.curlToCode}
        </button>
      ) : null}
      {facts.length ? (
        <section>
          <h3>{copy.facts}</h3>
          <dl class="answer-facts">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
      {!protectedContent ? (
        <ClassicalCandidates root={result.root} source={source} messages={messages} />
      ) : null}
      {layers.length ? (
        <section class="answer-layers">
          <h3>
            {copy.layers} · {layers.length}
          </h3>
          <ol>
            {layers.map((node, index) => (
              <li
                key={node.id}
                data-layer={index % 4}
                style={{ marginInlineStart: `${Math.min(index, 3) * 10}px` }}
              >
                <details>
                  <summary>
                    {index + 1} · {node.selected?.label}
                    {node.status === 'ambiguous' ? ` · ${copy.uncertain}` : ''}
                  </summary>
                  <pre>
                    <code>
                      {protectedContent
                        ? copy.contentsHidden
                        : index === 0
                          ? source
                          : outputText(layers[index - 1]?.selected?.decoded)}
                    </code>
                  </pre>
                  <p>
                    {node.selected
                      ? formatEngineMessage(node.selected.summary, messages.locale, node.selected)
                      : ''}
                  </p>
                  {node.selected?.detector === 'epoch' && node.status === 'ambiguous' ? (
                    <p>{copy.numberAlternative}</p>
                  ) : null}
                  {node.candidates.length > 1 ? (
                    <p>
                      {copy.alternate}:{' '}
                      {node.candidates
                        .filter((candidate) => candidate !== node.selected)
                        .map((candidate) => candidate.label)
                        .join(' · ')}
                    </p>
                  ) : null}
                </details>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </section>
  )
}
