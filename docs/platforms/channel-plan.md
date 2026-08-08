# decod.ing channel delivery plan

Last verified: 2026-08-08

## Product intent

- Product/type: decod.ing · non-game
- Primary user/outcome: developer, SRE, or security engineer identifies an opaque value and next evidence in under 10 seconds without uploading it.
- Product SSOT: `docs/prd/README.md`, `01-product-core.md`, `09-security-privacy.md`, `10-desktop.md`
- Consumer entrypoint: `apps/web/src/pages/index.astro`

## Current reality

- Astro static web + Preact islands + dedicated workers on Cloudflare Worker Static Assets.
- Domain, detector, operation, fixture and spec owners are shared packages; there is no backend API, auth, account, payment, ad, analytics, AI, or database.
- Tauri desktop, stdin CLI and MV3 context-menu extension have engineering implementations, but public native/store release evidence is absent.

## Channel decision

| Channel                | Decision           | Strategy                                 | Current state                          | Evidence boundary                                                                                           |
| ---------------------- | ------------------ | ---------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| public web/PWA         | selected           | existing Astro static web                | `released`, current production blocker | fresh clients load source `fde62a1`; returning PWA cache can serve an obsolete shell and missing asset hash |
| Apps in Toss           | not selected       | target/workflow mismatch                 | `assessed`                             | Korean mobile developer demand, clipboard/runtime fit, official console/SDK/device state not established    |
| standalone iOS/Android | not selected       | web/PWA already covers mobile inspection | `assessed`                             | native-only value and store cost/review burden have no evidence                                             |
| desktop                | later              | Tauri shared engine/workbench            | engineering `built`                    | demand gate, signed/notarized artifact, device/distribution smoke and repeat-use cohort pending             |
| CLI                    | auxiliary selected | stdin/file local process                 | `built`                                | package/public adoption evidence pending                                                                    |
| browser extension      | later auxiliary    | MV3 context menu                         | `built`                                | demand/store review/repeat-use evidence pending                                                             |

Assessment verdict: `direct_adapter` is technically possible for a future WebView, but Apps in Toss is not selected. Technical possibility is not target/channel fit.

## Shared ownership and adapters

| Concern                    | Canonical owner                                                   | Current consumers                 |
| -------------------------- | ----------------------------------------------------------------- | --------------------------------- |
| detector/chain/limits      | `packages/engine`                                                 | web, CLI, desktop, extension      |
| utility operations         | `packages/operations`                                             | web, CLI, desktop                 |
| specifications             | `packages/spec-registry`                                          | web content, engine warning links |
| workbench UI               | `packages/workbench-ui`                                           | web, desktop                      |
| privacy/data               | `docs/prd/09-security-privacy.md`, `docs/trust/data-inventory.md` | every channel adapter             |
| web lifecycle/offline      | `apps/web/public/sw.js`                                           | web/PWA only                      |
| desktop permissions/update | `apps/desktop/src-tauri` and PRD-10                               | desktop only                      |

Auth, payment, entitlement, ads and server analytics are intentionally absent, not empty adapters waiting to activate.

## Validation matrix

| Check                     | Web                                             | Apps in Toss   | Desktop                                          | CLI/extension                      |
| ------------------------- | ----------------------------------------------- | -------------- | ------------------------------------------------ | ---------------------------------- |
| shared contract/unit      | required                                        | not planned    | required                                         | required                           |
| type/build                | required                                        | not applicable | built evidence; rerun when changed               | built evidence; rerun when changed |
| browser/a11y/privacy/perf | required                                        | not applicable | capability/privacy suite required before release | privacy/parity required            |
| device/QR/store           | browser required                                | not applicable | `wait_external`                                  | extension store `data_pending`     |
| production/release        | current revision released; new fix wave pending | not applicable | `wait_external`                                  | `data_pending`                     |
| field outcome             | `data_pending`                                  | not applicable | `data_pending`                                   | `data_pending`                     |

## External gates and next action

- `STOP`: Cloudflare production mutation for trust routes and PWA stale-shell repair. Freeze lane, account, Worker, source SHA, public impact, transmitted data and rollback immediately before execution.
- `wait_external`: desktop Developer ID signing/notarization and public distribution require demand plus account/device evidence.
- `data_pending`: discovery, activation, D1/D7/D30 retention, CLI/extension/desktop repeat use, support delivery canary.
- Next: close DC-AUD-01~04 locally, validate, then issue one owner-lane web release wave. Apps in Toss/iOS/Android remain excluded.
