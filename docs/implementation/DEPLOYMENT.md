# Cloudflare deployment evidence

Updated: 2026-08-03 00:31 (Asia/Seoul)

## 2026-08-08 read-only drift and blocker

- Cloudflare read-back reports current production deployment version `19bcc66a-5357-40b8-b240-8ed5766b1059` at 100%. This is newer than the version previously recorded below; provider state wins and source/release attribution must be re-frozen at the next wave.
- fresh `https://decod.ing/` HTML matched the pre-audit local `apps/web/dist/index.html`; its linked CSS/JS assets returned 200 with correct MIME.
- a returning Chrome profile reproduced `decoding-v6-shell-v2` cache-first HTML with removed CSS `/_astro/_detector_.BN8Cdp6a.css`; that request returned 404 HTML, leaving the page unstyled and decoder island absent.
- DC-AUD-02 is a local implementation only. No staging/production deployment or rollback occurred during this audit.

## Active endpoints

| Surface          | URL                                                  | Worker                | Version                                | Result |
| ---------------- | ---------------------------------------------------- | --------------------- | -------------------------------------- | ------ |
| Production       | <https://decod.ing>                                  | `decoding-v6`         | `ec414b51-040c-4331-ba29-6243cd2b722f` | active |
| Production alias | <https://www.decod.ing>                              | `decoding-v6`         | same deployment                        | active |
| Workers fallback | <https://decoding-v6.wjstks3474.workers.dev>         | `decoding-v6`         | same deployment                        | active |
| Staging          | <https://decoding-v6-staging.wjstks3474.workers.dev> | `decoding-v6-staging` | `e551ad7d-51c9-4e8e-aa2f-d74064b9f582` | active |

The 2026-08-03 release deployed source revision `97862d85d825b27a0e869575e9f4497bbd028b20` (DC-GR-01 local-safe sharing) after [GitHub Actions run 30754058374](https://github.com/whoo3474/decoding-v6/actions/runs/30754058374) passed `pnpm verify` and `pnpm test:e2e`. Staging activated `e551ad7d-51c9-4e8e-aa2f-d74064b9f582`; production activated `ec414b51-040c-4331-ba29-6243cd2b722f` at 100% traffic. The existing proxied DNS records and `decod.ing/*` plus `www.decod.ing/*` production routes were preserved. The separate `api.decod.ing/*` and `staging.decod.ing/*` routes were not changed.

The first staging upload activated version `42f40ffb-2e35-4052-8917-df3a74ec51c9`, but Wrangler returned a nonzero exit after attempting an inherited production route trigger. Provider read-back confirmed that production remained on `7aecab80-9498-4379-9cd1-73468844488a`. The staging environment now declares `routes = []`; the subsequent deployment activated `89002ee4-6b4f-48c2-97d6-f984d8601df8` with a zero exit and passed the same external smoke.

## External verification

`pnpm verify:deploy -- <url>` launches a clean headless Chromium session against the deployed origin. It passed on staging and all three production entrypoints (`decod.ing`, `www.decod.ing`, and the Workers fallback) with:

- exactly three safe synthetic triage cases and a working Base64 → JSON example
- nested Base64 → JSON automatic detection
- exactly 47 searchable tools
- JSON formatter execution in the local worker
- zero request or browser-storage occurrence of a synthetic secret canary
- zero request origin outside the tested site

For the 2026-08-03 release, staging passed `pnpm verify:deploy`. A separate remote browser check then passed on staging and each production entrypoint: an encoded synthetic canary was detected as Base64 → JSON, all 47 tools and the local JSON operation worked, safe-summary clipboard text contained neither the raw input nor decoded canary, and the canary appeared in neither browser storage nor a request. The explicit SVG share-card download was also verified on staging as `decoding-safe-share-card.svg`.

HTTP checks also confirmed 200 responses for the home, catalog, workspace, operation, and detector routes; a product 404 for a missing route; immutable fingerprinted assets; and CSP, Permissions Policy, Referrer Policy, frame denial, and MIME sniffing protection.

## Rollback drill

The immediate production rollback target is version `9e8118e6-10c5-4da2-9b6f-f9f30025fa63`. The immediate staging rollback target is `d69c1127-91bc-4eee-8fa4-010f260b4473`. Both remain available through `wrangler rollback <version-id>`; no rollback was needed for this release.

The staging Worker was rolled back from `ae7932de-ff68-4d00-974d-ca87adde05ff` to previous version `66bf1109-cee4-4ee2-8fa0-491fde74c0ce`. The external Chromium deployment verification passed on the rolled-back version. Staging was then restored to `ae7932de-ff68-4d00-974d-ca87adde05ff` at 100% traffic and the same verification passed again.

No database, KV, Worker main handler, authentication, payment, analytics, or server-side decode binding exists in either deployment.
