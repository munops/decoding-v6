# Local delivery release-wave fence

상태: `no_active_wave` · 2026-09-03

이 문서는 Cloudflare, DNS, Analytics Engine, preview alias, desktop updater, package registry, browser-extension
store 또는 public channel mutation을 승인하지 않는다. 현재 저장소에는 재사용 가능한 active release wave가
없다. 과거 deployment evidence는 historical read-back이며 새로운 source의 deploy authority가 아니다.

새 Web delivery를 실행하려면 owner-lane에서 `docs/operations/release-wave-<id>.yaml`을 새로 만들고 다음을
동결해야 한다.

- `status: approved`, exact clean `sourceRevision`, account, existing Worker name, explicit `production` 또는
  `staging` destination, existing binding logical names, payer/cost/recurrence, public impact와 transmitted data
- no DNS/domain/route/resource/secret/schema/Analytics allowlist change라는 boundary, 또는 별도 wave로 분리한
  변경 계획
- fresh provider version/traffic/binding read-back, artifact SHA-256, real-origin smoke, immediate rollback version
  과 receipt directory

`scripts/local-delivery.mjs`는 environment variable로 지정한 wave가 위 exact source SHA와 `status: approved`를
함께 포함하지 않으면 provider 명령을 호출하지 않는다. local build, Git commit, `--execute`, historical
deployment ID는 approval을 대체하지 않는다.
