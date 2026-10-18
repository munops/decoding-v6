import { webCodecs } from './codecs'
/// <reference lib="webworker" />
import { decode, type DecodeInput, type Detection } from '@decoding/engine'

async function enrich(detection: Detection, input: DecodeInput): Promise<Detection> {
  const detail = detection.metadata?.detail
  if (typeof detail !== 'string') return detection
  try {
    const { executeOperation } = await import('@decoding/operations')
    const operation = (
      {
        yaml: 'yaml-to-json',
        xml: 'xml-format',
        x509: 'x509-decoder',
        cron: 'cron-parser',
      } as Record<string, string>
    )[detail]
    if (!operation) return detection
    const result = await executeOperation(operation, input)
    const value =
      detail === 'cron'
        ? { ...(detection.value as Record<string, unknown>), description: result.output }
        : detail === 'yaml' && typeof result.output === 'string'
          ? JSON.parse(result.output)
          : result.output
    return {
      ...detection,
      value,
      warnings: [
        ...detection.warnings,
        ...(detail === 'x509' &&
        typeof value === 'object' &&
        value !== null &&
        'notAfter' in value &&
        new Date(String(value.notAfter)).getTime() < Date.now()
          ? [
              {
                ruleId: 'CERT-EXPIRED',
                severity: 'danger' as const,
                message: 'This certificate has expired.',
              },
            ]
          : []),
      ],
    }
  } catch (error) {
    return {
      ...detection,
      value: {
        error:
          detail === 'x509'
            ? 'Certificate DER parsing failed'
            : `This ${detail} layer could not be parsed.`,
        line: error instanceof Error ? /line\s+(\d+)/i.exec(error.message)?.[1] : undefined,
      },
      warnings: [
        ...detection.warnings,
        {
          ruleId: 'LOCAL-PARSER-UNAVAILABLE',
          severity: 'warning',
          message:
            'The local parser failed or is not cached. Open it online once, then retry. Earlier layers are kept.',
        },
      ],
    }
  }
}
self.addEventListener(
  'message',
  (event: MessageEvent<{ id: number; input: DecodeInput; overrides?: Record<string, string> }>) => {
    const { id, input, overrides } = event.data
    void decode(input, { enrich, codecs: webCodecs, ...(overrides ? { overrides } : {}) })
      .then((result) => self.postMessage({ id, result }))
      .catch(() =>
        self.postMessage({
          id,
          error: 'Local decoding could not finish. Your input is kept; retry or clear it.',
        }),
      )
  },
)
