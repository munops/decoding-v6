# DC-GR-02 Korean discovery release evidence

Verified: 2026-09-01 04:20 (Asia/Seoul)

## Release identity

- Runtime source: `3c3efe68a662925ec0c65a4fdf7ba195e9783f75`
- Cloudflare Worker: `decoding-v6`
- Active version: `f8f2b4a8-bb52-4e9e-8613-ffd86e8e5094` at 100% traffic
- Static artifact digest: `09b4726884b768839f0d7d8a00be0d5824c8b39f880c8349fb20934a31049d57`
- Immediate rollback version: `56d01667-30fa-4a78-837d-2b0b9ea9365d`

## User and search journey

- A `ko-KR` browser sees Korean suggestion copy and a `/ko/` action before the English main content.
- Production browser checks at 320px with 200% root text and at 390px found no suggestion/main overlap and no horizontal overflow.
- `/ko/` and `/ko/json-format/` return 200 with self-canonical URLs, a Korean alternate, and no `noindex`.
- `/ja/` remains `noindex`; the sitemap contains 60 Korean URLs and no Japanese URLs.
- Root responses include HSTS. `/healthz` returns the exact runtime source revision.

## Monetization preparation

- The existing AdSense account now contains `decod.ing` as a product-scoped site.
- `https://decod.ing/ads.txt` returns 200 and exactly matches the provider-issued ownership record; AdSense read-back reports that the site is verified.
- The final AdSense policy review request remains unsubmitted. No AdSense page script or ad unit is active, so this release does not add ad requests, tracking, or consent-state changes.

## Search Console boundary

- A `decod.ing` domain property is prepared but remains unverified.
- Verification requires either granting Google access to Cloudflare DNS or creating a new DNS-write credential/manual record path. Both are authorization or long-lived credential boundaries and were not performed without exact owner approval.
- Sitemap submission and index read-back therefore remain `wait_external`; deployability and sitemap availability are verified separately from indexing.

## Verification

- Changed-file Prettier check, lint, full typecheck, 40 unit tests, benchmark, content/link/network/parity/extension/i18n/sponsor checks, 486-page build, and bundle budget passed.
- Workspace live-surface, strict trust-surface, and live trust-surface checks each completed with zero errors and zero warnings after deployment.
- The repository-wide `pnpm verify` formatter stage still reports nine unrelated pre-existing files; the changed-file formatting gate passed and all remaining verify stages passed.

