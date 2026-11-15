# A13 — coded explanations and presentation owner

Request `DECODING-IMPROVE-20261115-OWNER-01`, `DEC-NEXT-001`. Baseline `497f91f`. One writer; renewed repo claim `claim_821a9ee1-1f6f-4fda-94be-0c7ab93d7f11`, fencing 72. Prior claim expired without competing edits; dirty fingerprint was rechecked before reacquisition.

Engine summaries, evidence, warnings, rejection reasons and generated diagnostic fields now carry typed codes and numeric/technical-name facts. `@decoding/presentation` owns English/Korean sentences; the other six locales use English. Web, extension, CLI and operation inspection consume the shared owner. Worker terminal failures carry an error code. Cron retains the engine's structured schedule rather than appending an English-only description.

Generated error/note fields use a nominal internal marker. Extraction recognizes the marker, not a field name or a user-forgeable JSON shape. Original user JSON `error` and `note` fields remain data. Raw technical-name parameters remain input-derived and are omitted from redacted projections. The CLI JSON/NDJSON compatibility boundary restores legacy explanation strings and diagnostic value fields; native engine records intentionally use the new internal API.

Validation:

- Frozen pre-migration CLI-shaped JSON: 52 synthetic cases match all candidate, value, metadata, evidence and warning data, with elapsed time alone normalized. Source and inputs are in `a13/legacy-json-baseline.json`; never regenerate it from the migrated engine.
- Full unit suite: 24 files, 186 tests pass. Dedicated presentation/translation follow-up: 57 tests pass.
- Typecheck passed after the migration; final worker/desktop cleanup also passed (99 Astro files, no errors/warnings/hints).
- Source i18n guard passes for 8 locales and rejects literal engine summary/message producers structurally.
- Actual Chromium source flow: Korean recovery and mail facts pass at 390×780 and 1440×900 (2 tests).
- 1 MiB benchmark: first candidate p75 71.3 ms, full result p75 96.9 ms; limits unchanged.
- CLI bundled build and extension build pass; bundled Korean Base64 command returns the shared sentence and `Hello`.

Independent read-only review found and reproduced two omissions: missing/null JWT algorithms lost the legacy unknown fallback, and question-mark placeholders inherited a definite-loss warning. Both were corrected; the follow-up compatibility/garbled suite passed 62 tests, including new missing/null and uncertainty regressions.

These are local implementation/test/build observations. Production deployment, store publication, physical-phone and real screen-reader checks remain separate. A14 and the overall handoff are not closed here.
