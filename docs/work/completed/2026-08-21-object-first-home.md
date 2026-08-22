# DC-LANDING-05 — object-first home re-review

상태: `local_implementation_verified` (not deployed)

기준: `main@31d57c34847009a8ba61b07a250ebdb778f600aa`

확인일: 2026-08-21 Asia/Seoul

## 문제와 범위

이 검토는 제품의 local-only decoder, 47개 utility catalog, privacy boundary를 확장하거나 바꾸지 않는다. 홈에만 있던 두 소개 묶음이 같은 약속을 반복했다.

1. hero 오른쪽의 `Auto-detect / Recursive chain / Honest confidence` 3개 패널
2. 실제 입력면 아래의 `Format evidence / Deterministic warnings / Purpose-built tools` 3개 카드

실제 workbench에는 이미 실행 가능한 합성 사례 3개, local-only 상태, textarea, file drop과 결과의 chain/inspector가 있다. 따라서 위 두 묶음은 첫 작업을 돕지 않고 “모든 기능을 설명하는 AI 도구 랜딩”처럼 보이게 했다. 장식 SVG가 문제인 제품은 아니었지만, workbench와 무관한 큰 dark panel 및 반복 카드가 같은 template 신호를 만들었다.

## 실제 제품과 비교 근거

| 비교 대상                                      | 실제 관찰                                                                                                                                    | 가져오는 원칙                                                  | 의도적으로 가져오지 않는 것                                    |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------- |
| [CyberChef](https://gchq.github.io/CyberChef/) | Operations, Recipe, Input, Output을 한 작업면에 계속 유지하고 input/file drop을 직접 제공한다. 브라우저에서 전체 처리된다는 경계도 명시한다. | 많은 기능은 목록이 아니라 현재 input/output 맥락에서 드러낸다. | 수백 operation과 recipe builder를 첫 화면에 펼치는 정보 밀도   |
| [jwt.io Debugger](https://www.jwt.io/)         | `Paste a JWT` 다음에 encoded input과 decoded header/payload, copy action을 바로 붙인다.                                                      | 입력과 판독 결과를 설명보다 먼저 맞물리게 둔다.                | JWT 하나만 처리하는 단일 포맷 구조와 검증 성공을 과장하는 표현 |
| [DevUtils](https://devutils.com/docs/)         | offline smart detection과 작은 developer utility 목록을 명시하고, 사용자가 목록에서 도구를 고른다.                                           | 넓은 utility catalog는 catalog 진입점이 맡는다.                | 홈에 utility 목록과 기능 카드를 동시에 전시하는 구조           |

검토 당시 decod.ing의 local Chromium desktop/mobile 화면도 확인했다. textarea는 첫 viewport에 있었지만, 같은 auto-detect·evidence·local promise가 hero panel, launchpad, value card, footer에 네 번 반복됐다.

## 선택과 기각

| 방향                                                       | 판정 | 이유                                                                                                                        | 뒤집히는 조건                                                                 |
| ---------------------------------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 장식만 약하게 하고 두 소개 묶음 유지                       | 기각 | 중복된 정보 구조와 feature-card 문법은 그대로 남는다.                                                                       | 사용성 검증에서 사용자가 결과를 보기 전에 이 설명을 실제로 필요로 한다는 증거 |
| 새 feature·새 도구를 홈에 더해 가치 확대                   | 기각 | 이미 47-tool catalog가 있고, 첫 판독과 무관한 범위를 다시 홈에 쌓게 된다.                                                   | 원문을 붙여넣는 core loop가 아니라 특정 새 job의 반복 수요가 확인될 때        |
| 실제 workbench를 주인공으로 하고 상세를 해당 화면으로 분산 | 선택 | `도착 → 입력/안전 사례 → 후보·근거`의 첫 가치를 단축하고, feature 설명은 result·method·catalog에서 실제 맥락과 함께 읽힌다. | 첫 입력 전 이탈/오류가 증가하거나 첫 판독 전환이 악화된 사용자 증거           |

## 구현 계약

- Hero: `Trace the value. Keep the evidence.`라는 한 promise, local upload=0 proof만 남긴다. 각 locale은 같은 의미의 짧은 두 줄 heading을 사용한다.
- Workbench: 실제 textarea, file drop, 합성 사례 세 개와 local-only state를 유지한다. 어느 입력도 자동 paste/upload/storage/analytics로 확장하지 않는다.
- 하단: feature matrix와 `47 tools` 링크 카드를 제거한다. 넓은 도구 탐색은 이미 목적이 분명한 header catalog `/tools/`가 맡는다.
- Artwork: 새 생성 이미지나 generic SVG를 더하지 않는다. 기존 수제 `d/` mark는 product symbol로 보존한다.
- 결과/방법: format evidence·warning·recursive chain은 빈 랜딩 card가 아니라 decoder result와 `/method/`의 해당 설명에 남긴다.

### 같은 제품의 보조 surface

포트폴리오 판정은 `apps/extension/src/style.css`의 오래된 lavender 기본 background를 이 제품의 surface로 감지했다. 이 extension result shell은 랜딩을 늘리는 대상이 아니지만, 서로 다른 보라색 generic utility처럼 보이면 제품 정체성이 다시 갈라진다. web의 `paper / ink / signal` 색을 같은 기능 경계에 적용한다. extension의 payload/session 동작, 권한, copy 흐름, 번들 구조는 바꾸지 않는다.

## 검증 계획

1. i18n typecheck와 dead home-copy 검색
2. static build
3. Chromium desktop/mobile에서 first viewport, safe synthetic case, nested result, overflow를 확인
4. local wide/mobile screenshot을 직접 검사하고 source anti-slop search를 남김

이 기록은 local source 변경의 계획·근거다. deployment, provider read-back, public release, 실제 사용 전환, 반복 사용 또는 수익의 증거는 아니다.

## 실행 증거

| 검증                                                                                                          | 결과                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm test`                                                                                                   | 30 passed                                                                                                                                                                                                                       |
| `pnpm --filter @decoding/web build`                                                                           | Astro check 0 error/warning/hint, static 486 pages built                                                                                                                                                                        |
| `PLAYWRIGHT_PORT=4329 node ../scripts/run-agent-browser.mjs --timeout-ms 120000 -- pnpm exec playwright test` | 32 passed, mobile-only desktop-viewport assertion 1 skipped; home axe/privacy/PWA/product/overflow 포함                                                                                                                         |
| `pnpm typecheck && pnpm lint`                                                                                 | pass                                                                                                                                                                                                                            |
| 변경 파일 Prettier check                                                                                      | pass. 전체 `prettier --check .`는 이 작업 전부터 정렬되지 않은 `docs/monetization/ad-surface-registry.json`, `docs/product/category-coverage.json`, `docs/product/complete-service.json`도 보고하므로 전체 PASS로 승격하지 않음 |
| `pnpm --filter @decoding/extension build && pnpm check:extension`                                             | extension bundle pass; contextMenus + activeTab + storage, host permission 없음, `connect-src none` 유지                                                                                                                        |
| `node ../scripts/check-portfolio-distinctiveness.mjs --project decoding-v6`                                   | 0 error, 0 warning                                                                                                                                                                                                              |

첫 browser 시도에서는 새 heading의 vertical footprint 때문에 720px desktop viewport에서 textarea 첫 80px이 43px 아래로 밀렸다. Hero block padding을 줄여 같은 assertion을 재실행했고 최종 suite에서 통과했다. 기능을 줄였다는 이유로 first value를 늦추지 않았음을 이 실패와 수정으로 확인했다.

`docs/evidence/dc-landing-05/`에는 route-integrated wide/mobile home과 catalog render를 남겼다. 파일 hash, dimensions, 실행 명령은 [receipt](../../evidence/dc-landing-05/receipt.json)를 따른다. 이 캡처는 local render 증거이며 디자인 승인·production release·사용자 가치 증거는 아니다.
