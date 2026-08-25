# AIINT-DECODING-01 worker failure closure

- Runtime source: `602cc73e75bf1626b5ccadfb700b91319c87d1e3`
- Cloudflare deployment: `2934af2c-9d13-4d3f-b16f-2b92dfb1d4b2`
- Cloudflare version: `fd54657c-5451-4c56-b58a-da900c62a545` at 100%
- Artifact digest: `b18bb11a7e12f5d16c2acc4c2dbc616d4bce5a4746e6ae06f5eddfb12b1a94fd`
  (sorted SHA-256 digest of every file in `apps/web/dist`)
- Rollback target: deployment `4f7a89e6-f827-4431-8fa2-483b8ad6aacf`, version
  `0d7b792a-fece-4889-99b9-c24875ba64c7`. The intermediate deployment
  `1f65c751-41c2-49af-83d4-d097ca6c2efd` is deliberately excluded because its
  artifact resolved the workbench package through a stale temporary symlink.

## Verification

- Focused Vitest: worker `error`, `messageerror`, and 15-second timeout each reject
  the pending request, terminate the failed worker, and allow a fresh worker on retry; 3/3 passed.
- `pnpm --filter @decoding/web typecheck` and
  `pnpm --filter @decoding/workbench-ui typecheck` passed.
- `pnpm --filter @decoding/web build` produced 486 pages from a clean offline
  workspace install; the deployed decoder chunk is `/_astro/WebDecoder.B9zrb1kH.js`.
- Managed production browser at 390x844 forced a real worker-script request failure.
  The route showed the Korean recoverable message, visible retry, and collapsed
  diagnostic; retry created a second worker and rendered a Base64 result.
- Managed production browser fixtures also delivered `messageerror` and no response
  until the client timeout. Both closed as the same recoverable state and rendered a
  Base64 result after retry.
- `https://decod.ing/ko/` and `https://decod.ing/healthz` returned 200 after provider
  read-back. `/healthz` still reports revision `unknown`, so the immutable provider
  version and linked asset are the source coordinates; this receipt does not relabel
  that health field.

This establishes deployed Web interaction recovery. It does not establish desktop
release, field retention, monitored user value, or profitability.
