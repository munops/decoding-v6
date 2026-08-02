# Cloudflare deployment evidence

Updated: 2026-08-02 15:39 (Asia/Seoul)

## Active endpoints

| Surface          | URL                                                  | Worker                | Version                                | Result |
| ---------------- | ---------------------------------------------------- | --------------------- | -------------------------------------- | ------ |
| Production       | <https://decod.ing>                                  | `decoding-v6`         | `9e8118e6-10c5-4da2-9b6f-f9f30025fa63` | active |
| Production alias | <https://www.decod.ing>                              | `decoding-v6`         | same deployment                        | active |
| Workers fallback | <https://decoding-v6.wjstks3474.workers.dev>         | `decoding-v6`         | same deployment                        | active |
| Staging          | <https://decoding-v6-staging.wjstks3474.workers.dev> | `decoding-v6-staging` | `d69c1127-91bc-4eee-8fa4-010f260b4473` | active |

The 2026-08-02 release deployed source revision `2fe88c752b5ca8b83fde12432df34330b1688e70` (including the Reveal Ledger design revision) after [GitHub Actions run 30736136902](https://github.com/whoo3474/decoding-v6/actions/runs/30736136902) passed `pnpm verify` and `pnpm test:e2e`. The existing proxied DNS records and `decod.ing/*` plus `www.decod.ing/*` production routes were preserved. The separate `api.decod.ing/*` and `staging.decod.ing/*` routes were not changed.

The first staging upload activated version `42f40ffb-2e35-4052-8917-df3a74ec51c9`, but Wrangler returned a nonzero exit after attempting an inherited production route trigger. Provider read-back confirmed that production remained on `7aecab80-9498-4379-9cd1-73468844488a`. The staging environment now declares `routes = []`; the subsequent deployment activated `89002ee4-6b4f-48c2-97d6-f984d8601df8` with a zero exit and passed the same external smoke.

## External verification

`pnpm verify:deploy -- <url>` launches a clean headless Chromium session against the deployed origin. It passed on staging and all three production entrypoints (`decod.ing`, `www.decod.ing`, and the Workers fallback) with:

- exactly three safe synthetic triage cases and a working Base64 → JSON example
- nested Base64 → JSON automatic detection
- exactly 47 searchable tools
- JSON formatter execution in the local worker
- zero request or browser-storage occurrence of a synthetic secret canary
- zero request origin outside the tested site

HTTP checks also confirmed 200 responses for the home, catalog, workspace, operation, and detector routes; a product 404 for a missing route; immutable fingerprinted assets; and CSP, Permissions Policy, Referrer Policy, frame denial, and MIME sniffing protection.

## Rollback drill

The current production rollback target is version `46340612-e1f2-49f3-a075-6d94305bfa69`. The current staging rollback target is `fe1ab27f-3d9f-4e55-af36-85f1c9c9272f`. Both remain available through `wrangler rollback <version-id>`; no rollback was needed for this release.

The staging Worker was rolled back from `ae7932de-ff68-4d00-974d-ca87adde05ff` to previous version `66bf1109-cee4-4ee2-8fa0-491fde74c0ce`. The external Chromium deployment verification passed on the rolled-back version. Staging was then restored to `ae7932de-ff68-4d00-974d-ca87adde05ff` at 100% traffic and the same verification passed again.

No database, KV, Worker main handler, authentication, payment, analytics, or server-side decode binding exists in either deployment.
