export type DecodeInput = string | Uint8Array

export type Evidence = {
  code: string
  message: string
  weight: number
}

export type LintWarning = {
  ruleId: string
  severity: 'info' | 'warning' | 'danger'
  message: string
  specUrl?: string
}

export type Detection = {
  detector: string
  label: string
  confidence: number
  evidence: Evidence[]
  rejection?: {
    code: 'below-auto-threshold' | 'insufficient-margin' | 'lower-ranked'
    message: string
  }
  summary: string
  value: unknown
  decoded?: DecodeInput
  warnings: LintWarning[]
  metadata?: Record<string, unknown>
}

export type DecodeCodecs = {
  zstd?: (bytes: Uint8Array, limits: DecodeLimits) => Promise<Uint8Array>
  brotli?: (bytes: Uint8Array, limits: DecodeLimits) => Promise<Uint8Array>
  msgpack?: (bytes: Uint8Array) => Promise<unknown>
  cbor?: (bytes: Uint8Array) => Promise<unknown>
  toml?: (text: string) => Promise<unknown>
}
export type DetectorContext = {
  codecs?: DecodeCodecs

  signal?: AbortSignal
  now: Date
  limits: DecodeLimits
}

export type Detector = {
  id: string
  detect(input: DecodeInput, context: DetectorContext): Detection | null | Promise<Detection | null>
}

export type DecodeLimits = {
  maxInputBytes: number
  maxExpandedBytes: number
  maxCompressionRatio: number
  maxDepth: number
  maxNodes: number
  maxCpuMs: number
}

export type ChainNode = {
  id: string
  depth: number
  bytes?: Uint8Array
  inputKind: 'text' | 'bytes'
  inputSize: number
  sourcePath?: string
  candidates: Detection[]
  selected?: Detection
  children: ChainNode[]
  status: 'confident' | 'ambiguous' | 'unsupported' | 'limit'
  limitReason?: string
}

export type DecodeResult = {
  root: ChainNode
  nodes: number
  elapsedMs: number
  limits: DecodeLimits
}

/** Loading failed before any parser examined the input. Safe to serialize by name. */
export class LocalParserUnavailableError extends Error {
  constructor() {
    super('Open this local parser once online, then retry. Earlier layers and raw bytes are kept.')
    this.name = 'LocalParserUnavailableError'
  }
}
