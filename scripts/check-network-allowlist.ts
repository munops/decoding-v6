import { readFileSync } from 'node:fs'
import { globSync } from 'node:fs'

const forbidden = /\b(?:XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b|\bfetch\s*\(/
const candidates = [
  ...globSync('apps/web/src/**/*.{ts,tsx,astro}'),
  ...globSync('apps/desktop/src/**/*.{ts,tsx}'),
  ...globSync('apps/extension/src/**/*.{ts,tsx}'),
]

/**
 * 예외는 하나다 — aggregate 전용 open counter.
 * 예외를 경로로만 두면 그 파일 안에서 무엇이든 보낼 수 있으므로, 같은 검사에서
 * **payload를 가리킬 수 있는 식별자가 그 파일에 없다는 것**까지 정적으로 강제한다.
 * 런타임 증명은 tests/privacy의 canary suite가 담당한다(모든 요청을 검사한다).
 */
const allowlisted = 'apps/web/src/lib/telemetry.ts'
const payloadIdentifiers = /\b(?:input|payload|result|decoded|clipboard|value|slug|file)\b/i

const violations: string[] = []
for (const file of candidates) {
  const source = readFileSync(file, 'utf8')
  if (file === allowlisted) {
    if (!source.includes('NETWORK-ALLOWLIST-EXCEPTION'))
      violations.push(`${file} (allowlisted file lost its declared exception marker)`)
    const code = source.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
    if (payloadIdentifiers.test(code))
      violations.push(`${file} (allowlisted counter must not reference user payload)`)
    continue
  }
  if (forbidden.test(source)) violations.push(file)
}
if (violations.length)
  throw new Error(`Unexpected product network primitive: ${violations.join(', ')}`)
console.log(
  `Network allowlist passed: ${candidates.length} UI/runtime source files, 1 audited aggregate counter, no other network primitive.`,
)
