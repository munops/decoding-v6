# Cloudflare deployment evidence

Updated: 2026-09-01 04:20 (Asia/Seoul)

## 2026-09-01 Korean discovery and AdSense ownership release

- Runtime source `3c3efe68a662925ec0c65a4fdf7ba195e9783f75` is active on Cloudflare version `f8f2b4a8-bb52-4e9e-8613-ffd86e8e5094` at 100% traffic.
- Korean locale suggestion layout, Korean indexability, sitemap membership, HSTS, and AdSense `ads.txt` ownership record are live. The static artifact digest is `09b4726884b768839f0d7d8a00be0d5824c8b39f880c8349fb20934a31049d57`.
- Production read-back passed canonical Korean routes, 60 Korean sitemap URLs, retained `noindex` on Japanese beta routes, exact `/healthz` revision, and 320px/200% plus 390px no-overlap/no-overflow browser checks.
- Immediate rollback target is version `56d01667-30fa-4a78-837d-2b0b9ea9365d`. This wave changed no database, KV, auth, payment, or event schema.
- AdSense site ownership is verified, but final policy review has not been submitted and no ad-serving script is active. Search Console domain verification remains at the DNS authorization boundary. See [DC-GR-02 evidence](../evidence/dc-gr-02-korean-discovery-release-2026-09-01.md).

## 2026-08-24 Korean product-language web release

- Runtime source `06564f552efbb63f46d4c1926dc6b360b2c057e2` was built from a clean detached worktree and activated only on the existing public-web Worker.
- Current production deployment is `4f7a89e6-f827-4431-8fa2-483b8ad6aacf`; version `0d7b792a-fece-4889-99b9-c24875ba64c7` receives 100% traffic.
- Provider version read-back and both canonical and Workers-fallback `/healthz` return the exact runtime source. Canonical, www, Workers fallback, and a linked immutable asset return 200.
- Managed browser run `b2193a67-3900-4321-8b20-a3d2ff411b6e` passed `/ko/`, `/ko/tools/`, `/ko/json-format/`, and `/ko/methodology/` at 320, 390, and 1440 pixels with no document overflow, clipped/out-of-bounds text, mid-word split, or one-character orphan line. All three widths also completed a real local JSON operation.
- The first activation was automatically rolled back when the legacy `networkidle` deploy verifier timed out. The same timeout reproduced on the previous production version, while the DOM/function-specific smoke detected the previous version's actual Korean typography defects and passed the new version. Full chronology is in [the release evidence](../evidence/web-product-language-release-2026-08-24.md).

## 2026-08-08 read-only drift and blocker

- Cloudflare read-back reports current production deployment version `19bcc66a-5357-40b8-b240-8ed5766b1059` at 100%. This is newer than the version previously recorded below; provider state wins and source/release attribution must be re-frozen at the next wave.
- fresh `https://decod.ing/` HTML matched the pre-audit local `apps/web/dist/index.html`; its linked CSS/JS assets returned 200 with correct MIME.
- a returning Chrome profile reproduced `decoding-v6-shell-v2` cache-first HTML with removed CSS `/_astro/_detector_.BN8Cdp6a.css`; that request returned 404 HTML, leaving the page unstyled and decoder island absent.
- DC-AUD-02 is a local implementation only. No staging/production deployment or rollback occurred during this audit.

## Active endpoints

| Surface          | URL                                                  | Worker                | Version                                | Result |
| ---------------- | ---------------------------------------------------- | --------------------- | -------------------------------------- | ------ |
| Production       | <https://decod.ing>                                  | `decoding-v6`         | `0d7b792a-fece-4889-99b9-c24875ba64c7` | active |
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

The immediate production rollback target is deployment `d30e7aea-ebd4-4031-82f2-b5be1a47ff6c`, version `7fa42c37-88f0-4f07-b039-a1b4341faca3`. The immediate staging rollback target is `d69c1127-91bc-4eee-8fa4-010f260b4473`. Both versions remain available through `wrangler rollback <version-id>`.

The staging Worker was rolled back from `ae7932de-ff68-4d00-974d-ca87adde05ff` to previous version `66bf1109-cee4-4ee2-8fa0-491fde74c0ce`. The external Chromium deployment verification passed on the rolled-back version. Staging was then restored to `ae7932de-ff68-4d00-974d-ca87adde05ff` at 100% traffic and the same verification passed again.

No database, KV, authentication, payment, or server-side decode binding exists in either deployment. Production keeps the existing aggregate-only Analytics Engine binding described in `wrangler.toml`; this release did not change its schema or data.
