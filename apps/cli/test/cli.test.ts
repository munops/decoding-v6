import { spawn } from 'node:child_process'
import { decode } from '@decoding/engine'
import { describe, expect, it } from 'vitest'

function runCli(
  args: string[],
  input = '',
): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve) => {
    const child = spawn('pnpm', ['--filter', 'decoding', 'exec', 'tsx', 'src/index.ts', ...args], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    let stdout = ''
    let stderr = ''
    child.stdout.on('data', (chunk) => {
      stdout += String(chunk)
    })
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk)
    })
    child.on('close', (code) => resolve({ stdout, stderr, code }))
    child.stdin.end(input)
  })
}

describe('CLI process contract', () => {
  it('returns the same engine result as direct use for stdin JSON output', async () => {
    const input = 'eyJsb2NhbCI6dHJ1ZSwidG9vbHMiOjQ3fQ=='
    const direct = await decode(input)
    const cli = await runCli(['--json'], input)
    expect(cli.code).toBe(0)
    const jsonStart = cli.stdout.indexOf('{')
    const result = JSON.parse(cli.stdout.slice(jsonStart)) as typeof direct
    expect(result.root.selected?.detector).toBe(direct.root.selected?.detector)
    expect(result.root.children[0]?.selected?.detector).toBe(
      direct.root.children[0]?.selected?.detector,
    )
  }, 30_000)

  it('accepts an explicit positional value with the shared plain answer', async () => {
    const cli = await runCli(['--locale', 'ko', '7JWI64WV7ZWY7IS47JqUIOyEuOqzhA=='])
    expect(cli.code).toBe(0)
    expect(cli.stdout).toContain('안녕하세요 세계')
    expect(cli.stdout).toContain('Base64')
  }, 30_000)
})
