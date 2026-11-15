import { encodeBase64, type DecodeInput, type DecodeResult } from '@decoding/engine'
const MIN = 8,
  MAX = 65536
export type ProofInputKind = 'none' | 'text' | 'short' | 'large' | 'file'
export type ProofSnapshot = {
  running: boolean
  inputKind: ProofInputKind
  matches: number
  calls: number
  resources: number
  uninspected: number
  seconds: number
  coverage: { fetch: boolean; xhr: boolean; beacon: boolean; resources: boolean }
}
async function bodyText(body: unknown): Promise<{ text: string; unknown: boolean }> {
  if (body === undefined || body === null) return { text: '', unknown: false }
  if (typeof body === 'string')
    return body.length <= MAX ? { text: body, unknown: false } : { text: '', unknown: true }
  if (body instanceof URLSearchParams) return bodyText(body.toString())
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    const parts: string[] = []
    let unknown = false,
      size = 0
    for (const [name, part] of body) {
      const read = await bodyText(part)
      size += name.length + read.text.length
      if (size > MAX) return { text: '', unknown: true }
      parts.push(name + '=' + read.text)
      unknown ||= read.unknown
    }
    return { text: parts.join('&'), unknown }
  }
  if (typeof Blob !== 'undefined' && body instanceof Blob)
    return body.size <= MAX
      ? { text: await body.text(), unknown: false }
      : { text: '', unknown: true }
  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    const bytes =
      body instanceof ArrayBuffer
        ? new Uint8Array(body)
        : new Uint8Array(body.buffer, body.byteOffset, body.byteLength)
    if (bytes.length > MAX) return { text: '', unknown: true }
    try {
      return { text: new TextDecoder('utf-8', { fatal: true }).decode(bytes), unknown: false }
    } catch {
      return { text: '', unknown: true }
    }
  }
  return { text: '', unknown: true }
}
function headerText(headers: unknown): { text: string; unknown: boolean } {
  if (headers == null) return { text: '', unknown: false }
  try {
    let pairs: unknown[][] = [],
      unknown = false
    if (headers instanceof Headers) pairs = [...Headers.prototype.entries.call(headers)]
    else if (Array.isArray(headers)) {
      for (const pair of headers) {
        if (Array.isArray(pair) && pair.length === 2) pairs.push(pair)
        else unknown = true
      }
    } else if (typeof headers === 'object') {
      for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(headers))) {
        if (!descriptor.enumerable) continue
        if ('value' in descriptor) pairs.push([name, descriptor.value])
        else {
          pairs.push([name, ''])
          unknown = true
        }
      }
    } else return { text: '', unknown: true }
    const parts: string[] = []
    let size = 0
    for (const pair of pairs) {
      for (const part of pair) {
        if (!['string', 'number', 'boolean'].includes(typeof part)) {
          unknown = true
          continue
        }
        const text = String(part)
        size += text.length + 1
        if (size > MAX) return { text: parts.join('\n'), unknown: true }
        parts.push(text)
      }
    }
    return { text: parts.join('\n'), unknown }
  } catch {
    return { text: '', unknown: true }
  }
}
/** Current-value, memory-only ledger. Snapshots contain counts and coverage, never values/URLs. */
export function createProofObservation(now: () => number = () => performance.now()) {
  let running = false,
    inputKind: ProofInputKind = 'none',
    matches = 0,
    calls = 0,
    resources = 0,
    uninspected = 0,
    pending = 0,
    since = 0,
    version = 0
  const signatures = new Set<string>(),
    apiUrls = new Map<string, number>(),
    listeners = new Set<() => void>()
  const coverage = { fetch: false, xhr: false, beacon: false, resources: false }
  const emit = () => {
    for (const listener of listeners) listener()
  }
  const add = (text: string) => {
    if (!text) return
    if (text.length < MIN || text.length > MAX || signatures.size >= 64) {
      uninspected++
      return
    }
    const variants = [text, JSON.stringify(text).slice(1, -1)]
    try {
      variants.push(encodeURIComponent(text), new URLSearchParams({ v: text }).toString().slice(2))
    } catch {
      uninspected++
    }
    try {
      variants.push(JSON.stringify(JSON.parse(text)))
    } catch {
      /* Non-JSON text is still observed. */
    }
    const bytes = new TextEncoder().encode(text)
    variants.push(encodeBase64(bytes), encodeBase64(bytes, true))
    for (const value of variants) {
      if (!value || signatures.has(value)) continue
      if (signatures.size >= 64) {
        uninspected++
        break
      }
      signatures.add(value)
    }
  }
  const contains = (text: string) =>
    text.length > 0 && [...signatures].some((value) => text.includes(value))
  const normalize = (url: string) => {
    try {
      const parsed = new URL(
        url,
        typeof location === 'undefined' ? 'https://local.invalid' : location.href,
      )
      parsed.hash = ''
      return parsed.href
    } catch {
      return url
    }
  }
  const snapshot = (): ProofSnapshot => ({
    running,
    inputKind,
    matches,
    calls,
    resources,
    uninspected: uninspected + pending,
    seconds: running ? Math.max(0, Math.floor((now() - since) / 1000)) : 0,
    coverage: { ...coverage },
  })
  const setInput = (input: DecodeInput, kind: 'text' | 'file' = 'text') => {
    version++
    signatures.clear()
    apiUrls.clear()
    matches = calls = resources = uninspected = pending = 0
    since = running ? now() : 0
    inputKind =
      kind === 'file' || typeof input !== 'string'
        ? 'file'
        : !input
          ? 'none'
          : input.length < MIN
            ? 'short'
            : input.length > MAX
              ? 'large'
              : 'text'
    if (inputKind === 'text') add(input as string)
    emit()
    return version
  }
  const addResult = (result: DecodeResult, revision: number) => {
    if (revision !== version) return
    let nodes = 0
    const walk = (node: DecodeResult['root']) => {
      if (++nodes > 64) {
        uninspected++
        return
      }
      const detection = node.selected
      if (typeof detection?.decoded === 'string') add(detection.decoded)
      if (typeof detection?.value === 'string') add(detection.value)
      for (const child of node.children) walk(child)
    }
    walk(result.root)
    emit()
  }
  const observeApi = async (
    url: string,
    body?: unknown,
    headers?: unknown,
    unknownBody = false,
  ) => {
    if (!running) return
    const revision = version,
      normalized = normalize(url.slice(0, MAX)),
      urlMatch = contains(normalized),
      head = headerText(headers)
    calls++
    pending++
    if (url.length > MAX) uninspected++
    if (apiUrls.size < 64) apiUrls.set(normalized, (apiUrls.get(normalized) ?? 0) + 1)
    else uninspected++
    const earlyMatch = urlMatch || contains(head.text)
    if (earlyMatch) matches++
    if (head.unknown || unknownBody) uninspected++
    emit()
    let read: { text: string; unknown: boolean }
    try {
      read = await bodyText(body)
    } catch {
      read = { text: '', unknown: true }
    }
    if (revision !== version || !running) return
    pending--
    if (read.unknown) uninspected++
    if (!earlyMatch && contains(read.text)) matches++
    emit()
  }
  const observeResource = (url: string, startedAt?: number) => {
    if (!running || (startedAt !== undefined && startedAt < since)) return
    resources++
    const normalized = normalize(url.slice(0, MAX)),
      remaining = apiUrls.get(normalized) ?? 0
    if (remaining) {
      if (remaining === 1) apiUrls.delete(normalized)
      else apiUrls.set(normalized, remaining - 1)
    } else if (contains(normalized)) matches++
    emit()
  }
  const start = (scope: Window & typeof globalThis = window) => {
    if (running) return () => {}
    running = true
    for (const key of Object.keys(coverage) as (keyof typeof coverage)[]) coverage[key] = false
    since = now()
    const restore: Array<() => void> = []
    if (typeof scope.fetch === 'function')
      try {
        const original = scope.fetch
        const wrapped = new Proxy(original, {
          apply(target, that, args: Parameters<typeof fetch>) {
            const [request, init] = args,
              isRequest = request instanceof scope.Request
            void observeApi(
              isRequest ? request.url : String(request),
              init?.body,
              init?.headers ?? (isRequest ? request.headers : undefined),
              isRequest && init?.body === undefined && request.body !== null,
            ).catch(() => {
              uninspected++
              emit()
            })
            return Reflect.apply(target, that, args)
          },
        })
        scope.fetch = wrapped
        coverage.fetch = true
        restore.push(() => {
          if (scope.fetch === wrapped) scope.fetch = original
        })
      } catch {
        /* Report unavailable interception rather than inventing coverage. */
      }
    if (typeof scope.XMLHttpRequest === 'function')
      try {
        const prototype = scope.XMLHttpRequest.prototype,
          open = prototype.open,
          send = prototype.send,
          setHeader = prototype.setRequestHeader
        const metadata = new WeakMap<
          XMLHttpRequest,
          { url: string; headers: [string, string][]; unknown: boolean }
        >()
        const wrappedOpen = function (
          this: XMLHttpRequest,
          method: string,
          url: string | URL,
          ...args: unknown[]
        ) {
          const result = Reflect.apply(open, this, [method, url, ...args])
          metadata.set(this, { url: String(url), headers: [], unknown: false })
          return result
        } as typeof open
        const wrappedHeader = function (this: XMLHttpRequest, name: string, value: string) {
          const result = Reflect.apply(setHeader, this, [name, value])
          const meta = metadata.get(this)
          if (meta) {
            if (meta.headers.length < 64 && name.length + value.length <= MAX)
              meta.headers.push([name, value])
            else meta.unknown = true
          }
          return result
        }
        const wrappedSend = function (
          this: XMLHttpRequest,
          body?: Document | XMLHttpRequestBodyInit | null,
        ) {
          const meta = metadata.get(this)
          void observeApi(meta?.url ?? '', body, meta?.headers, meta?.unknown ?? false).catch(
            () => {
              uninspected++
              emit()
            },
          )
          return Reflect.apply(send, this, [body])
        }
        prototype.open = wrappedOpen
        restore.push(() => {
          if (prototype.open === wrappedOpen) prototype.open = open
        })
        prototype.setRequestHeader = wrappedHeader
        restore.push(() => {
          if (prototype.setRequestHeader === wrappedHeader) prototype.setRequestHeader = setHeader
        })
        prototype.send = wrappedSend
        restore.push(() => {
          if (prototype.send === wrappedSend) prototype.send = send
        })
        coverage.xhr = true
      } catch {
        /* Scope is visible in the snapshot. */
      }
    if (typeof scope.navigator.sendBeacon === 'function')
      try {
        const original = scope.navigator.sendBeacon
        const wrapped = new Proxy(original, {
          apply(target, that, args: Parameters<Navigator['sendBeacon']>) {
            void observeApi(String(args[0]), args[1]).catch(() => {
              uninspected++
              emit()
            })
            return Reflect.apply(target, that, args)
          },
        })
        scope.navigator.sendBeacon = wrapped
        coverage.beacon = true
        restore.push(() => {
          if (scope.navigator.sendBeacon === wrapped) scope.navigator.sendBeacon = original
        })
      } catch {
        /* Some browsers make this API non-writable. */
      }
    if (typeof scope.PerformanceObserver === 'function')
      try {
        const from = now(),
          observer = new scope.PerformanceObserver((list) => {
            for (const entry of list.getEntries())
              if (entry.startTime >= from) observeResource(entry.name, entry.startTime)
          })
        observer.observe({ type: 'resource', buffered: true })
        coverage.resources = true
        restore.push(() => observer.disconnect())
      } catch {
        /* API interception still reports its own limited scope. */
      }
    emit()
    return () => {
      for (const undo of restore.reverse()) undo()
      running = false
      version++
      pending = 0
      inputKind = 'none'
      signatures.clear()
      apiUrls.clear()
      listeners.clear()
    }
  }
  return {
    start,
    setInput,
    addResult,
    observeApi,
    observeResource,
    snapshot,
    revision: () => version,
    subscribe: (listener: () => void) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
export type ProofObservation = ReturnType<typeof createProofObservation>
