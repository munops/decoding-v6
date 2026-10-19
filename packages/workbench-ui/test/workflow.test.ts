import { gzipSync } from 'node:zlib'
import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { decode, encodeBase64 } from '@decoding/engine'
import { canReencode, maskSensitiveFields, reencode } from '../src/re-encode'
import { reproduceCommands } from '../src/reproduce-commands'
describe('completed local workflows', () => {
  it('edits JSON and re-wraps Base64 without losing the changed value', async () => {
    const original = encodeBase64(new TextEncoder().encode('{"local":true,"count":1}'))
    const result = await decode(original)
    expect(canReencode(result.root).allowed).toBe(true)
    const changed = reencode(result.root, '{"local":false,"count":2}')
    expect((await decode(changed.text)).root.children[0]?.selected?.value).toEqual({
      local: false,
      count: 2,
    })
  })
  it('keeps non-sensitive scalars in masked copy and removes credential fields', () => {
    expect(
      maskSensitiveFields({
        name: 'fixture',
        count: 12,
        token: 'secret',
        nested: { password: 'secret', ok: true },
      }),
    ).toEqual({
      name: 'fixture',
      count: 12,
      token: '[redacted]',
      nested: { password: '[redacted]', ok: true },
    })
  })
  it('copies a data-free reproduction command that executes on synthetic data', async () => {
    const value = encodeBase64(new TextEncoder().encode('{"fixture":"workflow_canary"}'))
    const result = await decode(value)
    const commands = reproduceCommands(result.root)
    expect(JSON.stringify(commands)).not.toContain('workflow_canary')
    expect(JSON.stringify(commands)).not.toContain(value)
    const output = execFileSync('bash', ['-c', commands.shell], {
      encoding: 'utf8',
      env: { ...process.env, VALUE: value },
    })
    expect(JSON.parse(output)).toEqual({ fixture: 'workflow_canary' })
  })
  it('rebuilds JWT only as unsigned and never reuses its old signature', async () => {
    const enc = (text: string) => encodeBase64(new TextEncoder().encode(text), true)
    const root = (await decode(`${enc('{"alg":"HS256"}')}.${enc('{"sub":"before"}')}.c2ln`)).root
    const next = reencode(root, '{"header":{"alg":"HS256"},"payload":{"sub":"after"}}')
    expect(next.unsignedJwt).toBe(true)
    const selected = (await decode(next.text)).root.selected
    expect(selected?.value).toMatchObject({
      header: { alg: 'none' },
      payload: { sub: 'after' },
      signature: '',
    })
    expect(selected?.warnings[0]?.ruleId).toBe('JWT-ALG-NONE')
  })
})

it('executes copied JavaScript for the actual Base64 gzip JSON chain', async () => {
  const expected = { synthetic: 'gzip_roundtrip', count: 18 }
  const value = encodeBase64(gzipSync(JSON.stringify(expected)))
  const result = await decode(value)
  const commands = reproduceCommands(result.root)
  expect(commands.javascript).not.toContain(value)
  const output = execFileSync(
    process.execPath,
    ['--input-type=module', '-e', `const VALUE = process.env.VALUE;\n${commands.javascript}`],
    { encoding: 'utf8', env: { ...process.env, VALUE: value } },
  )
  expect(output).toContain(expected.synthetic)
  expect(output).toContain('18')
  // Capture the actual final value rather than merely matching an output comment.
  const code = commands.javascript.replace(
    'console.log(data);',
    'process.stdout.write(JSON.stringify(data));',
  )
  expect(
    JSON.parse(
      execFileSync(
        process.execPath,
        ['--input-type=module', '-e', `const VALUE = process.env.VALUE;\n${code}`],
        { encoding: 'utf8', env: { ...process.env, VALUE: value } },
      ),
    ),
  ).toEqual(expected)
})
