import type { EngineMessageCode } from '@decoding/engine'
export const englishEngineCopy = {
  'warning-cookie-credential':
    'This cookie may contain login credentials. Keep it out of chats, AI tools and other sites.',
  'warning-ua-self-reported':
    'This is what the browser reports. The string may be reduced or spoofed; it does not verify the actual device.',
  'diagnostic-pem-invalid': 'invalid private key; not interpreted',
  'diagnostic-pem-unknown': 'unknown private key',
  'diagnostic-pem-encrypted': 'encrypted private key; not interpreted',
  'diagnostic-worker-certificate': 'Certificate DER parsing failed',
  'diagnostic-worker-layer': 'This {format} layer could not be parsed.',
  'photo-read': 'Read the code from this photo without opening its destination.',
  'warning-url': '{rule}',
  'rejection-below-auto-threshold': 'Evidence is below the automatic confidence threshold.',
  'rejection-lower-ranked': 'A stronger candidate was selected.',
  'rejection-insufficient-margin': 'Candidates are too close to choose automatically.',
  'warning-jwt-signature-unverified':
    'The signature is decoded but not verified without a trusted key.',
  'warning-jwt-alg-none': 'This token is unsigned. Never accept it as authenticated.',
  'warning-jwt-no-exp': 'This token has no numeric expiry claim.',
  'warning-jwt-long-lifetime': 'The declared token lifetime exceeds 24 hours.',
  'warning-jwt-remote-key-header':
    'Remote key URLs are present. Never trust or request them automatically.',
  'warning-jwt-symmetric-alg':
    'A symmetric HMAC algorithm requires a shared secret. Do not use a public key as that secret.',
  'warning-jwt-expired': 'The exp claim is in the past.',
  'warning-jwt-not-active': 'The nbf claim is in the future.',
  'summary-jwt': '{algorithm} token with {claimCount} payload claims',
  'evidence-three-segments': 'Three Base64URL segments',
  'evidence-json-header': 'Header and payload are valid JSON objects',
  'evidence-alg': 'Algorithm header: {algorithm}',
  'summary-json': '{kind} with {entryCount} top-level entries',
  'summary-json-2': 'A JSON-escaped string',
  'evidence-json-parse': 'Valid JSON grammar',
  'summary-base64': '{bytes} decoded bytes, mostly text',
  'summary-base64-2': '{bytes} decoded bytes',
  'evidence-alphabet': 'Uses a Base64-compatible alphabet',
  'evidence-decode': 'Decodes without invalid bytes',
  'evidence-printable': '{printablePercent}% printable output',
  'summary-hex': '{bytes} bytes',
  'evidence-hex-alphabet': 'Even-length hexadecimal input',
  'summary-url': '{protocol}//{host}',
  'summary-url-2': 'Key/value query data',
  'summary-url-3': 'Percent-encoded text',
  'evidence-url-syntax': 'Valid URL or percent/query syntax',
  'summary-epoch': '{milliseconds}',
  'evidence-integer-width': 'Digit width matches {unit}',
  'evidence-date-range': 'Date is in a common operational range',
  'evidence-date-range-2': 'Date is outside the common range',
  'summary-uuid-ulid': 'RFC 4122 variant, version {version}',
  'evidence-uuid-layout': 'Canonical UUID layout and variant',
  'summary-uuid-ulid-2': 'Sortable identifier from {milliseconds}',
  'evidence-ulid-layout': '26-character Crockford Base32 ULID',
  'summary-compression': 'Expansion blocked at {expandedBytes} bytes ({ratio}:1)',
  'evidence-magic': '{format} signature',
  'warning-compression-limit': 'Expanded output exceeds the safe limit.',
  'summary-compression-2': '{compressedBytes} → {expandedBytes} bytes',
  'evidence-magic-2': '{format} signature and valid stream',
  'summary-compression-3': 'Expansion stopped at the safety limit.',
  'diagnostic-auth-header-error': 'Header value is empty',
  'diagnostic-auth-header-error-2': 'Invalid Base64',
  'warning-basic-credential':
    'Basic credentials are reversible. Password hidden; rotate exposed credentials.',
  'diagnostic-base-n-error': 'Invalid padding position',
  'warning-base32-padding': 'Invalid Base32 padding position.',
  'diagnostic-base-n-error-2': 'Invalid Ascii85 block',
  'diagnostic-cbor-note': 'This surface recognizes CBOR but does not have a local parser.',
  'diagnostic-cbor-note-2': 'Open the web parser for the full tree.',
  'summary-format-label': '{label}',
  'evidence-common': 'Matched {label} grammar and structure',
  'diagnostic-common-error': 'Local parser is not cached. Connect, then choose Try again.',
  'warning-local-parser-unavailable':
    'Open this local parser once online, then retry. Earlier layers and raw bytes are kept.',
  'diagnostic-cron-error': 'Expected 5 or 6 cron fields.',
  'warning-cron-range': 'Fewer than five runs found in the next six years.',
  'diagnostic-cron-error-2': 'Invalid 5- or 6-field cron expression',
  'diagnostic-data-uri-error': 'Input size limit',
  'warning-input-limit': 'The data URI exceeds the local input limit.',
  'diagnostic-data-uri-error-2': 'Invalid data URI encoding',
  'diagnostic-datetime-error': 'This date does not exist',
  'warning-date-invalid': 'This calendar date does not exist.',
  'warning-dns-weak-policy': 'This DNS policy permits all senders or monitors without enforcement.',
  'warning-entity-unknown': 'Unknown entities were kept unchanged.',
  'warning-unicode-surrogate': 'Unpaired surrogate in the decoded string.',
  'warning-text-lost':
    'Characters were replaced and cannot be reconstructed. Ask the sender for the original.',
  'warning-text-maybe-lost':
    'These question marks may stand for lost characters. Original punctuation is also possible.',
  'diagnostic-hash-id-basis': 'Length only; this may simply be hexadecimal data.',
  'diagnostic-hash-id-note': 'Hashes cannot be decoded back to the original value.',
  'warning-http-no-hsts':
    'No HSTS header is present. Applicability depends on the response origin.',
  'warning-mail-reply-to': 'MAIL-REPLY-TO',
  'warning-mail-display-address': 'MAIL-DISPLAY-ADDRESS',
  'warning-json-more-nodes': 'More fields exist beyond the 64-node scan limit.',
  'diagnostic-jwe-note': 'The body is encrypted. It cannot be read without the key.',
  'warning-k8s-secret-plaintext':
    'Base64 is encoding, not encryption. Expand values only in a trusted environment.',
  'warning-kv': 'Set-Cookie is missing {flag}.',
  'warning-photo-location': 'PHOTO-LOCATION',
  'diagnostic-manual-error':
    'Cannot decode this layer as {format}. Check the format, or open its local parser online once and retry.',
  'warning-manual-decode-failed':
    'This layer cannot be decoded as {format}. Undo to restore automatic detection.',
  'diagnostic-manual-error-2': 'Cannot decode this layer as {format}.',
  'warning-mime-charset-unsupported':
    'Unsupported charset: original words and decoded raw byte values are retained. Choose a charset in the string inspector.',
  'diagnostic-msgpack-note':
    'This surface recognizes MessagePack structure but cannot open the full tree. Use the web decoder.',
  'diagnostic-pem-note': 'Private key contents are hidden. Consider rotating this key.',
  'warning-private-key-exposed':
    'You pasted a private key. Contents are never displayed. Consider replacing it.',
  'diagnostic-pem-error': 'Invalid Base64',
  'diagnostic-pem-error-2': 'Certificate/key DER parsing failed',
  'warning-pem-der-invalid': 'PEM armor is present but the DER content is invalid.',
  'diagnostic-pgp-armor-note': 'Private key contents hidden; consider rotating this key.',
  'warning-private-key-exposed-2': 'A PGP private key was pasted. Contents hidden.',
  'diagnostic-pgp-armor-error': 'Invalid armor Base64',
  'diagnostic-pgp-armor-note-2':
    'If this message is encrypted, its body cannot be read without the key.',
  'warning-pgp-checksum': 'This block was truncated or changed: CRC24 does not match.',
  'diagnostic-protobuf-note': 'No schema. Field names and semantic types are unknown.',
  'warning-idn-confusable':
    'This domain uses Greek/Cyrillic characters that can resemble Latin letters. Inspect every label.',
  'diagnostic-punycode-error': 'Undecodable Punycode label',
  'diagnostic-saml-error': 'Expansion limit',
  'warning-compression-limit-2': 'SAML decompression exceeded the output limit.',
  'diagnostic-saml-error-2': 'Expansion stopped',
  'warning-compression-limit-3': 'Compressed candidate exceeded the expansion limit.',
  'diagnostic-saml-error-3': 'Malformed XML',
  'warning-xml-malformed': 'The SAML XML is incomplete; raw XML is retained.',
  'warning-saml-expired': 'SAML assertion has expired.',
  'warning-saml-signature-unverified': 'Signature presence is not signature verification.',
  'warning-secret-exposed':
    '{prefix}… matches a public credential prefix. Revoke/rotate exposed credentials. No match does not prove safety.',
  'diagnostic-ssh-key-error': 'Truncated or malformed public key',
  'warning-ssh-truncated': 'This public key is truncated or has an invalid structure.',
  'diagnostic-time-ids-note': 'Could also be plain hex.',
  'diagnostic-toml-note':
    'TOML table and key syntax. Open the web parser once online for the full tree.',
  'diagnostic-toml-error': 'Invalid TOML',
  'warning-toml-invalid': 'The TOML parser could not read this document.',
  'warning-xml-malformed-2':
    'Mismatched or unclosed XML element at line {line}, column {column} (offset {offset}). Untrusted XML is never executed.',
  'diagnostic-yaml-note':
    'YAML structure recognized; parsing runs locally when the parser is available.',
  'diagnostic-zstd-note': 'This surface cannot decompress zstd. Use the web decoder.',
  'warning-codec-unavailable': 'This local parser is unavailable. Open the web parser once online.',
  'diagnostic-zstd-error': 'Expansion stopped: output limit or invalid stream.',
  'warning-compression-limit-4': 'Cannot safely expand this zstd stream. Earlier layers are kept.',
  'warning-cert-expired': 'This certificate has expired.',
  'warning-decoder-worker':
    'Invalid {format} syntax. Check the indicated position; earlier layers are kept.',
} satisfies Record<EngineMessageCode, string>
export const legacyParamFormats: Record<string, Record<string, string>> = {
  'summary-jwt': {
    algorithm: 'raw-algorithm',
  },
  'evidence-alg': {
    algorithm: 'raw-algorithm',
  },
  'summary-epoch': {
    milliseconds: 'iso',
  },
  'summary-uuid-ulid-2': {
    milliseconds: 'iso',
  },
  'summary-compression': {
    ratio: 'fixed-one',
  },
  'evidence-common': {
    label: 'label',
  },
}
