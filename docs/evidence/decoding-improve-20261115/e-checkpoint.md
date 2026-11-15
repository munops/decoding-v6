# E — format-by-format implementation receipts

Request `DECODING-IMPROVE-20261115-OWNER-01`, `DEC-NEXT-007`. Each entry is a separate format commit after the full unit suite, public fixture gate, focused type/lint and registry/i18n parity. Production/runtime and final bundle checks remain release-stage requirements. References are linked from each format's actual explanation page source; counts come from the registry rather than hand-maintained constants.

| Format       | Behavior and limits                                                                                                                                                                                                                         | Local evidence                                                                                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| binary-bytes | Eight binary digits per byte, optional `0b`, whitespace groups or a continuous sequence. Explicit groups/prefixes have strong grammar; continuous numbers remain provisional. Readable UTF-8 recurses; controls/invalid UTF-8 remain bytes. | 20 positive, 10 edge, 20 negative public cases; JSON recursion and unrelated-language regressions. Full suite 190 pass, type/lint/parity/i18n pass; 46 formats/49 tools.                                                             |
| octal-bytes  | Three digits per byte, 000–377; optional `0o`/`0O`, grouped or continuous. Single bare three-digit permissions are excluded; continuous numbers remain provisional. Uppercase binary prefix is also accepted by the shared reader.          | 20 positive/10 edge/20 negative cases, UTF-8 and bounds/cross-format regressions. Full suite 191 pass; focused type/lint/parity/i18n pass. 47 formats/49 tools.                                                                      |
| user-agent   | Reads declared browser/release/OS/device; Edge/Opera/iOS browser tokens precede Chrome/Safari engine tokens. An info warning explains reduced/spoofed UA information and links to a dedicated EN/KO rule page.                              | 20 positive/10 edge/20 negative cases; Safari release and Edge precedence checks, plus cross-consumer UA/JWT sentence regression. Full suite 193 pass; type/lint/parity/i18n pass. 48 formats/49 tools.                              |
| color        | In-range hex/RGB/HSL, alpha, percentages and hue angle units; 8-bit rounded equivalents and a bounded computed-hex swatch. Unsupported CSS forms are explicitly documented.                                                                 | 20 positive/10 edge/20 negative public cases; conversion/injection regressions. Full suite 194 pass with one worker; focused type/lint/parity/i18n pass. 49 formats/49 tools. Browser acceptance remains pending as described below. |

## Color browser follow-up and shared-host contention

The first full run had four timeout failures in pre-existing CLI/tool/public-fixture tests while host load exceeded 65; no threshold was raised. The serial retry passed all 194 tests. Type checking found a missing Korean `colorPreview` catalog entry; it was fixed and type/lint passed.

The actual browser batch did not pass. The decoder remained `data-hydrated=false`, and the trace recorded a 403 for Astro's development-toolbar runtime inside pnpm's store; the telemetry development-route 404s were separate. A restart of only this session's 4323 development server did not resolve this. Another attempt timed out before completing page startup. System load was observed above 112 during this interval. These observations do not prove that load or the toolbar alone caused the hydration failure. Repeated development-server browser attempts are stopped; use the required immutable static build for final browser acceptance, and investigate any remaining failure there. No production/UI pass is inferred from unit tests. The decoder already preserves pre-hydration textarea input; an explicit hydration signal now makes the test gate observable.

The unused, session-owned 4322 preview server was stopped after exact process/path/port recheck; other sessions and processes were preserved.

## Request cookies (existing kv format)

The existing cookie/query detector is retained rather than duplicated. Request cookies have a plain EN/KO sentence and a field count. Empty/malformed pairs and control bytes are rejected; header whitespace tabs are accepted. SID/SSID/connect.sid/auth and CSRF names join the shared credential-field owner, reused by cookie parsing, structured masking and URL-query masking. A `COOKIE-CREDENTIAL` warning says a login value _may_ be present and advises against pasting it into chats, AI tools or other sites; dedicated EN/KO rule pages explain the limit.

The existing 20-positive/10-edge/20-negative kv corpus is preserved. New regressions cover request-cookie masking/counts, harmless names, malformed headers, tabs/controls and repeated URL credential fields. The CLI JSON schema and pre-existing fields remain exact; the frozen corpus is unchanged, with one explicitly pinned E1 safety-warning addition for its existing cookie case.

Validation: full suite 244 pass, then 82 focused tests pass after an equivalent ASCII-control scan and a new tab/control regression; type/lint/parity/i18n pass. The public precision/recall check now registers one case per format rather than timing all 49 under a single shared five-second case. It runs the same corpus with the same 0.95 precision/0.90 recall thresholds. The larger test count does not represent added coverage for that refactor. Format count stays 49; tools stay 49. Static-build browser verification remains open as recorded above.

## Bitcoin-family address format

Base58 address inspection shares the pre-existing double-SHA256/version helper with the generic Base58 detector. Bech32/Bech32m checks bind witness version to the correct checksum constant, enforce 2–40-byte programs (20/32 bytes for v0), reject mixed case and invalid padding, and retain uppercase-input support. The UI calls this an address _format_ and explicitly does not claim ownership, funds or a live-network check; related networks may reuse legacy forms.

Public corpus: 20 independent synthetic Base58Check positives (Python hashlib), 10 official witness edge vectors across v0/v1/future versions, and 20 negatives including the BIP350 invalid witness vectors plus cross-format/mistyped inputs. Dedicated EN/KO explanation and warning pages are registry-backed. Full suite 247 pass; type/lint/parity/i18n pass. Counts: 50 formats, 49 tools. The old CLI JSON corpus still passes without another compatibility exception. Browser acceptance remains part of the pending immutable-build verification.

## Ethereum / EVM address format

The bounded 40-ASCII-hex Keccak routine implements the ERC-55 suffix (original Keccak, not NIST SHA3). All 8 official ERC-55 vectors match; 28 inputs also match the independently existing hash-wasm implementation. Uniform-case legacy addresses are accepted with an explicit no-supplied-checksum notice; incorrect mixed-case checksums are rejected. Only a verified mixed-case candidate subsumes the generic hex/hash interpretation. The EN/KO sentence and facts explain that other EVM networks share the same address form, so the actual network, owner and funds remain unverified.

Public corpus: 20 positive/10 edge/20 negative cases, including official checksums, legacy forms, zero address, malformed lengths, bad mixed case and cross-format inputs. Full suite executed 249 tests: 248 passed and one existing reproduction-process integration test timed out at its inherited 5-second default. That test starts two isolated Node processes without child deadlines; it now bounds each child to 15 seconds and the integration case to 35 seconds, and its focused rerun passed (3.44 seconds). The 1 MiB/100 ms engine and 170 KiB initial-JS budgets are unchanged. Type/lint/parity/i18n pass; 51 formats/49 tools. The full final verification and immutable-build browser gates remain open.

## Base45 and HC1 transport

RFC 9285 alphabet/length/group-overflow checks preserve significant spaces, including the official-style leading-space case. Automatic recognition is conservative for unqualified words/numbers and unknown binary data; the manual Base45 choice still decodes all valid byte groups within the 1 MiB limit. A terminal copied line ending is tolerated. HC1 input unwraps Base45 and follows existing zlib/CBOR stages locally, with an explicit notice that issuer/signature/schema/current certificate acceptability were not checked.

Public corpus: 20 positive/10 edge/20 negative cases, including RFC vectors, leading spaces, Unicode, bad groups, numeric/word ambiguity and cross-format inputs. Extra regressions preserve invalid UTF-8 bytes across binary/octal/Base45; the existing fatal UTF-8 readability helper already handled them correctly and did not need changing. The HC1 test uses an independently Node-zlib-compressed synthetic CBOR map, not a signed or valid health certificate.

Full suite: 252 of 253 passed, with one new test initially importing a package outside the web package's dependency scope. The fixture was changed to Node's existing zlib, then all 6 codec tests passed. Type/lint/parity/i18n pass. Counts: 52 formats/49 tools. E1 local implementation is complete; the pending immutable-build/browser/release gates and E2–E4 remain open.

## curl commands

The detector and existing 14-language code conversion tool now share a bounded, literal HTTP(S) request reader. Supported request/method/header/inline-data flags, empty quoted data and line continuation are parsed without executing a shell, evaluating variables, opening files or requesting URLs. Unsupported argument kinds and literal shell expressions are disclosed; file-backed bodies cannot silently become generated inline bodies. The answer card links directly to the existing tool through its transient local handoff. This is a request subset, not a complete shell or curl emulator.

Public corpus: 20 positive/10 edge/20 negative cases. Full suite 256 pass, including curl-to-code JavaScript executed only against a synthetic stub (no network), Python quoting, PHP/Ruby single-quote escaping, Kotlin/Dart dollar escaping and shell-quoted HTTPie arguments. No claim that all generated language snippets were compiled. EN/KO sentences, facts and warning/explanation pages accompany the format. Counts: 53 formats/49 tools. Final immutable-build/browser and release verification remain open.

## CIDR ranges

IPv4/IPv6 prefix notation uses the existing IPv4 reader and an extracted shared IPv6 normalizer. Exact BigInt arithmetic computes inclusive first/last addresses and total addresses, with host-bit normalization explicit in the value. Counts include reserved endpoints and do not promise usable hosts. Ambiguous IPv4 leading-zero notation, zones, invalid prefixes and malformed addresses are rejected.

20 positive/10 edge/20 negative public cases; focused exact /0 and host-bit regressions; full suite 258 pass. Type/lint/parity/i18n pass. 54 formats/49 tools. Browser/release evidence remains pending.

Independent curl review found an unsupported-option argument could overwrite the destination, invalid header names could pass, and a JavaScript `__proto__` header could disappear in an object literal. The reader now consumes explicitly known option arguments, rejects unknown syntax and multiple destinations, validates header tokens, and generates JS/Node headers through safe JSON parsing. Regression tests cover these exact cases; option incompleteness is still disclosed.

Review-fix validation: full run 257/259 passed; strict unknown-argument handling exposed an empty token previously emitted for backslash-newline. Line continuation now emits no token, and the two affected suites passed all 69 focused cases. Relevant package type checks, lint and registry/i18n parity passed. No broad rerun is inferred from the focused retry.

## MAC addresses

Separated 48-bit notation accepts consistent colon, hyphen or dotted groups and reports group/local bits and broadcast form. Compact twelve-digit hex remains ambiguous and is not automatically called a device address. No vendor/device/ownership lookup is made. RFC 9542 documentation blocks supply the synthetic corpus. 20 positive/10 edge/20 negative cases plus bit/mixed-delimiter regressions; full suite 261 pass. Relevant package type/lint/parity/i18n pass. 55 formats/49 tools; runtime release gates remain open.

## Java serialization

AC ED 00 05 is recognized in bytes or Base64. Standalone strings decode with bounded modified UTF-8 (including Java NUL and supplementary UTF-16 pairs), not ordinary UTF-8. Other token-bearing streams show only header metadata and an explicit no-full-validation/no-deserialization notice. No Java class, readObject or readExternal is invoked; metadata recognition is not a safety verdict. 20 positive/10 edge/20 negative public fixtures, MUTF-8 regressions and full suite 263 pass. Relevant package type/lint/parity/i18n pass. 56 formats/49 tools.

## ASN.1 DER structures

PEM private-key metadata and the new byte/Base64 inspector share the extracted pre-existing DER tree reader. A bounded structural subset checks definite minimal lengths, low-number tags, common primitive constraints and nested boundaries, with depth 12, 128 children per container and 2048 nodes. Tag/length trees omit all primitive content, including possible private keys. The sentence, rule page and explanation explicitly distinguish this from complete schema, canonical-SET, certificate and signature validation.

20 positive/10 edge/20 negative cases plus key-content-hiding and nonminimal-length regressions. Full suite 263/265 passed initially; two new examples exposed a four-byte minimum and the pre-existing conservative binary-Base64 auto threshold. Four-byte nonempty containers are supported, and the DER detector now directly recognizes structurally checked Base64 rather than relaxing the global threshold. All 95 affected suite cases then passed. Relevant package type/lint/parity/i18n pass. 57 formats/49 tools.

Independent DER review found the detector-only hiding check omitted ancestor byte views in the result inspector and layer previews. The existing private-content guard now also treats schema-less DER as protected, selects its structural result for copying, suppresses raw byte/hex and layer-source previews, and saves only the protected structure. Complete decode plus actual component-output regressions (raw bytes and Base64) passed in 24 focused workflow/safety/answer tests. A real 390/1440px file-upload/clipboard/browser regression is added for the final immutable-build run; it has not yet been run. Original input remains user-owned and visible in the input field.

## Windows FILETIME

Unsigned decimal/hex counters use exact BigInt tick arithmetic (100 ns from 1601 UTC), including pre-Unix-epoch millisecond flooring and separately retained sub-millisecond ticks. An explicit FILETIME: prefix supports 1601–9999; bare plausible modern counters remain low-confidence alternatives rather than confirmed times. Sentinel/overflow/invalid syntax is rejected; raw little-endian byte dumps are not inferred. 20 positive/10 edge/20 negative cases plus exact epoch/remainder regressions; full suite 268 pass. Relevant package type/lint/parity/i18n pass. 58 formats/49 tools.

## Snowflake (existing identifier detector)

The existing uuid-ulid Snowflake branch is extended rather than duplicated: uint64 bounds, exact worker/process/increment fields, an explicit Discord: epoch choice, a plain EN/KO sentence and labeled UTC/assumed-epoch facts. Bare 17–20-digit counters retain the prior 0.6 confidence and do not prove origin. The remaining English epoch explanation moved into the presentation message catalog; the legacy JSON adapter restores its prior English wording. UUID/ULID explanation pages now include this supported subtype and the official Discord reference.

An independent subtype corpus contains 20 positive/10 edge/20 negative cases, separately named so the existing UUID public fixture contract remains unchanged. The full run had 268/269 pass with one corpus-count failure from initially mixing the subtype into that exact-count set. After separating it, all 79 affected public/expanded cases passed. Relevant type/lint/parity/i18n pass. Count stays 58 formats/49 tools.

## JSON Lines

Two or more JSON values are read per LF/CRLF line, with an optional terminal newline. Blank lines, BOM, malformed records and bounded-size/count excess are rejected (256 KiB, 4096 records). Shared credential masking applies to records; numeric display uses existing JavaScript JSON semantics with an explicit precision/range warning for unsafe integers/nonfinite numbers. Original text remains the exact numeric source. 20 positive/10 edge/20 negative public cases plus credential/precision regressions; full suite 272 pass. Relevant type/lint/parity/i18n pass. 59 formats/49 tools.

## SQL statements

A bounded lexical candidate recognizes common SQL command shapes, respecting quotes, comments, dollar strings and balanced parentheses. It never invokes a database and stays at 0.8 confidence; this is explicitly not full dialect/schema/syntax or safety validation. Literal contents are omitted from the detected metadata. Existing SQL formatting remains the transformation owner; nearby tools now use the detected SQL candidate including WITH queries. Limits: 256 KiB/64 statements/64 parenthesis levels.

20 positive/10 edge/20 negative cases and inert-literal regressions. An initial authored fixture quoting error was corrected before the complete retry; full suite 274 pass. Relevant type/lint/parity/i18n pass; targeted nearby-tool regression is additionally run. 60 formats/49 tools.

## Timestamped log lines

A bounded 64 KiB single-line reader separates a calendar-checked ISO-style timestamp, common severity level and message. Brackets/comma fractions/offsets are supported; original fractions remain intact and UTC display is millisecond precision. Missing time zones remain unspecified, never assumed UTC. Known secret-pattern redaction is reused; this does not promise universal secret detection or event authenticity. Multiline traces, every logging layout and leap seconds are outside the documented subset.

20 positive/10 edge/20 negative cases plus calendar/timezone regressions; full suite 277 pass. Relevant type/lint/parity/i18n pass. 61 formats/49 tools. An authoring command failed before modifying registration/fixtures; that unregistered run was not counted as log-format validation.

## Roman numeral candidates

The common canonical subtractive 1–3999 subset accepts ASCII and NFKC-compatible Unicode number forms. Unsupported historical/additive/overbar variants are documented. Bare letters retain 0.65 uncertainty because pronouns, names and words can overlap (I, V, X, MIX); Roman: explicitly selects the numeric interpretation. No automatic ROT13/classical-cipher inference is added. 20 positive/10 edge/20 negative cases, Unicode/canonical/ambiguity regressions; full suite 279 pass. Relevant type/lint/parity/i18n pass. 62 formats/49 tools. E2 local implementation is complete; browser/build/release and E3/E4 remain open.

## Morse code

International Morse letters/digits/common punctuation decode locally, including copied middle-dot/minus forms, written letter/word separators and the joined SOS signal. A standalone dot/dash needs an explicit Morse: prefix. Unknown groups/procedural signals are rejected; written-text notation is not audio/timing recognition. Limits: 64 KiB/8192 symbols. The result recurses through the normal chain without introducing a cipher guess.

20 positive/10 edge/20 negative cases, official character mappings and word/Unicode regressions; full suite 281 pass. Relevant type/lint/parity/i18n pass. 63 formats/49 tools. E3 inline Caesar choices and E4 still remain.
