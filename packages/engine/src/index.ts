export { decode, detect, DEFAULT_LIMITS } from './engine'
export { defaultDetectors } from './detectors'
export { decodeBase64, encodeBase64, inputBytes, inputText, isProbablyUtf8 } from './utils'
export type {
  ChainNode,
  DecodeInput,
  DecodeCodecs,
  DecodeLimits,
  DecodeResult,
  Detection,
  Detector,
  Evidence,
  LintWarning,
} from './types'

export { redactSecrets } from './formats/secret-patterns'

export type { DecodeOptions } from './engine'
export { identifyMagic } from './formats/magic-bytes'

export { LocalParserUnavailableError } from './types'
export { parserPosition } from './formats/common'

export { redactedDetection } from './redacted-detection'

export { repairGarbled } from './formats/garbled'

export { maskCredentialFields } from './formats/credential-redaction'

export type { EngineMessageCode } from './message-codes'
export type { MessageFact, SafeName } from './message-facts'
export { safeName, algorithmName } from './message-facts'
export { diagnosticField, withDiagnosticFields } from './diagnostics'

export { parseCurlRequest, CurlParseError } from './formats/curl-request'
export type { CurlRequest } from './formats/curl-request'
