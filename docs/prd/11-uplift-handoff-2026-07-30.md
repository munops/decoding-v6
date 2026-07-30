# PRD-11 — Uplift handoff (2026-07-30)

> 워크스페이스 `docs/munops/prd/decoding-v6.md` 후보를 v6 SSOT에 병합한 문서다. 구현 준비 판정은 existing code·PRD를 재대조한 결과이며 구현, 수동 접근성 검토, 제품 지표, 새 배포의 완료 판정은 아니다.

## 보존하는 제품 경계

- raw input·decoded result는 로컬에서만 처리한다. 사운드 설정, PWA, visual badge가 payload egress·account·analytics·광고 요청을 추가해서는 안 된다.
- 개발자 도구에는 스트릭·push·습관화 알림을 넣지 않는다. 반복 사용은 결과 정확도·속도·명시적 PWA 설치와 offline 동작으로만 만든다.
- 기존 `ChainView`는 재귀 단계·선택 detector·근거를 표시하고, `favicon.svg`, `icon.svg`, `og.svg`, manifest와 same-origin service worker가 있다. 이 증거는 새 visual/brand 완료의 증거가 아니라 증분의 기준선이다.

## 병합 항목

| ID | 구현 단위 | owner / deps | acceptance·경계 | readiness |
|---|---|---|---|---|
| DC-UP-01 | 명시적 copy 성공에서만 `save.success`를 재생하고 설정 토글(기본 0.3)을 로컬 저장한다. | `workbench-ui` adapter, `05-uiux`, privacy tests | 토글·OS mute·reduced-motion·재생 실패는 시각 copied message로 no-op한다. paste/detect/error에는 기본 음을 추가하지 않으며 clipboard/write와 네트워크 경계를 넓히지 않는다. | item_ready |
| DC-UP-02 | 재귀 chain의 각 단계에 detector label·단계 순서·입력 size를 읽을 수 있는 badge로 정리한다. | `ChainView`, `05-uiux`, a11y suite | 현재 depth indentation/evidence를 보존하고, low-confidence·ambiguous·limit/error와 좁은 viewport에서 색만으로 단계를 구별하지 않는다. 내용을 자동 확정하거나 원문을 외부로 내보내지 않는다. | item_ready |
| DC-UP-03 | 현행 SVG favicon/icon/OG와 PWA cache를 실제 share/search/install presentation 기준으로 재검증·정리한다. | `apps/web/public`, layout, `06-architecture`, privacy/perf | manifest·OG 응답과 offline core를 build/browser에서 확인한다. PWA standalone에도 광고 요청 0, 강제 update 0, payload persistence 0을 유지한다. 브랜드 교체나 도메인/production 변경은 이 ID의 범위가 아니다. | item_ready |

## 실행 순서와 측정

1. DC-UP-02의 badge semantic/a11y를 먼저 추가하고 existing nested-chain fixture와 visual regression을 보강한다.
2. DC-UP-01은 copy action fixture, persistent toggle, no-audio fallback, privacy/network regression을 한 change에 묶는다.
3. DC-UP-03은 production claim이 아닌 local/preview manifest·OG·offline smoke로 끝낸다. 외부 Search Console·PWA install·repeat-use는 fixed cohort/window이 생길 때 `data_pending`으로 별도 측정한다.

인계 병합 시점에는 코드·오디오 asset·브라우저/실기기·Search Console·새 deploy를 실행하거나 변경하지 않았다. 이후 구현·검증 상태는 [CHECKLIST](CHECKLIST.md#prd-11--2026-07-30-uplift-병합)가 정본이다.
