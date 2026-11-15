import { toLegacyResult, toLegacyNode } from '@decoding/presentation/legacy'
import { answerSentence, primaryLayers, warningTitle } from '@decoding/presentation'
import {
  finalSelection,
  displayValue,
  outputText,
} from '../../../packages/workbench-ui/src/result-text'
import { readFile } from 'node:fs/promises'
import { stdin, stdout, stderr } from 'node:process'
import { decode, type ChainNode, type DecodeInput } from '@decoding/engine'
import { executeOperation, operationById, operations } from '@decoding/operations'

type CliOptions = {
  payload?: string
  locale: 'en' | 'ko'
  file?: string
  format: string
  json: boolean
  ndjson: boolean
  listTools: boolean
  help: boolean
  maxDepth?: number
  noLint: boolean
  operationOptions: Record<string, string | number | boolean>
}

const usage = `decoding — local text decoder

Usage:
  decoding 'SGVsbG8='
  cat payload.txt | decoding
  pbpaste | decoding --json
  decoding --file sample.bin
  cat input.txt | decoding --format json-format --option mode=minify

Options:
  --file <path>       Read a local file
  --format <id>       auto or an operation ID
  --option k=v        Operation option; repeatable
  --locale <en|ko>    Human output language
  --json              Print one JSON document
  --ndjson            Print each chain node as NDJSON
  --max-depth <n>     Override recursive chain depth, 1-8
  --no-lint           Hide lint warnings in human output
  --list-tools        Print all operation IDs
  --help              Show this help

Use stdin or --file for secrets: positional values may remain in shell history.
No update check, telemetry, account, or network code is included.`

function parseValue(value: string): string | number | boolean {
  if (value === 'true') return true
  if (value === 'false') return false
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value)
  return value
}

function parseArgs(args: string[]): CliOptions {
  const output: CliOptions = {
    locale: /^(?:ko)/i.test(process.env.LC_ALL ?? process.env.LANG ?? '') ? 'ko' : 'en',
    format: 'auto',
    json: false,
    ndjson: false,
    listTools: false,
    help: false,
    noLint: false,
    operationOptions: {},
  }
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index] ?? ''
    const next = args[index + 1]
    if (arg === '--locale' && next) {
      if (next !== 'ko' && next !== 'en') throw new Error('--locale expects en or ko.')
      output.locale = next
      index += 1
    } else if (arg === '--' && next && index + 2 === args.length) {
      output.payload = next
      index += 1
    } else if (arg === '--file' && next) {
      output.file = next
      index += 1
    } else if (arg === '--format' && next) {
      output.format = next
      index += 1
    } else if (arg === '--option' && next) {
      const separator = next.indexOf('=')
      if (separator < 1) throw new Error('--option expects key=value.')
      output.operationOptions[next.slice(0, separator)] = parseValue(next.slice(separator + 1))
      index += 1
    } else if (arg === '--max-depth' && next) {
      const value = Number(next)
      if (!Number.isInteger(value) || value < 1 || value > 8)
        throw new Error('--max-depth must be 1-8.')
      output.maxDepth = value
      index += 1
    } else if (arg === '--json') output.json = true
    else if (arg === '--ndjson') output.ndjson = true
    else if (arg === '--list-tools') output.listTools = true
    else if (arg === '--no-lint') output.noLint = true
    else if (arg === '--help' || arg === '-h') output.help = true
    else if (arg.startsWith('-')) throw new Error(`Unknown option: ${arg}`)
    else if (output.payload === undefined) output.payload = arg
    else throw new Error('Only one positional value is accepted. Use stdin for multiline input.')
  }
  if (output.file && output.payload !== undefined)
    throw new Error('Choose a positional value or --file, not both.')
  if (output.json && output.ndjson) throw new Error('Choose --json or --ndjson, not both.')
  return output
}

async function readStdin(): Promise<Uint8Array> {
  const chunks: Uint8Array[] = []
  for await (const chunk of stdin)
    chunks.push(typeof chunk === 'string' ? new TextEncoder().encode(chunk) : chunk)
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const output = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    output.set(chunk, offset)
    offset += chunk.length
  }
  return output
}

function safeValue(value: unknown): unknown {
  if (value instanceof Uint8Array)
    return {
      type: 'bytes',
      hex: [...value].map((byte) => byte.toString(16).padStart(2, '0')).join(''),
    }
  return value
}

function flatten(node: ChainNode): ChainNode[] {
  return [node, ...node.children.flatMap(flatten)]
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    stdout.write(`${usage}\n`)
    return
  }
  if (options.listTools) {
    stdout.write(
      `${operations.map((operation) => `${operation.id}\t${operation.name}`).join('\n')}\n`,
    )
    return
  }
  const bytes =
    options.payload !== undefined
      ? new TextEncoder().encode(options.payload)
      : options.file
        ? new Uint8Array(await readFile(options.file))
        : await readStdin()
  if (!bytes.length) throw new Error('No input received. Pipe data to stdin or use --file.')
  const asText = new TextDecoder('utf-8', { fatal: false }).decode(bytes)
  const input: DecodeInput = asText.includes('\ufffd') ? bytes : asText.replace(/\n$/, '')

  if (options.format !== 'auto') {
    if (!operationById.has(options.format))
      throw new Error(`Unknown operation: ${options.format}. Use --list-tools.`)
    const result = await executeOperation(options.format, input, options.operationOptions)
    if (options.json || options.ndjson)
      stdout.write(
        `${JSON.stringify({ operation: options.format, ...result, output: safeValue(result.output) })}\n`,
      )
    else
      stdout.write(
        `${typeof result.output === 'string' ? result.output : JSON.stringify(safeValue(result.output), null, 2)}\n`,
      )
    return
  }

  const result = await decode(input, {
    previewAmbiguous: !options.json && !options.ndjson,
    ...(options.maxDepth === undefined ? {} : { limits: { maxDepth: options.maxDepth } }),
  })
  if (options.json)
    stdout.write(
      `${JSON.stringify(toLegacyResult(result), (_key, value) => safeValue(value), 2)}\n`,
    )
  else if (options.ndjson)
    for (const node of flatten(result.root))
      stdout.write(`${JSON.stringify(toLegacyNode(node), (_key, value) => safeValue(value))}\n`)
  else {
    const final = finalSelection(result.root)
    const warnings = options.noLint
      ? []
      : primaryLayers(result.root).flatMap((node) => node.selected?.warnings ?? [])
    stdout.write(
      `${answerSentence(result.root, options.locale, asText)}\n${warnings.map((item) => warningTitle(item, options.locale)).join('\n')}${warnings.length ? '\n' : ''}${final ? outputText(displayValue(final)) : asText}\n`,
    )
  }

  if (result.root.status === 'unsupported') process.exitCode = 3
  else if (result.root.status === 'ambiguous') process.exitCode = 2
  else if (result.root.status === 'limit') process.exitCode = 4
}

main().catch((error: unknown) => {
  stderr.write(`decoding: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
