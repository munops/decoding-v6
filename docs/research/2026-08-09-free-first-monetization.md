# decod.ing 무료-first·스폰서 수익화 근거 — 2026-08-09

## 결론

최종 사용자가 내는 가격은 0이다. 계정, 카드, trial, 구독, 유료 operation, restore/refund
엔타이틀먼트를 만들지 않는다. 모든 decoder·47개 utility·경고·copy/export·PWA/CLI/desktop/extension
기능을 무료로 유지한다. 트래픽·활성·성능·privacy 기준선이 충족된 뒤에도 자체 web 도구의
below-the-fold 정적 스폰서 한 자리만 별도 release 승인으로 검토한다.

## 직접 대안·유료 상한 대조

| 서비스 | 2026-08-09 공식 확인 | decod.ing 적용 |
|---|---|---|
| [CyberChef](https://cyberchef.org/) | 무료·Apache 2.0, 브라우저/standalone local 실행, 약 300 operations | 무료 local-only가 경쟁 하한이다. 핵심 기능 paywall 금지 |
| [DevToys](https://devtoys.app/) | 무료·오픈소스·크로스플랫폼, 기본 offline 도구 30개 | desktop/CLI 포함 무료 유지 근거 |
| [DevUtils](https://devutils.com/pricing/) | macOS perpetual Basic $29, Personal $39, Team $24/device, 1년 업데이트, 30일 환불 | 유료 native 상한 참고일 뿐 decod.ing 가격표가 아니다 |

무료 직접 대안이 강하므로 스폰서 수요나 매출이 부족하다는 이유로 디코딩 기능을 유료화하지
않는다. DevUtils의 가격은 polished native workflow의 지불 의향을 보여 주지만 현재 zero-account
결정을 바꿀 근거는 아니다.

## 스폰서 gross·fee·VAT·refund·net

[EthicalAds publisher 공식 안내](https://www.ethicalads.io/publishers/)는 50K+ monthly pageviews를
찾고 있고, EU/북미 비중이 높은 경우 약 $2.50/1,000 pageviews를 참고치로 공개한다. 동시에 첫 방문
above-the-fold 배치를 요구해 decod.ing의 first viewport 금지와 충돌하므로 provider 후보는 승인하지
않는다.

```text
consumer gross = USD 0
sponsor/ad gross = verified eligible pageviews / 1,000 × contracted CPM 또는 fixed invoice
net = collected gross - payment/FX fee - confirmed credit/refund - hosting/domain/tooling - tax/accounting
```

VAT·원천징수·invoice 분류, provider fee, 환율, credit/refund는 실제 계약과 입금 read-back 전
`data_pending`이다. 사용자 digital goods가 없고 Apps in Toss가 선택되지 않았으므로 IAP·앱마켓
수수료·사용자 환불은 적용하지 않는다. 첫 paid sponsor 가격은 실측 eligible impressions와 실제
제안서를 기준으로 승인하며, 가짜 정가·할인·CPM 보장은 표시하지 않는다.

## 구현·운영 경계

- `packages/workbench-ui/src/monetization.ts`: 영구 무료 권리, 금지 결과, surface 정책.
- `SponsorSlot.astro`: active campaign만으로는 부족하며 정확히
  `PUBLIC_SPONSOR_RELEASE_APPROVED=true`여야 후보를 선택한다.
- 현재 `sponsors.json=[]`, 승인 env 미설정, sponsor DOM·request 0.
- PWA standalone, workspace, CLI, desktop, extension, 첫 viewport는 승인 후에도 sponsor 금지.
- production flag, campaign, provider, 외부 게시, 계약·청구·정산은 별도 owner-lane release wave다.

## 로컬 검증

- Node 24.18 `pnpm verify`: lint·typecheck·27 tests·47 tools·네트워크 정책·8 locale·
  sponsor 0·extension/desktop/web 486 pages build·초기 JS 21.6 KiB gzip 통과.
- Chromium PWA: 래스터 자산·OG·서비스워커 갱신·stale cache 교체·offline 재진입·
  sponsor DOM 0을 별도 포트에서 3/3 통과.
- workspace strict와 product-operations strict는 각각 error 0, warning 0이며 `git diff --check` 통과.
- 이는 `implemented`·`test_passed`·`built` 근거다. 배포·discoverable·sponsor 승인·계약·정산·
  사용자 가치·수익성은 증명하지 않는다.
