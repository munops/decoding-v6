# DC-LANDING-05 web release — 2026-08-23

## Frozen source and scope

- Runtime source: `3fc2d9253c87a4061b539f7a80ecc11e81d179f5`
- Scope: web HomePage, catalog/global copy and styles, landing PRD/evidence, and the three landing/product/responsive E2E specifications.
- Preserved foreign owner: `apps/extension/src/style.css` stayed outside both commits and deployment scope.
- Artifact digest: `1eb555addeac75ab723935cbab13ab5b888c8a990cdf639f9036a391963e0ea8` for the sorted `apps/web/dist` file digests.

## Validation

- `pnpm --filter @decoding/web... build`: PASS; Astro diagnostics 0 errors, 0 warnings, 0 hints; 486 pages built.
- Managed browser focused run `dfdafee6-5419-4b7b-9eb1-e44582fbe807`: 23 passed, 1 intentional mobile-project skip across `product`, `pwa`, and `responsive`.
- Managed production run `8a6197e0-6237-4ee4-8976-cb19237cce09`: 390 and 1440 widths both expose the real textarea in the first viewport, complete an actual Base64-to-JSON decode, show zero horizontal overflow, and continue to `/workspace/`.
- Production headers: CSP with `frame-ancestors 'none'`, Permissions-Policy disabling sensitive device APIs, `Referrer-Policy: strict-origin`, `X-Content-Type-Options: nosniff`, and `X-Frame-Options: DENY`.

## Provider read-back and smoke

- Existing Cloudflare Worker: `decoding-v6`; no new resource, DNS, secret, store, data, extension, or desktop mutation.
- Operations stayed on the existing Analytics Engine binding and existing free-plan resource; this wave added no billable resource or cost setting. Provider upload read-back showed only `EVENTS`, static `ASSETS`, and the release `BUILD_SHA` binding.
- The operational kill switch is the version rollback below. No separate alert or budget rule was created or changed; provider deployment/version and the six-route smoke are the current availability read-back for this release.
- Deployment: `11b32e4e-6bdc-4283-b123-75677b5e6bd1`; version: `7fa42c37-88f0-4f07-b039-a1b4341faca3` at 100%.
- Immediate prior rollback anchor: deployment `977056ba-47ec-4f5e-9958-f67affc23659`, version `30ec9154-5192-4f07-97a1-ddce09b476b9`. Older drill anchor remains `e3177ea4-21a4-48c1-a3b0-2438893df38c` / `e549685b-a563-4e34-a78c-7a5e3022400b`.
- `https://decod.ing` and `https://decoding-v6.wjstks3474.workers.dev`: `/`, `/workspace/`, and `/healthz` all returned 200.
- `/healthz` read-back: `revision=3fc2d9253c87a4061b539f7a80ecc11e81d179f5`.

This proves the web release and same-source provider read-back. It does not claim extension/desktop release, field retention, user value, or revenue.
