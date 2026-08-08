# decod.ing data inventory

상태: `implemented` — source `fde62a1` 기준 코드 대사, 2026-08-08 확인. 공개 정책 경로와 provider 로그·보존 read-back은 별도 증거입니다.

## 제품 데이터 경계

| 데이터                                      | 목적                                 | 경로·저장 위치                                                   | 보존·삭제                                                                | 외부 전송                        |
| ------------------------------------------- | ------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------- |
| raw input, file bytes, decoded values       | 로컬 판별·변환                       | page memory → dedicated Web Worker memory                        | Clear·tab close·process 종료 때 reference 해제                           | 금지                             |
| theme                                       | 명시적 light/dark 선택               | `localStorage: decoding-theme`                                   | site data 삭제                                                           | 없음                             |
| locale suggestion dismiss                   | 같은 session의 제안 닫기             | `sessionStorage: decoding-locale-suggestion-dismissed`           | session 종료·site data 삭제                                              | 없음                             |
| favorite/recent tool slugs                  | 로컬 도구 재진입                     | `localStorage: decoding-favorite-tools`, `decoding-recent-tools` | 사용자가 변경하거나 site data 삭제                                       | 없음                             |
| copy sound enabled/volume                   | 명시적 copy feedback 설정            | `localStorage: decoding-copy-feedback`                           | site data 삭제                                                           | 없음                             |
| redacted workspace record                   | 사용자가 명시적으로 저장한 구조·메모 | IndexedDB `decoding-local-workspace/redacted-records`            | session·24h·7d·keep TTL, 항목 삭제, Clear workspace, site data 삭제      | 없음                             |
| static shell and visited same-origin assets | PWA offline 재진입                   | Cache Storage `decoding-v6-shell-v3`                             | 새 worker activate 때 이전 cache 삭제, site data 삭제                    | same-origin fetch only           |
| support report                              | 사용자가 명시적으로 문의             | GitHub issue/private advisory 또는 support email                 | 해당 provider 정책과 요청 처리 목적에 따름; production payload 첨부 금지 | 사용자가 선택한 support provider |

## 구현 근거

- runtime network primitive: `scripts/check-network-allowlist.ts`가 UI/runtime source의 허용되지 않은 network primitive를 차단한다.
- payload egress/storage: `tests/privacy/payload-egress.spec.ts`가 request, WebSocket/fetch/beacon, local/session storage, IndexedDB, Cache Storage, history에서 synthetic canary 부재를 검사한다.
- local workspace: `apps/web/src/lib/workspace.ts`가 scalar를 type marker로 치환하고 sensitive key를 redaction한다.
- tool preference: `apps/web/src/islands/ToolSearch.tsx`와 `packages/workbench-ui/src/copy-feedback.ts`가 위에 열거한 고정 key만 쓴다.
- PWA: `apps/web/public/sw.js`는 query가 있는 URL을 cache하지 않고 navigation은 network-first, fingerprinted `/_astro/` asset만 cache-first로 처리한다.

## 외부 provider 경계

- public web은 Cloudflare Worker Static Assets를 사용한다. 제품 코드에는 analytics, crash reporter, auth, payment, advertising, database binding이 없다.
- Cloudflare의 실제 edge request metadata, 국가, 보존, 관리 설정은 provider read-back 없이는 추측하지 않는다. raw input/result는 URL·request body·event로 구성하지 않는다.
- `support@munops.com` 전달·발신의 현재 provider와 delivery canary는 shared legal-account evidence이며 제품 Git에는 개인 전달 주소를 기록하지 않는다.

## 변경 트리거

analytics, 광고, auth, payment, crash reporting, 외부 font/image/script, server decoder, update endpoint 또는 새 support provider가 추가되면 이 inventory, privacy/terms/support copy, CSP/network allowlist, provider disclosure와 관련 tests를 같은 work item에서 갱신한다.
