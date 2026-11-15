# Local-only product, fixed-name counts

The existing Worker serves static web assets and `/healthz`. Its `/e` and `/e/events` collector accepts only the fixed names allowed in `src/index.ts` and `apps/web/src/lib/telemetry.ts#COUNT_NAMES`.

No input, decoded result, filename, content hash or identifier is accepted. Counting can be disabled in the footer. Authentication, accounts, payments, server decoding, AI, advertising and databases are absent.

Format/tool/page counts: `pnpm inventory` from the repository root after build. Deployment and immutable source/provider read-back follow `docs/operations/local-delivery-runbook.md`.
