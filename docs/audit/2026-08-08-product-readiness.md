# decod.ing production readiness audit — 2026-08-08

상태: `audit_implement` · source baseline: `main@fde62a1` · execution lane: `owner_lane` · checkedAt: 2026-08-08 Asia/Seoul

## Verdict

**web: `not_production_ready` at the current production revision.** Fresh network clients receive the expected source, but an existing PWA cache reproduced an obsolete HTML shell whose referenced CSS is 404 and whose decoder island does not hydrate. `/terms/` and `/support/` are also absent from current production. Both blockers are implemented locally as DC-AUD-01/02; production deploy/read-back/smoke remains an exact external gate.

가장 중요한 근거:

1. Chrome returning-profile smoke rendered an unstyled page. Its controlled document referenced `/_astro/_detector_.BN8Cdp6a.css`; direct HTTP read-back returned 404 `text/html`.
2. Fresh `curl https://decod.ing/` equals local `apps/web/dist/index.html` at `fde62a1` and its current CSS/JS assets return 200. The conflict is a cache lifecycle defect, not a missing source build.
3. operations manifest promised `https://decod.ing/terms` and `/support`, but source and production had no routes before DC-AUD-01.

## Baseline and dirty protection

- protected baseline: `main@fde62a1db8b9e44c3b9d29b78dfe919ea427393e`
- pre-existing dirty: `docs/prd/README.md` 2-line uplift pointer; untracked `docs/operations/product-operations-manifest.json`, `terms-of-service.md`
- action: README의 기존 uplift hunk와 generated operations documents는 그대로 보존했다. 새 audit/traceability는 이 파일, trust data/support는 `docs/trust/`, channel truth는 `docs/platforms/`가 소유한다. No unrelated file was reverted, staged, regenerated, or formatted.
- baseline validation: `pnpm verify` stopped at `format:check` because the pre-existing untracked operations manifest was not Prettier-formatted. All earlier checks were not reached; this is recorded separately from implementation regressions.

## 12-dimension matrix

| Dimension                              | Current verdict                   | Evidence                                                                                                       | Exact remaining gap                                                                                                       |
| -------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| 1. target/market                       | `ready_evidence`                  | current 4-product comparison, 저점 7건/고점 7건, 역대조 미커버 0건, S-6 four implementation-backed differences | moat is execution quality, not uncopyability; field preference remains data pending                                       |
| 2. discovery/positioning               | `major_gap`                       | 484 static routes, canonical/sitemap/OG, OSS/community/Search Console drafts, safe share loop                  | Search Console/index/query and non-launch acquisition cohort absent; no public campaign mutation performed                |
| 3. activation/core value               | `production_blocker`              | local nested Base64→JSON, ambiguous no-auto-select, expired JWT warning flows pass in source                   | returning PWA profile can render stale shell without decoder until DC-AUD-02 is released                                  |
| 4. scope/function                      | `major_gap`                       | 8 detector families, 47 operations, web/PWA/CLI/desktop/extension engineering paths and parity tests           | independent blind fixtures remain incomplete; demand-gated surfaces must not be called released                           |
| 5. retention/lifecycle                 | `data_pending`                    | PWA offline, recent/favorite slugs, redacted workspace TTL, CLI/desktop/extension re-entry paths               | D1/D7/D30 and 4-week repeat-use evidence unavailable; no product analytics by deliberate privacy decision                 |
| 6. brand/design/copy/assets            | `production_blocker`              | Reveal Ledger tokens/mark/raster OG/icons and local responsive/a11y evidence                                   | stale production shell loses all intended styling for returning profile; fixed only after release wave                    |
| 7. mobile/a11y/performance             | `ready_evidence` with constraints | automated axe, keyboard, responsive/200%, bundle and 1MiB benchmark gates                                      | real AT, Safari/Firefox/PWA install and signed desktop device evidence data pending                                       |
| 8. data/security/privacy/legal/support | `production_blocker`              | no-network/privacy canary, CSP, threat model, `docs/trust` data inventory and trust routes                     | current production lacks terms/support; email delivery canary and Cloudflare request-log retention read-back data pending |
| 9. monetization/integrity              | `not_applicable` now              | account/payment/ad code absent; sponsor list empty and fail-closed; Phase 4 gate explicit                      | traffic gate and commercial evidence absent, so ads/revenue/profit stay data pending                                      |
| 10. architecture/engineering           | `ready_evidence` after local fix  | central engine/operation/spec/workbench owners, worker limits, CI/build/privacy/perf ladders                   | current production worker cache strategy remains defective until deployed; independent blind data gap remains             |
| 11. channels/providers/release         | `production_blocker`              | Cloudflare current deployment read-back, new channel manifest; desktop engineering build separate              | web fix deployment approval/read-back/smoke; desktop signing/notarization/demand; other app channels not selected         |
| 12. operations/field evidence          | `data_pending`                    | v3 operations manifest, recurring cadence, rollback docs, provider/live read-only checks                       | no daily traffic/activation/retention provider, support delivery evidence, or fixed live cohort                           |

## Blocker closure queue

| ID        | Readiness                     | Central owner                                       | Observable acceptance                                                                                                                              | State                                           |
| --------- | ----------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| DC-AUD-01 | `item_ready`                  | trust catalog/routes + `docs/trust`                 | privacy/terms/support reachable, one h1, footer links, safe-report copy, axe, deploy verifier                                                      | implemented locally; production `wait_external` |
| DC-AUD-02 | `item_ready`                  | `apps/web/public/sw.js`                             | online navigation beats stale cached HTML, new worker activates without page reload, offline core survives, asset failures never fall back to HTML | implemented locally; production `wait_external` |
| DC-AUD-03 | `item_ready`                  | competitor review + existing engine/workbench tests | spec completeness S-1~S-6 passes from workspace root and nested/ambiguous/warning/share fixtures remain green                                      | implemented; validation passed                  |
| DC-AUD-04 | `item_ready_with_constraints` | channel + operations manifests                      | channel validator/product-ops validator pass, provider/release/field states remain separate                                                        | implemented; field/provider gaps preserved      |

## Channel truth

| Channel        | documented             | implemented/tested/built               | deployed/released                                       | monitored/value |
| -------------- | ---------------------- | -------------------------------------- | ------------------------------------------------------- | --------------- |
| public web/PWA | yes                    | local fix tested and built             | current source released; returning-profile blocker open | data pending    |
| Apps in Toss   | assessed, not selected | not implemented                        | not registered/submitted/released                       | not applicable  |
| iOS/Android    | assessed, not selected | no standalone app                      | not submitted/released                                  | not applicable  |
| desktop        | PRD and manifest       | Tauri engineering build evidence       | not signed/notarized/publicly released                  | data pending    |
| CLI            | PRD and source         | built/parity evidence                  | package distribution not reverified                     | data pending    |
| extension      | PRD and source         | MV3 engineering build/privacy evidence | store state not verified                                | data pending    |

## Live production blocker

Read-only evidence, 2026-08-08:

- Cloudflare `decoding-v6` current deployment is version `19bcc66a-5357-40b8-b240-8ed5766b1059` at 100%.
- fresh home HTML SHA-256 equals local `apps/web/dist/index.html` before this work.
- fresh asset paths `_detector_.Z3jk5A_A.css`, `WebDecoder.DMf_9Ntt.js`, `client.yPogavxy.js` return correct 200 MIME types.
- returning Chrome profile was controlled by `decoding-v6-shell-v2`, received obsolete HTML, and requested removed CSS `/_astro/_detector_.BN8Cdp6a.css`, which returns product 404 HTML.

The release verifier previously waited for a fresh decoder but did not test linked-asset MIME or stale-worker navigation. DC-AUD-02 adds both regression boundaries.

## External release gate

Prepared row; exact source SHA and rollback version must be frozen immediately before execution.

| action ID               | lane/account/resource                                                                                                           | exact action                                                                          | cost                                      | public/data impact                                                                                                | preflight                                                                                                                                                | rollback                                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| RW-DC-20260808-TRUST-SW | owner_lane · verified shared Cloudflare legal account · Worker `decoding-v6` production routes `decod.ing/*`, `www.decod.ing/*` | deploy DC-AUD-01/02 source, then provider read-back and fresh+returning-profile smoke | no new purchase; existing plan usage only | publishes terms/support and replaces service worker cache behavior; raw/decoded payload transmission remains zero | own-scope verify ladder/E2E/privacy/a11y/perf passed; staging deploy/smoke, exact asset MIME and stale-cache test require the same exact-action approval | prior production version selected from provider immediately before deploy; `wrangler rollback <version>` then smoke |

No production deploy, DNS, domain, support routing, Search Console, external post, store/App submission, ad/payment activation, legal acceptance, purchase or credential change is authorized by this audit.
