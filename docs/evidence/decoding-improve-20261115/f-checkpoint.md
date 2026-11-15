# F — 도구 흐름과 오프라인

Local implemented/tested; not deployed.

- Pure non-generator operations update after150ms of input/option changes. Heavy parser/generator/regex and >64KiB inputs retain an explicit run button. Results use generation guards, including local file preparation. Explicit paste only.
- Authored EN/KO task aliases cover49 tools; whitespace-insensitive search. Unknown-value link goes to decoder. All49 tools have authored purpose/use/examples (original47 completed in A).
- Results can continue in decoder or three same-category tools through the existing one-use60s local handoff. Locale retained, no input in URLs.
- Added selectable-charset garbled repair and classical alternatives:25 Caesar shifts, Atbash, A1Z26, user-keyed Vigenere. No automatic ROT13 declaration or key recovery.
- Five decoder codec imports and dependent WASM cached at worker install; tool runtimes/pages warmed at idle for the current locale. Content-derived worker cache version changes when cached HTML/chunks change, avoiding stale inventories. Essential codec graph stays under initial JS budget.

Validation: operation registry12/12 plus classical3/3; UI/web typecheck via build; network/i18n/parity/content passed. Browser pure/locale handoff, Korean aliases, classical key, immediate offline codecs4/4. Extra offline tests2/2: actual MessagePack/CBOR/TOML/Zstd outputs after installation; every current-language tool document and lazy asset present before going offline, two new tools execute offline. Bundle113.4KiB gzip, heavy tool chunks remain lazy. This is browser-local evidence, not actual phone installation or public deployment.

Harness-only failures corrected: exact label selection had included select option text; changed to semantic combobox lookup. A no-concerns state correctly has no warning container; assertion now checks the answer card. Neither represented a product failure. Earlier duplicate local build was stopped using only its owned process tree; final single build passed.
