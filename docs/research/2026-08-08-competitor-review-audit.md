# decod.ing 경쟁 리뷰·역대조 감사 — 2026-08-08

상태: `reviewed` · 범위: public web/PWA/CLI/desktop engineering path · checkedAt: 2026-08-08 (Asia/Seoul)

이 문서는 기능 수를 맞추기 위한 조사가 아니다. 사람들이 이미 좋아하는 동작, 이탈 이유, decod.ing이 실제로 더 잘해야 할 계약을 현재 공개 기능과 사용자 원문에 대조한다.

## 현재 경쟁 표면

| 제품 | 현재 강점 | 구조적 범위·리스크 | 확인 출처 |
| --- | --- | --- | --- |
| CyberChef | 방대한 operation, recipe, breakpoint, input/output highlight, local processing, downloadable build | recipe builder의 학습비용·복잡도, input을 포함할 수 있는 share URL, 대형 input의 Auto Bake 성능 부담 | [official README](https://github.com/gchq/CyberChef), [2026 changelog](https://github.com/gchq/CyberChef/blob/master/CHANGELOG.md) |
| DevUtils 1.17.0 | 47+ 전용 도구, native macOS, offline, smart clipboard, menu/hotkey | macOS·유료 배포, 개발 언어/작업별 적합성 편차 | [official home](https://devutils.com/), [2026 review](https://josephnilo.com/blog/devutils-setapp-review/), [HN discussion](https://news.ycombinator.com/item?id=29077933) |
| DecodeThis | paste auto-detect, specialized view, nested unwrap, free/open/browser-local | decod.ing의 기존 “local universal decoder” 약속과 가장 직접적으로 겹침 | [official about](https://decodethis.dev/about/) |
| jwt.io | JWT decode/encode, header/payload contextual copy, optional signature verification, claim breakdown | 단일 포맷이며 decode·validate·verify 상태 혼동 가능성 | [official debugger](https://www.jwt.io/), [verification report](https://community.auth0.com/t/new-jwt-io-fails-to-verify-signature-for-hs512/189278) |

## S-1 저점(불만) 7건

1. 플랫폼 제외: "Mac only. Stuff like this should be in the title" — DevUtils HN.
2. 도구 적합성 편차: "only a few would probably apply to my workflow" — DevUtils HN.
3. 무료 대안 대비 가격: "The problem is that you're trying to replace a bunch of free tools." — DevUtils discussion.
4. 편집기 이탈 비용: "Why use this over VSCode extensions that do the same thing for free?" — DevUtils discussion.
5. 대형 input 자동 실행 부담: CyberChef는 Auto Bake가 performance에 영향을 줄 수 있어 끌 수 있다고 공식 설명한다.
6. parser·operation 실패: CyberChef 2026 changelog에는 freeze, misleading error, XSS/ReDoS/prototype protection 수정이 반복된다.
7. 검증 의미 혼동: jwt.io 사용자 보고에는 기존에는 decode되던 token의 HS512 signature verification 실패가 기록돼 있다.

금기: Mac-only를 기본 경로로 만들지 않기, free utility를 paywall로 막지 않기, 47개를 첫 화면에 쏟지 않기, 입력과 결과를 share URL에 넣지 않기, 자동 실행으로 UI를 freeze하지 않기, decode를 verification success처럼 보이지 않기, parser exception을 raw error로 노출하지 않기.

## S-2 고점(강점) 7건

1. local trust: "pasting text into sites of dubious origin"을 피한다는 DevUtils testimonial이 반복 job을 정확히 말한다.
2. offline/native speed: "Clipboard smart detection speeds up repetitive formatting and decoding tasks." — 2026 DevUtils review.
3. catalog breadth: DevUtils는 47+ carefully crafted tools를 전용 UI로 제공한다.
4. composition: CyberChef recipe와 breakpoint는 복합 변환을 단계별로 다루는 힘이 있다.
5. correlation: CyberChef input/output highlight는 변환 전후 위치 관계를 추적한다.
6. near-zero start: DecodeThis는 paste auto-detect와 nested unwrap으로 tool selection tax를 없앤다.
7. contextual inspection: jwt.io는 encoded token과 decoded header/payload, copy action을 같은 화면에 둔다.

## S-3 역대조표

| 리뷰·강점/불만 | 판정 | 제품 반영·제외 근거 |
| --- | --- | --- |
| local/offline trust | 커버 | Web Worker, no-network gate, PWA/CLI, privacy canary — PRD-09 |
| hotkey/clipboard speed | 커버(제약) | Tauri explicit shortcut 1회 read; public notarized release는 demand/signing gate — PRD-10 |
| 47-tool breadth | 커버 | operation manifest·lazy chunk·route parity — CHECKLIST Pack 1~4 |
| recipe composition | 의도적 제외 | 400-operation recipe builder가 아니라 자동 triage·bounded chain이 core — README §7 |
| input/output correlation | 커버 | Decode chain + Inspector + evidence — DC-DESIGN-02 |
| paste auto-detect/nested unwrap | 커버 | 8 detector, confidence/margin, depth/node/cycle limits — PRD-01 |
| contextual copy | 커버 | result-local copy/redacted export/copy feedback — DC-UP-01 |
| Mac-only exclusion | 커버 | public web/PWA/CLI가 primary, desktop은 optional later channel |
| paid-vs-free friction | 커버 | zero account/payment/subscription, free core — ADR-003 |
| generic tool mismatch | 커버 | category search/recent/favorite + per-operation inspector; unused page prune trigger |
| editor switching cost | 커버(제약) | stdin CLI와 MV3 context menu engineering build; store/value evidence는 data_pending |
| Auto Bake performance | 커버 | 2s CPU/10MiB/32MiB/100:1 limits, dedicated workers, bundle/benchmark gate |
| raw parser/security error | 커버 | deterministic typed limit/error states, malicious fixtures, no-execution preview |
| decode/verification confusion | 커버 | unverified signature warning and rule/spec link; verification success를 주장하지 않음 |

**미커버 0건.** 제약 표시는 기능 부재를 숨기는 말이 아니라 demand, signing, store, live cohort라는 다음 증거를 분리한 것이다.

## S-6 경쟁 초과와 실제 기능

1. jwt.io는 단일 JWT debugger 범위를 바꾸지 않고는 **구조적으로 못 하는 것**이 format-agnostic ranked candidates와 recursive cross-format chain이다. `packages/engine`과 browser tests가 이를 제공한다.
2. DevUtils의 paid native/macOS 배포는 모델을 바꾸지 않고는 **구조적으로 못 하는 것**이 zero-install cross-platform web + free/no-account core다. decod.ing은 web/PWA/CLI를 primary로 두고 desktop을 later channel로 격리한다.
3. CyberChef의 recipe deep link는 input을 URL에 넣을 수 있다. decod.ing에서 **경쟁에는 없는 기본 안전 계약**은 raw/decoded/digest/size/file name을 제외한 local-safe summary/card이며 privacy test가 이를 강제한다.
4. DecodeThis와 약속이 가장 겹치므로 “local auto-detect”만으로는 우리만의 이유가 아니다. **우리만 현재 구현·검증한 결합**은 competing candidate confidence/evidence, ambiguity no-auto-select, deterministic rule IDs, executed-chain receipt, local-safe share projection이다.

이 축은 복제 불가능한 영구 moat라고 주장하지 않는다. 공개 코드로 모방할 수 있으므로 detector fixture quality, cross-negative, privacy/performance gates와 빠른 오류 수정이 실행 moat다.

## 감사에서 나온 Must ID

| ID | Must outcome | 중앙 owner | observable acceptance |
| --- | --- | --- | --- |
| DC-AUD-01 | privacy/terms/support가 실제 공개 trust path를 이룬다 | `apps/web/src/i18n/trust.ts`, `docs/trust/*` | 세 route 200, footer reachability, a11y, no-secret support copy |
| DC-AUD-02 | 이전 PWA cache가 새 HTML과 삭제된 asset hash를 영구 고정하지 않는다 | `apps/web/public/sw.js` | online navigation network-first, stale cache fixture가 fresh app으로 교체, offline core 유지 |
| DC-AUD-03 | evidence/ambiguity/warning/safe-share 차별점이 regression gate로 남는다 | engine/workbench/test owners | nested·ambiguous·expired JWT·safe-share fixture 통과 |
| DC-AUD-04 | web/Apps in Toss/native/auxiliary channel truth를 별도 상태로 기록한다 | `docs/platforms/channel-manifest.json` | validator 0 warning, build/released/field states 분리 |
