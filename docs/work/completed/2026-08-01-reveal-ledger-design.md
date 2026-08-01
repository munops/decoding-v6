# DC-DESIGN-01~04 — Reveal Ledger product design

상태: `done` (local implementation and validation)

기준: `main@ccd0ed76f2b28f6f735c6c98af90f1aaee2220ee`에서 시작

확인일: 2026-08-01 Asia/Seoul

## Intent

기능적으로 완성된 decod.ing을 generic purple SaaS가 아니라 local-only developer triage의 의미가 보이는 제품 경험으로 재구성한다. 브랜드·홈·decode result·catalog·tool·workspace·문서 surface를 하나의 중앙 디자인 owner로 통합한다.

## In scope / Out of scope

- In: benchmark, art direction, semantic tokens, code-native symbol/wordmark, favicon/PWA/OG derivatives, light/dark control, responsive hierarchy, chain signature surface, catalog/tool/workspace/info consistency, visual/a11y/privacy/performance regression.
- Out: engine/detector behavior change, analytics/ads/account/payment, 외부 font/image, production deploy, social crawler, real-user/AT approval.
- 시작 시 존재한 `docs/prd/README.md` 변경은 사용자 소유로 보존했고 이 작업에서 편집하거나 완료 범위에 포함하지 않았다.

## Impact map

```text
DC-DESIGN-01~04
  → docs/prd/05-uiux.md + global.css semantic tokens
  → Layout/BrandMark + WebDecoder/DecoderWorkbench + ToolSearch/ToolWorkbench
  → home/catalog/tool/detector/workspace/info/download
  → favicon/PWA/OG raster derivatives
  → i18n/theme storage + responsive/a11y/privacy/performance tests
```

## Evidence

| Acceptance                                | Procedure                                                                                                                                                                                                                                                                                                                                                   | Result                                                                       |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Original benchmark and anti-copy boundary | official CyberChef, DevUtils, jwt.io, Raycast sources checked 2026-08-01; `docs/research/2026-08-01-product-design-benchmark.md`                                                                                                                                                                                                                            | pass                                                                         |
| SVG/raster presentation                   | `sips -g pixelWidth -g pixelHeight` on 32, 180, 192, 512, 1200×630 derivatives; local visual read-back of icon and OG                                                                                                                                                                                                                                       | pass                                                                         |
| Visual states                             | Chromium 1440×1000 light/dark, Pixel/iPhone-class mobile, nested result full page, `/tools/`, `/json-format/`, `/workspace/` screenshots inspected                                                                                                                                                                                                          | pass; human owner approval remains external                                  |
| Focused browser behavior                  | `pnpm exec playwright test tests/e2e/product.spec.ts tests/e2e/responsive.spec.ts tests/e2e/pwa.spec.ts`                                                                                                                                                                                                                                                    | 21 passed, 1 desktop-only test skipped on mobile                             |
| Full browser/privacy/a11y                 | `pnpm exec playwright test` after contrast fix                                                                                                                                                                                                                                                                                                              | 28 passed, 1 desktop-only test skipped on mobile                             |
| Static/unit/contracts                     | `pnpm verify` component sequence. Full-run contention exposed legacy 5s operation and 15s spawned-CLI timeouts; assertions were preserved and those integration-only ceilings were aligned to 20s/30s. Unit 21/21 and all remaining contract layers passed after the change.                                                                                | pass by focused rerun and complete component sequence                        |
| Engine latency                            | The first loaded-host run measured complete p75 330.6ms; a quiet isolated rerun passed at first p75 18.9ms and complete p75 96.7ms. Later reruns measured 305.5/416.9ms while unrelated VM/Orca processes consumed roughly 104%/71% CPU, so they are recorded as host-loaded and do not replace the quiet measurement. No engine code changed in this work. | 100ms/300ms budget preserved; quiet isolated pass                            |
| Build/performance                         | 484 static pages; bundle gate                                                                                                                                                                                                                                                                                                                               | 20.3 KiB initial JS gzip; 9 heavy chunks lazy                                |
| Privacy                                   | network allowlist plus payload/clipboard/workspace Playwright cases                                                                                                                                                                                                                                                                                         | same-origin only; synthetic payload absent from requests and browser storage |

## Result / follow-up

- DC-DESIGN-01~04의 local implementation, test, build 상태는 `done`이다.
- 전체 검증 중 발견된 integration harness 변동성은 operation 대표 테스트 20초, spawned CLI process 테스트 30초의 명시적 상한으로 정리했다. 기능 assertion이나 1 MiB 100ms/300ms 성능 예산은 완화하지 않았다.
- staging/production은 외부 mutation 전 승인 대상이며 아직 실행하지 않았다.
- 실제 사용자 10명, manual WCAG/AT, social crawler/PWA install, production runtime은 기존 gate대로 `data_pending`이다.
- rollback 기준은 현재 production source `6281e935d418559e607361823beaf447e74a41e4`, Cloudflare version `46340612-e1f2-49f3-a075-6d94305bfa69`이다. 새 deployment version은 승인·배포 뒤에만 기록한다.
