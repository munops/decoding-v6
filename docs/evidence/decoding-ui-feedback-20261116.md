# DECODING-UI-FEEDBACK-20261116

오너의 `/ko/` 푸터 줄 배치·입력창 간격 피드백에 따른 제한된 수정이다. 시작 source는 `ae4350f82f6d261adaa7ba43a69404a6cbef64d6`, live runtime은 `5e3ba4d8d4e7cd55d444a48010cd9aff15428eeb`였다.

실제 공개 화면에서 입력 안내 행과 textarea 간격 0px를 재현했다. 푸터는 2열 grid의 별도 count 행과 note 행으로 흩어졌으며 390px에서 브랜드 이름이 숨겨졌다. 중앙 Layout/CSS에서 안내-입력 간격 12px, 브랜드/링크/meta 3영역, 모바일 브랜드 이름, token border를 적용한다. 44px 링크/설정 target·모든 링크·횟수 opt-out·privacy 문장은 유지한다. 폰트 binary/loader/CSP 변경은 없다.

## 성장·수익 판단

현재 구현·배포·합성 시험은 실제 자연 유입·완료·재방문·매출의 증거가 아니다. 기존 `observation-plan.json`의 J5는 2026-11-29 이후 관측이며 지금 결과를 추정하지 않는다. 이름별 집계에는 QA/crawler가 섞이고 고유 사용자나 cohort retention을 뜻하지 않는다.

제품의 무료·zero-account 계약상 구독/유료 API가 아닌 정적 스폰서가 우선 수익 경로다. [EthicalAds 공식 publisher 페이지](https://www.ethicalads.io/publishers/)를 2026-11-16 확인했다. 50K+ monthly PV와 개발자 audience를 찾으며 EU/북미가 주를 이룰 때 약 $2.50/1K PV를 참고로 제시한다. 이를 단순 적용하면 월 100K PV=$250, 1M PV=$2,500 **총수익 시나리오**이며 실제 광고 가능 PV/단가/fill/차단/비용/세금/운영 시간은 미확인이다. 해당 망의 desktop/mobile 첫 방문 above-fold 배치는 현 PRD의 below-fold 원칙과 충돌하므로 승인된 수익 공급자가 아니다. 가입·광고 활성화·영업 연락은 이번 범위가 아니다.

현재 결론: 쓰일 수 있는 구체적인 문제와 로컬 판별 차이는 있으나 성장·수익은 미검증이다. 필수 순서는 검색 입구별 실제 노출/클릭 → 합성 QA를 분리한 완료 수요 → 재방문 신호/고정 스폰서 제안이다. 기능 수 확대나 UI 수정만으로 성장·매출을 약속하지 않는다. 기존 Chrome/npm 및 승인된 이후 게시 경로를 완료한 뒤 J5에서 자연 유입과 완료를 판단한다. 유입이 적으면 유통/검색 입구, 유입 대비 완료가 낮으면 실패 사례·첫 결과, 완료 후 반복 수요가 없으면 포지셔닝을 먼저 고친다.

## 검증·전달

로컬 Astro check: 122 files, 0 errors/warnings/hints. 실제 브라우저에서 KO/EN 각각 320/390/1440px의 overflow=0, 입력 간격=12px, 모든 링크/설정 target≥44px, 링크 13개(브랜드 포함) 유지. 320px root 200% reflow overflow=0. 실제 Hello 합성 디코딩·횟수 toggle/복원·privacy 링크 이동 통과. KO 390px 푸터 약 474→385px, desktop 약 287→241px. 배포는 아직 준비 중이다. 폰트 수정 없음으로 planner의 global.css 파일 수준 font_delivery 감지는 이번 diff에 해당하지 않는다. 영향 selector의 실제 EN/KO·320/390/1440·320px 200% reflow와 target build를 확인한다. 전체 제품의 가치/수익이나 미출시 native 채널 완료를 주장하지 않는다.

`validate:changed`는 기존 validation manifest가 현재 package scripts/lockfile/Node 계약보다 오래되어 `MANIFEST_STALE`로 실행 전에 중단됐다. 이번 diff는 package/lockfile/Node/폰트를 바꾸지 않는다. 기존 오류를 통과로 표시하지 않고 직접 Astro check와 selector/browser 검증을 수행했다. 릴리스 entrypoint의 기존 필수 verify/E2E는 유지한다.
