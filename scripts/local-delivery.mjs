#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const command = process.argv[2]
const execute = process.argv.slice(3).includes('--execute')

const targets = {
  production: {
    worker: 'decoding-v6',
    origin: 'https://decod.ing',
    envArgs: [],
  },
  staging: {
    worker: 'decoding-v6-staging',
    origin: 'https://decoding-v6-staging.wjstks3474.workers.dev',
    envArgs: ['--env', 'staging'],
  },
}

function fail(message) {
  console.error(`local delivery blocked: ${message}`)
  process.exit(1)
}

function git(args) {
  return execFileSync('git', ['-C', repoRoot, ...args], { encoding: 'utf8' }).trim()
}

function run(file, args) {
  execFileSync(file, args, { cwd: repoRoot, stdio: 'inherit' })
}

function cleanRevision() {
  if (git(['status', '--porcelain=v1', '--untracked-files=all'])) {
    fail('clean source is required; commit or isolate every local change before a provider action')
  }
  return git(['rev-parse', 'HEAD'])
}

function isAncestor(ancestor, descendant) {
  try {
    execFileSync('git', ['-C', repoRoot, 'merge-base', '--is-ancestor', ancestor, descendant], {
      stdio: 'ignore',
    })
    return true
  } catch {
    return false
  }
}

function deliveryTarget() {
  const target = process.env.DECODING_DELIVERY_TARGET?.trim()
  if (!target || !Object.hasOwn(targets, target)) {
    fail('set DECODING_DELIVERY_TARGET to exactly production or staging')
  }
  return { name: target, ...targets[target] }
}

function approvedWavePath(cleanHead) {
  const requested = process.env.DECODING_RELEASE_WAVE?.trim()
  if (!requested)
    fail('set DECODING_RELEASE_WAVE to an existing approved release-wave document path')
  const path = resolve(repoRoot, requested)
  if (!path.startsWith(`${repoRoot}/`) || !existsSync(path)) {
    fail('DECODING_RELEASE_WAVE must be an existing repository-relative release-wave document')
  }
  if (!requested.startsWith('docs/operations/release-wave-')) {
    fail('DECODING_RELEASE_WAVE must identify an exact owner-lane release-wave document')
  }
  const wave = readFileSync(path, 'utf8')
  if (!/^status:\s*approved\s*$/mu.test(wave)) {
    fail('release wave must be approved')
  }
  const sourceRevision = wave.match(/^source_revision:\s*["']?([0-9a-f]{40})["']?\s*$/mu)?.[1]
  if (!sourceRevision || !isAncestor(sourceRevision, cleanHead)) {
    fail('release wave must bind an exact runtime source SHA that is an ancestor of clean HEAD')
  }
  const changedAfterRuntime = git(['diff', '--name-only', `${sourceRevision}..${cleanHead}`])
    .split('\n')
    .filter(Boolean)
  const allowedDeliveryMetadata = new Set([requested, 'docs/operations/local-delivery.json'])
  const runtimeDrift = changedAfterRuntime.filter((file) => !allowedDeliveryMetadata.has(file))
  if (runtimeDrift.length > 0) {
    fail(
      `clean HEAD differs from the approved runtime source outside delivery metadata: ${runtimeDrift.join(', ')}`,
    )
  }
  return { path: requested, sourceRevision }
}

function wrangler(args) {
  run('pnpm', ['exec', 'wrangler', ...args])
}

async function fetchHealth(origin) {
  const response = await fetch(`${origin}/healthz`, { redirect: 'error' })
  if (!response.ok) fail(`${origin}/healthz returned HTTP ${response.status}`)
  return response.json().catch(() => fail(`${origin}/healthz did not return JSON`))
}

async function verifyWeb() {
  const cleanHead = cleanRevision()
  const { sourceRevision } = approvedWavePath(cleanHead)
  const expected = process.env.DECODING_EXPECTED_BUILD_SHA?.trim()
  if (expected && expected !== sourceRevision) {
    fail('DECODING_EXPECTED_BUILD_SHA must match the approved runtime source SHA')
  }
  const target = deliveryTarget()
  const health = await fetchHealth(target.origin)
  if (
    health?.ok !== true ||
    health?.service !== 'decoding-v6' ||
    health?.revision !== sourceRevision
  ) {
    fail('health read-back does not match the exact clean source SHA')
  }
  run('node', ['scripts/verify-deploy.mjs', target.origin])
  wrangler([
    'deployments',
    'list',
    '--config',
    'wrangler.toml',
    '--name',
    target.worker,
    ...target.envArgs,
    '--json',
  ])
}

if (command === '--help' || command === 'help' || !command) {
  console.log(
    'usage: DECODING_DELIVERY_TARGET=production DECODING_RELEASE_WAVE=docs/operations/release-wave-... pnpm delivery:web:deploy -- --execute',
  )
  console.log(
    '       DECODING_DELIVERY_TARGET=production DECODING_RELEASE_WAVE=docs/operations/release-wave-... pnpm delivery:web:verify',
  )
  console.log(
    '       DECODING_DELIVERY_TARGET=production DECODING_RELEASE_WAVE=docs/operations/release-wave-... DECODING_ROLLBACK_VERSION=<provider-version> pnpm delivery:web:rollback -- --execute',
  )
  process.exit(0)
}

if (command === 'deploy-web') {
  if (!execute) fail('provider deployment requires an explicit --execute flag')
  const cleanHead = cleanRevision()
  const { sourceRevision } = approvedWavePath(cleanHead)
  const target = deliveryTarget()
  run('pnpm', ['verify'])
  run('pnpm', ['test:e2e'])
  wrangler([
    'deploy',
    '--config',
    'wrangler.toml',
    ...target.envArgs,
    '--strict',
    '--keep-vars',
    '--var',
    `BUILD_SHA:${sourceRevision}`,
    '--message',
    `owner-lane local ${target.name} release ${sourceRevision}`,
  ])
} else if (command === 'verify-web') {
  await verifyWeb()
} else if (command === 'rollback-web') {
  if (!execute) fail('provider rollback requires an explicit --execute flag')
  const cleanHead = cleanRevision()
  approvedWavePath(cleanHead)
  const target = deliveryTarget()
  const version = process.env.DECODING_ROLLBACK_VERSION?.trim()
  if (!version)
    fail('set DECODING_ROLLBACK_VERSION to a fresh provider read-back version identifier')
  wrangler([
    'rollback',
    version,
    '--config',
    'wrangler.toml',
    ...target.envArgs,
    '--name',
    target.worker,
    '--yes',
    '--message',
    `approved schema-free local ${target.name} rollback`,
  ])
} else {
  fail(`unknown command ${command}`)
}
