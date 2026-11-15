import { cpSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
const dist = resolve('apps/extension/dist')
const output = join(dist, 'packages')
const entries = readdirSync(dist).filter((name) => name !== 'packages')
const receipts = []
for (const channel of ['chrome', 'edge', 'firefox']) {
  const directory = join(output, channel)
  mkdirSync(directory, { recursive: true })
  for (const name of entries) cpSync(join(dist, name), join(directory, name), { recursive: true })
  if (channel === 'firefox') {
    const manifest = JSON.parse(readFileSync(join(directory, 'manifest.json'), 'utf8'))
    manifest.background = { scripts: ['background.js'], type: 'module' }
    manifest.browser_specific_settings = { gecko: { id: 'decoding@munops.com' } }
    writeFileSync(join(directory, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
  }
  const zip = join(output, `decoding-${channel}-6.0.0.zip`)
  execFileSync('zip', ['-q', '-r', zip, '.'], { cwd: directory })
  receipts.push({
    channel,
    path: zip,
    sha256: createHash('sha256').update(readFileSync(zip)).digest('hex'),
    status: 'built_unsigned_not_submitted',
  })
}
console.log(JSON.stringify(receipts, null, 2))
