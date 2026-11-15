import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { publicFixtures } from '@decoding/fixtures-public'
import { decode } from '@decoding/engine'
const path = 'docs/evidence/decoding-improve-20261115/a13/legacy-json-baseline.json'
if (existsSync(path))
  throw new Error('The pre-migration baseline already exists; never overwrite it.')
const cases = [...new Set(publicFixtures.map((fixture) => fixture.detector))].map((id) => {
  const fixture = publicFixtures.find(
    (fixture) => fixture.detector === id && fixture.class === 'positive',
  )!
  return { id: fixture.id, input: fixture.input }
})
for (const [id, input] of Object.entries({
  'bad-data-uri': 'data:text/plain;base64,!',
  'bad-percent-uri': 'data:text/plain,%ZZ',
  'bad-basic': 'Basic !',
  'bad-pem': '-----BEGIN PUBLIC KEY-----\n!!!\n-----END PUBLIC KEY-----',
  'unsupported-mime': '=?not-a-charset?B?SGVsbG8=?=',
  'bad-date': '2026-02-30T00:00:00Z',
  'bad-cron': '99 99 99 99 99',
}))
  cases.push({ id, input })
const bytes = (value: unknown) =>
  value instanceof Uint8Array ? { type: 'bytes', hex: Buffer.from(value).toString('hex') } : value
const records = []
for (const item of cases) {
  const result = await decode(item.input, { now: new Date('2026-11-15T00:00:00Z') })
  result.elapsedMs = 0
  records.push({
    id: item.id,
    input: bytes(item.input),
    result: JSON.parse(JSON.stringify(result, (_key, value) => bytes(value))),
  })
}
mkdirSync('docs/evidence/decoding-improve-20261115/a13', { recursive: true })
writeFileSync(
  path,
  JSON.stringify(
    {
      sourceSha: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      now: '2026-11-15T00:00:00Z',
      records,
    },
    null,
    2,
  ) + '\n',
)
console.log(`Captured ${records.length} public synthetic cases. No runtime/user input used.`)
