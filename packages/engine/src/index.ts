export { decode, detect, DEFAULT_LIMITS } from './engine'
export { defaultDetectors } from './detectors'
export { decodeBase64, encodeBase64, inputBytes, inputText } from './utils'
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
