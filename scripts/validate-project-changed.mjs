#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'

const root = process.cwd()
const rawFiles = process.argv.slice(2).filter((value) => value !== '--')
const codeFile = /\.(?:[cm]?[jt]sx?|astro)$/u
const unitSource = /\.[cm]?[jt]sx?$/u
const workspaceQualityInputs = new Set([
  'package.json',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'tsconfig.base.json',
  'vitest.config.ts',
])
const typecheckScopes = [
  ['apps/cli/', ['@decoding/cli']],
  ['apps/desktop/', ['@decoding/desktop']],
  ['apps/extension/', ['@decoding/extension']],
  ['apps/web/', ['@decoding/web']],
  [
    'packages/engine/',
    [
      '@decoding/engine',
      '@decoding/workbench-ui',
      '@decoding/web',
      '@decoding/desktop',
      '@decoding/cli',
      '@decoding/extension',
    ],
  ],
  ['packages/fixtures-public/', ['@decoding/fixtures-public']],
  ['packages/operations/', ['@decoding/operations', '@decoding/workbench-ui', '@decoding/web']],
  ['packages/spec-registry/', ['@decoding/spec-registry', '@decoding/engine']],
  ['packages/test-kit/', ['@decoding/test-kit']],
  ['packages/workbench-ui/', ['@decoding/workbench-ui', '@decoding/web', '@decoding/desktop']],
]

function fail(message) {
  process.stderr.write(`VALIDATE_CHANGED_SCOPE_ERROR: ${message}\n`)
  process.exitCode = 2
}

function exactFile(value) {
  if (!value || value.startsWith('-') || value.includes('\0')) return null
  const absolute = resolve(root, value)
  const local = relative(root, absolute)
  if (!local || local === '..' || local.startsWith(`..${sep}`) || !existsSync(absolute)) return null
  return local.split(sep).join('/')
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', shell: false })
  if (result.error) {
    fail(`${command}을 실행할 수 없습니다: ${result.error.message}`)
    return false
  }
  if (result.status !== 0 || result.signal !== null) {
    process.exitCode = result.status ?? 1
    return false
  }
  return true
}

const files = rawFiles.map(exactFile)
if (files.length === 0 || files.some((file) => file === null)) {
  fail('repo-relative existing task file만 전달할 수 있습니다.')
} else {
  const exactFiles = /** @type {string[]} */ (files)
  const lintFiles = exactFiles.filter((file) => codeFile.test(file))
  const typed = new Set()
  const related = []
  const nodeSyntax = []
  const needsWorkspaceQuality = exactFiles.some(
    (file) => workspaceQualityInputs.has(file) || file.startsWith('tsconfig.'),
  )

  for (const file of exactFiles) {
    if (unitSource.test(file) && !file.startsWith('tests/e2e/') && !file.startsWith('scripts/')) {
      related.push(file)
    }
    if (/\.[cm]?js$/u.test(file)) nodeSyntax.push(file)
    for (const [prefix, scopes] of typecheckScopes) {
      if (file.startsWith(prefix) && unitSource.test(file)) {
        for (const scope of scopes) typed.add(scope)
      }
    }
  }

  const lintOk = lintFiles.length === 0 || run('pnpm', ['exec', 'eslint', ...lintFiles])
  const typecheckOk = needsWorkspaceQuality
    ? run('pnpm', ['typecheck'])
    : [...typed].sort().every((scope) => run('pnpm', ['--filter', scope, 'typecheck']))
  const relatedOk = needsWorkspaceQuality
    ? run('pnpm', ['test'])
    : related.length === 0 ||
      run('pnpm', ['exec', 'vitest', 'related', '--run', '--passWithNoTests', ...related])
  const syntaxOk = nodeSyntax.every((file) => run(process.execPath, ['--check', file]))
  const i18nOk = exactFiles.some((file) =>
    [
      'packages/workbench-ui/src/messages.ts',
      'packages/workbench-ui/src/PortfolioThemeControl.tsx',
      'scripts/check-i18n.ts',
    ].includes(file),
  )
    ? run('pnpm', ['check:i18n'])
    : true

  if (!lintOk || !typecheckOk || !relatedOk || !syntaxOk || !i18nOk) process.exitCode ??= 1
}
