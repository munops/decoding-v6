# Complete-services decisions

- 2026-10-19: 묶음1 입력은 임시 textarea 교체 대신 동일 컴포넌트 SSR+client:load로 먼저 렌더하고 하이드레이션 전 DOM 값을 메모리에서 이어받는다. 기능·M=131 유지.
- 2026-10-19: 묶음2 이름만 있는 이벤트 5개 추가, 식별자 없음. CNIL 공식 https://www.cnil.fr/fr/cookies-solutions-pour-les-outils-de-mesure-daudience 재확인: 단일 사이트 집계 전용·결합 금지·13개월 비연장 날짜·즉시 opt-out 적용; 규제기관 인증이나 면제 확정으로 표현하지 않음.
