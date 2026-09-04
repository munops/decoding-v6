# Local preview boundary

상태: `active` · 2026-09-03 · GitHub Actions preview 없음.

Pull request, push, tag는 Cloudflare immutable version, preview alias, GitHub comment, GitHub secret 또는 artifact를
자동으로 만들지 않는다. historical GitHub preview run은 과거 evidence일 뿐 current delivery authority가 아니다.

로컬 변경 확인은 provider mutation 없이 static build와 local preview로 끝낸다.

```sh
pnpm --filter @decoding/web build
pnpm --filter @decoding/web preview
```

공유 가능한 staging URL이 정말 필요할 때에도 `wrangler versions upload`, preview alias, production/staging upload는
자동화하지 않는다. `docs/operations/local-delivery-runbook.md`의 exact owner-lane release wave, clean SHA,
provider read-back, receipt 절차를 따르는 별도 local delivery action이다.
