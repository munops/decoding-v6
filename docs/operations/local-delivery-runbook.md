# decod.ing local delivery runbook

상태: `active` · 2026-09-03 · GitHub Actions 없음 · 이 문서는 provider mutation authority를 만들지 않는다.

decod.ing은 **사용자의 값을 이 기기에서 판별하는** zero-account 도구다. Git commit, local build, Web/PWA
Worker deploy, desktop/CLI/extension artifact, store/package publication, public release, monitoring, user value와
profitability는 서로 다른 상태다. local delivery의 non-secret infrastructure/API inventory는
`local-delivery.json`이 정본이다.

## 현재 인프라·API·데이터 경계

| 표면                                     | 실제 상태와 사용자 목적                                                                 | local delivery에서 허용되는 일                                                                    | 명시적으로 제외되는 일                                                                                          |
| ---------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Cloudflare `decoding-v6` Worker + Assets | `decod.ing`, `www.decod.ing`, Workers fallback에 정적 Astro/PWA와 `/healthz`를 제공한다 | exact clean SHA `BUILD_SHA`를 가진 existing Worker code/assets deploy와 version/traffic read-back | DNS/domain/routes, 새 binding/secret/resource/cost, indexing, sponsor activation, production 밖 channel release |
| Cloudflare `decoding-v6-staging`         | production route가 없는 isolated staging Worker                                         | exact staging wave의 existing Worker source upload/read-back                                      | production route/traffic, domain, preview alias 자동 생성, public release                                       |
| Analytics Engine `decoding_v6_events`    | `/e`와 `/e/events`에서 `app_open`/`landing_view` 이름별 1건만 쌓는다                    | unchanged binding을 가진 Web code delivery                                                        | event name/schema/retention/query/sampling/cost change                                                          |
| raw input·file·decoded result            | 브라우저 memory/Web Worker에서 local decode·operation을 수행한다                        | local privacy and browser tests                                                                   | URL, request body, Analytics, log, ad, support, receipt, Git으로 전송·기록                                      |
| PWA/local workspace                      | same-origin shell cache와 사용자가 명시 저장한 redacted workspace                       | local build/browser verification                                                                  | server sync, account, raw-payload backup/export                                                                 |
| CLI, Tauri desktop, MV3 extension        | local artifact engineering surfaces                                                     | local build/manifest/capability verification                                                      | npm/desktop/extension store publish, signing/notarization, updater manifest/artifact, review/release            |

제품 runtime에 외부 API·OAuth·AI·payment·database는 없다. Cloudflare Analytics Engine은 provider runtime
resource이지 payload API가 아니다. GitHub issue/security advisory와 `support@munops.com`은 사용자가 명시적으로
열어 가는 support route이며 product input/result를 자동 전송하지 않는다. Tauri updater URL은 설정만 존재하고
서명된 manifest/artifact와 public distribution은 아직 없다.

## 1. local candidate preflight

1. Git root, branch/HEAD, untracked files, project instruction, active `repo:decoding-v6`/provider claim과 fencing
   token을 확인한다. source는 clean commit이어야 한다.
2. `local-delivery.json.sourceRevision`을 runtime candidate commit으로 re-anchor한다. exact approved wave와 이
   declaration만 담은 clean delivery-metadata follow-up commit은 허용하지만, runner는 wave의
   `source_revision`이 ancestor인지와 그 이후 runtime path 변경이 0건인지 확인한다. 실행 직전 provider account,
   existing Worker/version/traffic/binding, destination, cost/recurrence, transmitted data, rollback version을
   fresh read-back한다. historical evidence는 현재 state를 대신하지 않는다.
3. Node 22 이상과 pnpm 10.15를 사용해 local gate를 실행한다. Worker dry-run은 upload가 아니다.

```bash
test -z "$(git status --porcelain=v1 --untracked-files=all)"
git diff --check
pnpm install --frozen-lockfile
pnpm verify
pnpm test:e2e
pnpm test:privacy
pnpm test:a11y
pnpm exec wrangler deploy --dry-run --config wrangler.toml --strict --keep-vars \
  --var "BUILD_SHA:$(git rev-parse HEAD)"
node ../scripts/check-ci-delivery-policy.mjs --project decoding-v6 --strict --require-local-release
node ../scripts/check-production-evidence.mjs --project decoding-v6 --strict
```

Development-only preview is `pnpm --filter @decoding/web build` followed by local Astro/Worker tooling. It must not
call `wrangler versions upload`, create a preview alias, add a GitHub secret, or publish a pull-request URL.

## 2. exact Web wave only

There is deliberately no active release wave in this checkout. A future approved
`docs/operations/release-wave-<id>.yaml` must include `status: approved` and the exact clean source SHA. The runner
also requires an explicit target; it fails before calling Cloudflare otherwise.

```bash
export DECODING_RELEASE_WAVE='docs/operations/release-wave-<approved-id>.yaml'
export DECODING_DELIVERY_TARGET='production' # or staging, never implicit
pnpm delivery:web:deploy -- --execute
```

The runner rebuilds and validates local Web code, then calls only the configured existing Worker with `--strict`,
`--keep-vars`, and the plain-text `BUILD_SHA`. It never changes DNS/routes, Analytics allowlist, data schema,
credentials, sponsor state, desktop/CLI/extension distribution, stores, or support provider state.

## 3. provider read-back and immutable receipt

After deploy, use the **same fresh wave**. `delivery:web:verify` requires the current clean SHA, calls canonical
`/healthz`, runs the real-origin synthetic decode/privacy smoke, and reads the Worker deployment list. At minimum
smoke `decod.ing`/`www`/Workers fallback for production; staging verifies only its staging origin.

```bash
export DECODING_EXPECTED_BUILD_SHA='<release-wave source_revision>'
pnpm delivery:web:verify
```

Write an immutable receipt under `docs/evidence/releases/local-owner-wave/` with UTC start/end, source SHA, local
commands/exits, artifact SHA-256, provider version/traffic and unchanged binding read-back, real-origin smoke,
rollback version and a no-secret/no-payload confirmation. Never record tokens, headers, raw input/result, file name,
input size, user identifier, support message, credential or full provider response. A Web receipt does not release
desktop, CLI, extension, Apps in Toss, iOS or Android.

## 4. abort, rollback and channel separation

If a local gate, provider binding/version/traffic read-back, `/healthz` SHA, privacy canary, real-origin smoke or
receipt differs, stop rather than call it released. A static Worker regression may roll back only to a newly
read-back compatible version in a separate exact wave:

```bash
export DECODING_ROLLBACK_VERSION='<fresh-provider-read-back-prior-version>'
pnpm delivery:web:rollback -- --execute
```

There is no database migration to undo. A Worker rollback does not publish/unpublish a desktop artifact, updater
manifest, CLI package or extension. Those channels require their own approval, signing/checksum, platform read-back,
device smoke, review/distribution and rollback evidence.

## 일상 개발 규칙

- 새 기능은 GitHub workflow가 아니라 local test/build command와 this inventory update로 시작한다.
- 새 provider/API는 before implementation: logical resource/credential reference, minimum transmitted data,
  prohibited data, cost/approval boundary, disabled behavior and rollback/read-back plan을 적는다.
- raw input/result가 local-only contract 밖으로 나갈 가능성이 있으면 network allowlist, privacy tests, trust
  copy, provider disclosure를 같은 work item에서 수정하고, 그 전에는 deploy하지 않는다.
- local development ends at preflight. Provider deploy/verify/rollback is an exact-wave action; a green build is not
  deployment, release, monitoring, user value or profitability.
