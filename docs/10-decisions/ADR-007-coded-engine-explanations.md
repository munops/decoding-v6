# ADR-007: Engine facts and shared presentation

Owner-approved handoff A13 requires engine/worker results to contain names and numbers, with sentences owned by message catalogs. Native `Detection.summary`, evidence/warning messages and rejection messages now use typed message facts. The pure `@decoding/presentation` package renders English/Korean, with English fallback for the remaining locales.

Generated parser diagnostics are extracted with nominal markers, preserving arbitrary user JSON fields with the same names. Exported redacted structures omit input-derived explanation parameters. CLI `--json` and `--ndjson` retain their v6 data contract through an explicit legacy formatter and a frozen synthetic compatibility corpus. Web/extension/native consumers use the coded contract. Native engine consumers must adopt `MessageFact`; this does not imply publication of a new engine package.
