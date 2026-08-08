# decod.ing 문의·지원 계약

상태: `implemented` — local route와 copy가 준비됐으며 production 공개·delivery canary는 별도입니다.

## 공개 경로

- canonical URL: `https://decod.ing/support/`
- 일반 bug/fixture: <https://github.com/whoo3474/decoding-v6/issues>
- 보안: GitHub Private Vulnerability Reporting와 `SECURITY.md`
- 비공개 일반 문의: `support@munops.com`

## 안전 경계

실제 token, credential, private key, production/customer payload, 개인식별정보를 issue나 email에 첨부하지 않는다. route/tool, browser/OS, 기대·관찰 동작, synthetic fixture만 받는다. 계정·결제·환불 queue는 현재 제품에 적용되지 않는다.

## 분류와 다음 증거

| 분류                | 경로                             | 내부 처리                                  | 현재 증거                                                         |
| ------------------- | -------------------------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| 기능 결함·오탐      | public issue + synthetic fixture | detector/operation fixture와 regression ID | route implemented, live release pending                           |
| 보안·payload egress | private advisory                 | threat model, rollback, privacy suite      | repository feature enabled; real report data pending              |
| 일반 비공개 문의    | support email                    | product/channel/build 식별 후 답변         | alias documented; inbound/outbound delivery canary `data_pending` |

지원 SLA는 유료 계약으로 제공하지 않는다. severity와 재현성에 따라 triage하며, incident 때 `docs/security/THREAT_MODEL.md`와 배포 rollback 계약을 따른다.
