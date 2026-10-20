#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const sourceRoot = resolve(dirname(scriptPath), '..');

export async function runBuild(args, {
  projectRoot = sourceRoot,
  environment = process.env,
  prepareCommand,
  runCommand = execFileSync,
} = {}) {
  const option = name => {
    const index = args.indexOf(name);
    return index < 0 ? undefined : args[index + 1];
  };
  const prepare = prepareCommand ?? (await import('../../scripts/lib/validation-preparation.mjs')).runPreparedCommand;
  const prepared = await prepare({
    projectRoot,
    project: "decoding-v6",
    scriptRelative: 'scripts/build-local.mjs',
    args: ['build-local'],
    environment,
    caller: {
      claimId: option('--claim-id') ?? environment.MUNOPS_CLAIM_ID,
      holder: option('--holder') ?? environment.MUNOPS_CLAIM_HOLDER,
    },
  });
  if (!prepared.continued) {
    if (prepared.preparation) console.log(JSON.stringify({ status: 'built_local_not_deployed', project: "decoding-v6", sourceRevision: prepared.preparation.sourceRevision, worktree: prepared.preparation.worktree, installCount: prepared.preparation.installCount, installSummary: prepared.preparation.installSummary }));
    return prepared.exitCode;
  }
  // Common preparation validates the inherited child before the unchanged build chain.
  const options = { cwd: projectRoot, env: environment, stdio: 'inherit' };
  runCommand("pnpm", ["-r","--if-present","build"], options);
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  try {
    process.exitCode = await runBuild(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
