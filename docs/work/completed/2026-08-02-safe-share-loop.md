# DC-GR-01 — local-only safe share loop

상태: `completed`

기준: `main@a4eb4835feb4d7ab0636862d7bd02da7d409ca26`

확인일: 2026-08-02 Asia/Seoul

## Intent

PRD-02의 안전한 공유 루프를 실제 결과 작업면에 연결한다. 사용자는 Slack, PR, issue, 문서에 판별 근거를 남길 수 있어야 하지만, 원문·디코딩 값·부분 문자열·digest는 어떤 공유 결과에도 포함되지 않아야 한다.

## In scope / Out of scope

- In: 선택된 결과에서 포맷명, 체인 단계/형식, warning rule ID만 수집한 local Markdown copy와 local SVG share card download; 모든 workbench locale의 명시적 UI copy; privacy/browser fixture.
- Out: payload share URL, 서버/analytics/event, account, social API, clipboard 자동 읽기/쓰기, 공유 이미지 외부 upload, 새 detector 또는 도구, production deploy.
- 시작 시 존재한 `docs/prd/README.md` 변경은 사용자 소유이므로 편집·포맷·스테이징하지 않는다.

## Impact map

```text
PRD-02 §6 safe sharing loop
  → DecoderWorkbench safe-share projection and explicit actions
  → typed locale message catalog
  → result action anatomy and responsive style
  → product/privacy browser assertions
  → CHECKLIST and completed work evidence
```

## Acceptance checks

- Markdown과 SVG는 detector label, chain shape, warning rule ID, product footer만 포함한다.
- raw input, decoded value, scalar/field fragment, digest, exact input size, filename은 summary와 SVG 모두에 없다.
- clipboard write와 file download는 명시적 click 뒤에만 발생하며 network/storage/event를 만들지 않는다.
- i18n parity, focused product/privacy tests, build and affected broad validation이 통과한다.

## Privacy · performance impact

- 새 network destination, storage key, worker message field, dependency, initial chunk는 추가하지 않는다.
- SVG는 on-demand `Blob`으로만 생성하고 download 뒤 object URL을 해제한다.

## Evidence

- `pnpm verify` 통과: format, lint, workspace typecheck, unit 23/23, 1 MiB benchmark, content/link/network/parity/extension/i18n/sponsor gate, 10-package build, bundle budget. 초기 JavaScript는 21.6 KiB gzip, heavy local chunk 9개를 유지했다.
- `PLAYWRIGHT_PORT=45322 pnpm exec playwright test tests/privacy/payload-egress.spec.ts --project=chromium --workers=1` 통과: 3/3. synthetic canary가 safe summary·browser storage·network에 없고 SVG card download가 explicit click에서만 발생함을 확인했다.
- `playwright.config.ts`는 `PLAYWRIGHT_PORT`를 받아 병렬 workspace에서도 다른 4321 server를 오인하지 않는다. network origin assertion도 실행 origin을 기준으로 유지한다.

## Result / follow-up

- 완료: 결과 inspector에 safe summary copy와 local SVG share card download를 추가했다. 공유 결과는 public detector label, 실제 실행된 chain shape, deterministic warning rule ID, local footer만 포함한다. alternate candidate는 실행하지 않은 child chain을 공유하지 않는다.
- 보류: release, public share/posting, telemetry, account/social API, payload URL은 이 작업에 포함하지 않았으며 production deploy에는 별도 승인이 필요하다.
