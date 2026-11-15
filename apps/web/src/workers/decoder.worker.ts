import { safeName } from '@decoding/engine'
import { webCodecs } from './codecs'
/// <reference lib="webworker" />
import {
  decode,
  diagnosticField,
  withDiagnosticFields,
  LocalParserUnavailableError,
  parserPosition,
  type DecodeInput,
  type Detection,
} from '@decoding/engine'

async function enrich(detection: Detection, input: DecodeInput): Promise<Detection> {
  const detail = detection.metadata?.detail
  if (typeof detail !== 'string' || detail === 'cron') return detection
  try {
    let operations
    try {
      operations = await import('@decoding/operations')
    } catch {
      throw new LocalParserUnavailableError()
    }
    const { executeOperation } = operations
    const operation = (
      {
        yaml: 'yaml-to-json',
        xml: 'xml-format',
        x509: 'x509-decoder',
        cron: 'cron-parser',
      } as Record<string, string>
    )[detail]
    if (!operation) return detection
    if (detection.warnings.some((item) => item.ruleId === 'XML-MALFORMED')) return detection
    const result = await executeOperation(operation, input)
    const value =
      detail === 'yaml' && typeof result.output === 'string'
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
                message: { code: 'warning-cert-expired' as const },
              },
            ]
          : []),
      ],
    }
  } catch (error) {
    const unavailable =
      error instanceof LocalParserUnavailableError ||
      (error instanceof TypeError && /fetch|import|module|network/i.test(error.message))
    return withDiagnosticFields({
      ...detection,
      value: {
        error: diagnosticField(
          detail === 'x509'
            ? { code: 'diagnostic-worker-certificate' }
            : { code: 'diagnostic-worker-layer', params: { format: safeName(detail) } },
        ),
        ...parserPosition(error),
      },
      warnings: [
        ...detection.warnings,
        {
          ruleId: unavailable ? 'LOCAL-PARSER-UNAVAILABLE' : `${detail.toUpperCase()}-INVALID`,
          severity: 'warning',
          message: unavailable
            ? { code: 'warning-local-parser-unavailable' }
            : {
                code: 'warning-decoder-worker',
                params: { format: safeName(detail.toUpperCase()) },
              },
        },
      ],
    })
  }
}
self.addEventListener(
  'message',
  (event: MessageEvent<{ id: number; input: DecodeInput; overrides?: Record<string, string> }>) => {
    const { id, input, overrides } = event.data
    void decode(input, {
      previewAmbiguous: true,
      enrich,
      codecs: webCodecs,
      ...(overrides ? { overrides } : {}),
    })
      .then((result) => self.postMessage({ id, result }))
      .catch(() =>
        self.postMessage({
          id,
          error: { code: 'decode-failed' },
        }),
      )
  },
)
