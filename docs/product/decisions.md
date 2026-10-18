# Complete-services decisions

- 2026-10-19: 묶음1 입력은 임시 textarea 교체 대신 동일 컴포넌트 SSR+client:load로 먼저 렌더하고 하이드레이션 전 DOM 값을 메모리에서 이어받는다. 기능·M=131 유지.
- 2026-10-19: 묶음2 이름만 있는 이벤트 5개 추가, 식별자 없음. CNIL 공식 https://www.cnil.fr/fr/cookies-solutions-pour-les-outils-de-mesure-daudience 재확인: 단일 사이트 집계 전용·결합 금지·13개월 비연장 날짜·즉시 opt-out 적용; 규제기관 인증이나 면제 확정으로 표현하지 않음.

- 2026-10-19: coordinator msg_7e4a4f8b1828의 최종 frozen build 1회 지시에 따라 묶음1+2 중간 배포를 최종 guarded release로 합침. 따라서 판별 확대 전 라이브 기준선 비교는 미관측이며 구현·수신·자연사용으로 승격하지 않음.
- 2026-10-19: 디자인은 계획6의 층 띠·오프셋 거터·흰 바탕을 그대로 채택. 새 전략·심사 문서나 validator는 만들지 않고 결과 캡처에서 검증한다. IBM Plex Mono Latin WOFF2는 Google Fonts 공식 원본, OFL 동봉·자체호스팅·swap·시스템 한글 대체를 사용한다.

- 2026-10-19: 묶음5 웹 전용 지연 codec 고정: fzstd0.1.1 MIT, @msgpack/msgpack3.1.3 ISC, cbor-x1.6.6 MIT, smol-toml1.9.1 BSD-3-Clause, brotli-dec-wasm2.3.2 MIT/Apache-2.0. 공식 저장소 API·npm 메타데이터 확인; 엔진은 주입만 받고 codec 미탑재 표면은 인식/후보와 해석 불가를 구분한다.

- 2026-10-19: 묶음7 IndexedDB 이름·버전1·기존 record 필드는 보존하고 수정/병합을 가산했다. 기존 session TTL=현재시각으로 즉시 사라지는 결함은 탭 sessionStorage의 가린 기록으로 수정; 지속 기록은 구버전에서도 열리고 탭 기록은 원래 탭 수명·백업 대상으로만 둔다. 미관측 저장 용량은0대신null로 표시한다.

- 2026-10-19: C9 원문 이력은 사용처인 공유 DecoderWorkbench의 메모리 state 한 곳이 소유하므로 apps/web의 미사용 이중 모듈을 두지 않는다. 세션 10개·탭/페이지 이동 시 소멸·서버/스토리지 미전송 동작과 M은 유지한다. 패딩 없는 Base64→JSON의 낮은 확신은 실제 JSON 문법 근거를 추가해 고쳤고 평문 오탐 억제는 유지했다.
