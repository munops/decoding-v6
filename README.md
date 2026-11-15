# decod.ing v6

> Paste anything. See what it is — instantly, locally, safely.

decod.ing is a zero-account triage tool for unknown text and files. Paste a value without choosing a format first; it ranks plausible formats, keeps ambiguous candidates visible, follows recursive decode chains, and explains deterministic warnings on your device. A local tool workbench is available after the first diagnosis.

Production: <https://decod.ing> · Source: <https://github.com/whoo3474/decoding-v6> · Staging: <https://decoding-v6-staging.wjstks3474.workers.dev>

## Product contract

- No login, account, subscription, checkout, paid feature, server-side decoding, or generative AI
- No raw-input history; the optional IndexedDB workspace stores only explicitly saved redacted structure
- Only fixed event-name counts (opt out in the footer); no input, decoded values or identifiers. No advertising.
- Ads remain a disabled, code-free Phase 4 gate until real traffic, privacy, and performance thresholds pass
- Browser, PWA, CLI, desktop, and extension share the same local engine or operation runtimes

## Implemented surfaces

```text
apps/web             Astro SSG, Preact workers, static pages (count with `pnpm inventory` after build), PWA, local workspace
apps/cli             stdin/file auto-decoder and all 47 operation IDs
apps/desktop         Tauri 2 workbench, global shortcut, explicit clipboard, tray, windows
apps/extension       MV3 selection decoder with minimum permissions and no host access
apps/edge            reviewed empty boundary; no deployed Worker logic or bindings
packages/engine      eight-detector chain engine with limits and warnings
packages/operations  47 lazy local operation runtimes, Pack 1+2+3+4 = 16+11+10+10
packages/fixtures-public / spec-registry / test-kit / workbench-ui
```

## Run and verify

```bash
pnpm install
pnpm dev
pnpm verify
pnpm test:e2e

printf 'eyJsb2NhbCI6dHJ1ZX0=' | pnpm cli -- --json
pnpm desktop:build
pnpm --filter @decoding/extension build
pnpm verify:deploy -- https://decod.ing
```

The current implementation evidence and external launch gates are tracked in [`docs/implementation/STATUS.md`](./docs/implementation/STATUS.md). Product decisions and ordered requirements remain in [`docs/prd/`](./docs/prd/README.md).

Current format, tool and generated-page counts: `pnpm inventory` (page count requires `pnpm build`).
Counts use seven fixed names in `apps/web/src/lib/telemetry.ts#COUNT_NAMES`; they can be disabled.
No input, decoded value, content hash, filename or identity is included.
