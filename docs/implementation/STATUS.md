# v6 implementation status

Updated: 2026-08-02

## Released

- Production: <https://decod.ing> and <https://www.decod.ing>
- Source: <https://github.com/whoo3474/decoding-v6>
- Fallback: <https://decoding-v6.wjstks3474.workers.dev>
- Staging: <https://decoding-v6-staging.wjstks3474.workers.dev>
- Released source revision: `2fe88c752b5ca8b83fde12432df34330b1688e70`
- Cloudflare production version: `9e8118e6-10c5-4da2-9b6f-f9f30025fa63`
- Cloudflare staging version: `d69c1127-91bc-4eee-8fa4-010f260b4473`
- Rollback and restore drill: passed on staging

See [DEPLOYMENT.md](./DEPLOYMENT.md) for route, version, HTTP, browser, privacy-canary, and rollback evidence.

## Code-complete scope

- 2026-08-01~~02 DC-DESIGN-01~~04: `Reveal Ledger` 브랜드 방향과 중앙 semantic token, 수제 `d/` symbol·wordmark·favicon/PWA/OG, 명시적 light/dark theme control을 구현했다. 홈의 실제 paste surface를 desktop 첫 viewport 안으로 올리고 Decode chain + Inspector를 시그니처 화면으로 재구성했으며 catalog·47 tool·8 detector·workspace·info/download가 같은 component anatomy를 소비한다. local desktop/mobile/dark/result/tool/workspace/OG/icon render inspection, 200% desktop-equivalent overflow, keyboard, axe, privacy, PWA, lazy-bundle gate를 통과했고 2026-08-02에 staging과 production으로 배포했다. 세 공개 entrypoint의 합성 사례·local operation·privacy canary smoke도 통과했다.
- 2026-08-01 validation harness: 전체 검증의 병렬 부하에서 실제 작업이 기존 operation 5초·spawned CLI 15초 상한을 근소하게 넘는 현상을 확인했다. assertion을 유지하고 해당 integration ceiling만 20초·30초로 조정해 unit 21/21을 통과했다. engine 1 MiB 예산 100ms/300ms는 변경하지 않았고, quiet isolated 측정 first p75 18.9ms·complete p75 96.7ms를 유지한다.
- 2026-08-01 DC-UX-01: 홈의 primary proof를 tool count에서 unknown-value triage로 전환하고, 중첩 Base64 → JSON·ambiguous Hex/Base64·expired JWT 경고를 실제 workbench에서 실행하는 합성 사례 3개를 추가했다. 사례 payload는 URL·storage·analytics·외부 request로 전달되지 않으며 47-tool catalog는 보조 탐색으로 유지한다.
- 2026-07-30 DC-UP-02: recursive decode chain의 단계·detector label·입력 크기를 `tree/treeitem/group`과 roving keyboard로 노출하고, ambiguous 입력은 자동 확정 없이 상태 텍스트와 후보를 표시한다. lint/type/unit 및 desktop/mobile Playwright fixture를 다시 통과했다.
- 2026-07-30 DC-UP-01: 성공한 explicit Copy 뒤에만 local Web Audio 확인음을 내고, 0.3 기본 볼륨/영속 토글/무음 시각 폴백을 추가했다. raw payload egress·storage는 여전히 0이며 실제 OS mute/AT 청취는 외부 검증 gate다.
- 2026-07-30 DC-UP-03: code-native SVG에서 install/share-compatible PNG를 파생하고 manifest·OG metadata·query-safe PWA cache를 검증했다. worker는 기존 화면의 강제 update를 하지 않으며, production crawler/install observation은 아직 주장하지 않는다.
- 8 detector families, recursive chain, confidence/margin selection, cycle and resource limits
- 20 positive + 10 edge + 20 negative public fixtures per detector; official specification registry and per-format public quality gate
- 47/47 DevUtils-audited tools, route/search/help/runtime parity, valid fixture for every operation, parser/preview malicious fixtures
- 484-page static web build: English plus 7 translation-beta locales across 47 tools, 8 detectors, home, privacy, methodology, and about
- typed `en/ko/ja/zh-cn/es/pt-br/de/fr` workbench catalogs, locale suggestions without redirects, self-canonical pages, and native-review `noindex` gates
- responsive light/dark UI, automated serious-impact axe gate, PWA offline cache
- explicit redacted-only IndexedDB workspace with TTL, export preview, per-record deletion, and clear-all
- stdin/file-only CLI, local Tauri app, and minimum-permission MV3 extension
- zero product analytics, account, payment, server decode, advertising, or payload network primitives

The user explicitly requested implementation of the complete 47-tool, desktop, and extension surfaces before the PRD's demand gates. Those surfaces are implemented for evaluation, but their public native-store release and success metrics remain gated below.

## Verified

- `pnpm verify`: format, lint, strict types, unit/fixture/CLI tests, benchmark, content/link/network/parity/extension checks, all builds, bundle budget
- GitHub Actions hosted CI: [`verify` and `test:e2e` passed](https://github.com/whoo3474/decoding-v6/actions/runs/30736136902)
- Playwright: desktop/mobile UI, local worker operations, PWA offline reload, same-origin request audit, privacy canary, IndexedDB raw-secret absence, and axe
- public fixture quality: at least 95% precision and 90% recall for each detector family
- 1 MiB engine benchmark: first candidate p75 1.9 ms, complete p75 15.2 ms
- initial application JavaScript: 20.3 KiB gzip; heavy operation categories remain lazy
- DC-DESIGN-01~04 local validation: 484 static pages, 20.3 KiB initial JavaScript gzip, 9 heavy chunks lazy; Playwright 28 passed and 1 intentionally skipped mobile execution of a desktop-only first-viewport assertion
- Tauri: Rust `cargo check`, native release bundle, updater signing, checksums, code-sign verification, capability allowlist, and two-minute no-socket runtime observation
- Cloudflare: staging, production, custom-domain cutover, external Chromium smoke/privacy gate, and rollback/restore drill
- Cloudflare immutable i18n preview: `f9ad317e-1204-42b9-82ad-d9afd1ff8c74` at `https://codex-i18n-decoding-v6.wjstks3474.workers.dev`
- PR preview workflow and repository variables are configured; the dedicated minimal Cloudflare API token remains an owner-authenticated dashboard action
- sponsor adapter defaults to none and validates same-origin raster assets, HTTPS targets, dates, categories, and forbidden payload/session query keys

## Desktop artifacts

The local Apple Silicon and universal macOS builds are ad-hoc signed with hardened runtime for engineering validation. They are not Apple-notarized and therefore are not exposed on the public download page.

| Artifact                        |    Size | SHA-256                                                            |
| ------------------------------- | ------: | ------------------------------------------------------------------ |
| `decod.ing_6.0.0_aarch64.dmg`   | 5.1 MiB | `204dac9b45eb24b87d7fe4b19a0384821ca6e9c7d286d1f12aba360fc6729e34` |
| `decod.ing_6.0.0_universal.dmg` |  10 MiB | `c81ab8b06432523c90eb043c14f654f2aea245d9c9604bd8500e30abb64532d7` |
| `decod.ing.app.tar.gz`          | 5.2 MiB | `aa2bf1ae170c253d6d5cb838144947fc48ac57898c793e75b7d2b93751044790` |
| updater signature               |   408 B | `28bdcdc5061a1039cbd74b2749479921a34d673f8dde2a0fea7c06c899953a36` |

The universal engineering DMG contains both `x86_64` and `arm64`; `codesign --verify --deep --strict` and `hdiutil verify` pass. It is ad-hoc signed, not notarized, and is correctly rejected by Gatekeeper, so public download remains disabled. The private updater key is outside the repository. The public key is in Tauri configuration. Native UI automation through the local accessibility bridge was unavailable, so native validation used the shared web UI E2E suite plus process, signature, bundle, capability, and socket checks.

## External evidence gates — pending, not claimed

- genuinely independent blind fixtures: public deterministic fixtures pass, but blind data cannot be authored and scored by the same implementation run
- developer/SRE/security beta with 10 real participants and the 8/10 ten-second completion gate
- traffic, task completion, Search Console, retention, locale, desktop install/repeat/crash-free, and advertising baselines over the PRD observation windows
- Show HN, subreddit, and extension-store launch activities
- Apple Developer ID signing/notarization and macOS universal release require owner credentials; Windows/Linux packages require a connected release workflow
- full manual WCAG 2.2 AA audit and real-user assistive-technology verification
- PR preview workflow needs a dedicated `CLOUDFLARE_API_TOKEN`; the local expiring OAuth session was deliberately not copied into GitHub Secrets
- all 7 non-English locales are labeled translation beta and excluded from indexing until native technical/privacy review

These gates remain unchecked in [CHECKLIST.md](../prd/CHECKLIST.md). No ad slot or ad request exists until Phase 4 evidence is real.
