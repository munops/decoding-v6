# 한국어 제품 언어 공개 웹 배포 — 2026-08-24

## 고정한 범위

- Runtime source: `06564f552efbb63f46d4c1926dc6b360b2c057e2`.
- Channel: 기존 public web만. Cloudflare account `69abd904cab5ffd103e569e7e050a884`의 기존 Worker `decoding-v6`, 기존 `decod.ing/*`, `www.decod.ing/*`, 기술용 Workers fallback만 사용했다.
- 변경하지 않은 표면: Apps in Toss, desktop updater/distribution, extension, DNS/domain, credential, secret, database, KV, R2, D1, Analytics Engine schema/data.
- Upload: `apps/web/dist` 정적 산출물, Worker source/config, plain-text `BUILD_SHA`만 전송했다. 사용자 입력·결과·개인정보는 전송하지 않았다.
- Cost/public impact: 기존 shared Workers plan과 기존 리소스를 재사용해 새 고정비·결제 설정·리소스가 0개다. 기존 공개 URL의 웹 화면만 새 source로 교체했다.
- Clean detached worktree: source commit을 detached HEAD로 체크아웃해 `pnpm install --frozen-lockfile`, 검증, build, deploy를 실행했다. main의 외부 변경 `apps/extension/src/style.css`, `docs/monetization/ad-surface-registry.json`은 배포·commit에서 제외했다.

## 빌드와 정적 검증

- `pnpm check:i18n`: PASS — 8 locales, typed catalogs, localized routes, UI literal guard.
- `pnpm lint`: PASS.
- `pnpm typecheck`: PASS — Astro 51 files, 0 errors/warnings/hints.
- `pnpm test`: PASS — 9 files, 37 tests.
- `pnpm build`: PASS — web 486 pages, Astro 0 errors/warnings/hints; 전체 workspace package build도 통과했다.
- `node ../scripts/check-product-language.mjs --project decoding-v6 --strict`: 종료 1. 이번 public-web source가 아니라 배포하지 않은 기존 desktop 영어 문자열에서 errors 3을 보고했다. `pnpm check:i18n`과 아래 live Korean route 실측은 통과했으며 desktop은 이 release에 포함하지 않았다.
- Built web artifact: 526 files; sorted file-digest digest `1c8565308bf3637ffb471891051bf684cbabab31d0385fce3423876f46763053`.

## Provider chronology와 rollback

- 배포 직전 live read-back: deployment `11b32e4e-6bdc-4283-b123-75677b5e6bd1`, version `7fa42c37-88f0-4f07-b039-a1b4341faca3` at 100%, `/healthz` source `3fc2d9253c87a4061b539f7a80ecc11e81d179f5`.
- Exact upload: deployment `32d6c80a-4a9a-4759-82d7-a38e75c453fb`, version `0d7b792a-fece-4889-99b9-c24875ba64c7`; provider binding read-back의 `BUILD_SHA`가 runtime source와 일치했다.
- 기존 `verify:deploy`가 첫 `page.goto(..., waitUntil: 'networkidle')`에서 30초 timeout을 반환해 계약대로 즉시 version `7fa42c37-88f0-4f07-b039-a1b4341faca3`로 자동 rollback했다. rollback deployment는 `d30e7aea-ebd4-4031-82f2-b5be1a47ff6c`다.
- 같은 기존 production source에서도 동일 timeout을 재현해 source 회귀가 아니라 지속 요청을 idle로 기다리는 기존 harness 조건임을 분리했다. 특정 DOM·로컬 기능 완료를 기다리는 managed browser smoke는 기존 source의 실제 한국어 조판 결함(`word-break: normal`, h1 line-height ratio `0.94`, 영어 도구 제목, 1440px 한 글자 외톨이 줄)을 검출했다.
- 동일 immutable exact version을 다시 100% 활성화한 최종 deployment는 `4f7a89e6-f827-4431-8fa2-483b8ad6aacf`, version은 `0d7b792a-fece-4889-99b9-c24875ba64c7`다.
- 현재 rollback anchor: 즉시 이전 deployment `d30e7aea-ebd4-4031-82f2-b5be1a47ff6c`, version `7fa42c37-88f0-4f07-b039-a1b4341faca3`. health/source, canonical/immutable asset, 주요 Korean route, local operation 중 하나라도 회귀하면 이 version으로 `wrangler rollback`한다.

## Production read-back과 실제 화면

- Provider deployment status: final deployment가 version `0d7b792a-fece-4889-99b9-c24875ba64c7` 100%를 가리킨다.
- Provider version resources: `ASSETS`, plain-text `BUILD_SHA=06564f552efbb63f46d4c1926dc6b360b2c057e2`, 기존 `EVENTS` Analytics Engine binding만 존재한다.
- `https://decod.ing/`, `https://www.decod.ing/`, `https://decoding-v6.wjstks3474.workers.dev/`는 200이다. `/healthz`는 canonical과 Workers fallback 모두 exact runtime source를 반환했다.
- Canonical root의 linked `/_astro/_detector_.De5rUvi-.css`는 200, `content-type: text/css`, `cache-control: public, max-age=31536000, immutable`이다.
- Managed browser run `b2193a67-3900-4321-8b20-a3d2ff411b6e`에서 320/390/1440 각각 `/ko/`, `/ko/tools/`, `/ko/json-format/`, `/ko/methodology/`를 실측했다. 12개 조합 모두 HTTP 200, `lang=ko`, 한국어 목적형 h1, document overflow 0, clipped/out-of-bounds text 0, 어절 중간 절단 0, 한 글자 외톨이 마지막 줄 0이었다.
- 같은 12개 조합의 h1 computed style은 `word-break: keep-all`, `overflow-wrap: break-word`, `text-wrap: balance`, line-height ratio `1.16`이었다. 모바일 letter-spacing은 약 `-0.95px`~`-1.15px`, 1440은 `-1.7px`~`-1.8px`로 실측됐다.
- 같은 run에서 각 폭마다 `/ko/json-format/`에 `{"answer":42,"local":true}`를 입력해 실제 로컬 결과 `"answer": 42`를 확인했다. page/console error와 외부 request origin은 0이었다.

이 증거는 public web release만 증명한다. Apps in Toss, desktop/extension release, field retention, user value, revenue, Analytics Engine row 수를 증명하지 않는다. 중앙 `docs/munops/ops/action-log.md`는 다른 active writer claim 때문에 이번 commit에서 갱신하지 않았으며 reconciliation pending이다.
