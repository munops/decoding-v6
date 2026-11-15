export type RuleSpec = { id: string; title: string; why: string; fix: string; reference: string }
const jwt = 'https://www.rfc-editor.org/rfc/rfc8725'
const rows: [string, string, string, string, string][] = [
  [
    'JWT-ALG-NONE',
    'Unsigned token',
    'An alg=none token does not carry an authentication signature.',
    'Reject unsigned tokens on authenticated routes and allow only the algorithms configured by the issuer.',
    jwt,
  ],
  [
    'JWT-EXPIRED',
    'Expired token',
    'The exp timestamp is in the past.',
    'Request a fresh token through the trusted issuer. Do not extend expiry by editing the token.',
    jwt,
  ],
  [
    'JWT-NOT-ACTIVE',
    'Token not active yet',
    'The nbf timestamp is in the future.',
    'Check clock skew and the issuer’s validity window.',
    jwt,
  ],
  [
    'JWT-SIGNATURE-UNVERIFIED',
    'Signature not yet verified',
    'Decoding does not prove who issued the token.',
    'Use the local signature verifier with a trusted public test key; also validate issuer and audience.',
    jwt,
  ],
  [
    'JWT-NO-EXP',
    'No expiry claim',
    'Without exp, the token may remain valid indefinitely at a permissive consumer.',
    'Require a short expiry appropriate to the application.',
    jwt,
  ],
  [
    'JWT-LONG-LIFETIME',
    'Long token lifetime',
    'The declared lifetime exceeds 24 hours.',
    'Review the issuer’s lifetime and refresh-token policy.',
    jwt,
  ],
  [
    'JWT-REMOTE-KEY-HEADER',
    'Remote key URL present',
    'Untrusted jku or x5u URLs can point at attacker-controlled keys.',
    'Pin trusted issuer key locations. This decoder never requests these URLs.',
    jwt,
  ],
  [
    'JWT-SYMMETRIC-ALG',
    'Shared-secret algorithm',
    'HMAC uses the same secret for signing and verification.',
    'Never substitute a public key for an HMAC secret. Keep algorithm families separate.',
    jwt,
  ],
  [
    'PRIVATE-KEY-EXPOSED',
    'Private key pasted',
    'Private key material should remain in its original secure key store.',
    'Consider replacing an exposed key and revoke the old credential. The decoder hides private-key bytes.',
    'https://www.rfc-editor.org/rfc/rfc7468',
  ],
  [
    'SECRET-EXPOSED',
    'Credential prefix matched',
    'A public provider prefix resembles a live credential. No match does not mean safe.',
    'Revoke or rotate exposed credentials through the provider. Never include the value in a support report.',
    'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository',
  ],
  [
    'CERT-EXPIRED',
    'Expired certificate',
    'The X.509 notAfter time is in the past.',
    'Renew through the certificate issuer and deploy the renewed chain. This tool does not check revocation.',
    'https://www.rfc-editor.org/rfc/rfc5280',
  ],
  [
    'COMPRESSION-LIMIT',
    'Expansion stopped',
    'The decoded output exceeded a safety limit or the stream could not be safely expanded.',
    'Use a smaller trusted sample. Do not disable limits for untrusted input.',
    'https://www.rfc-editor.org/rfc/rfc8878',
  ],
  [
    'BASIC-CREDENTIAL',
    'Reversible Basic credentials',
    'Basic authorization is an encoding, not encryption.',
    'Use TLS and rotate credentials exposed in logs. The password is hidden.',
    'https://www.rfc-editor.org/rfc/rfc7617',
  ],
  [
    'IDN-CONFUSABLE',
    'Confusable domain characters',
    'Greek or Cyrillic characters may resemble Latin letters.',
    'Inspect each domain label before navigating or trusting it.',
    'https://www.unicode.org/reports/tr39/',
  ],
  [
    'DNS-WEAK-POLICY',
    'Permissive mail policy',
    'The policy allows all senders or only monitors failures.',
    'Review the SPF default mechanism or DMARC enforcement with your mail administrator.',
    'https://www.rfc-editor.org/rfc/rfc7208',
  ],
  [
    'K8S-SECRET-PLAINTEXT',
    'Base64 is not encryption',
    'A Kubernetes Secret data value is only Base64-encoded.',
    'Restrict access and use appropriate encryption at rest. Expand values only on a trusted device.',
    'https://kubernetes.io/docs/concepts/configuration/secret/',
  ],
  [
    'SAML-EXPIRED',
    'Expired SAML assertion',
    'The assertion’s NotOnOrAfter time is in the past.',
    'Obtain a fresh assertion from the trusted identity provider.',
    'https://docs.oasis-open.org/security/saml/v2.0/',
  ],
  [
    'SAML-SIGNATURE-UNVERIFIED',
    'SAML signature not verified',
    'A Signature element can be present without being trusted or valid.',
    'Validate the signature, issuer, audience and timing with the identity provider’s trusted configuration.',
    'https://docs.oasis-open.org/security/saml/v2.0/',
  ],
]
const parseRules: [string, string, string][] = [
  ['DATE-INVALID', 'Calendar date', 'https://www.rfc-editor.org/rfc/rfc3339'],
  [
    'ENTITY-UNKNOWN',
    'Unknown HTML entity',
    'https://html.spec.whatwg.org/multipage/named-characters.html',
  ],
  [
    'UNICODE-SURROGATE',
    'Unpaired Unicode surrogate',
    'https://www.unicode.org/versions/Unicode16.0.0/',
  ],
  ['BASE32-PADDING', 'Base32 padding', 'https://www.rfc-editor.org/rfc/rfc4648'],
  ['XML-MALFORMED', 'Malformed XML', 'https://www.w3.org/TR/xml/'],
  ['PEM-DER-INVALID', 'Invalid PEM DER', 'https://www.rfc-editor.org/rfc/rfc7468'],
  ['SSH-TRUNCATED', 'Truncated SSH key', 'https://www.rfc-editor.org/rfc/rfc4253'],
  ['PGP-CHECKSUM', 'Changed PGP armor', 'https://www.rfc-editor.org/rfc/rfc9580'],
  ['TOML-INVALID', 'Invalid TOML', 'https://toml.io/en/v1.0.0'],
  ['MANUAL-DECODE-FAILED', 'Manual decoding failed', 'https://www.rfc-editor.org/rfc/rfc4648'],
  [
    'LOCAL-PARSER-UNAVAILABLE',
    'Local parser unavailable',
    'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API',
  ],
  [
    'CODEC-UNAVAILABLE',
    'Codec unavailable on this surface',
    'https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API',
  ],
  ['INPUT-LIMIT', 'Input size limit', 'https://developer.mozilla.org/en-US/docs/Web/API/File_API'],
  ['JSON-MORE-NODES', 'JSON node limit', 'https://www.rfc-editor.org/rfc/rfc8259'],
  ['CRON-RANGE', 'Bounded schedule search', 'https://man7.org/linux/man-pages/man5/crontab.5.html'],
]
rows.push([
  'MIME-CHARSET-UNSUPPORTED',
  'This text uses an unsupported character set',
  'The declared MIME character set is not supported by this browser. The original encoded words are kept.',
  'Ask the sender to use UTF-8, or choose a supported character set in the string inspector. Missing characters are never invented.',
  'https://www.rfc-editor.org/rfc/rfc2047',
])
for (const [id, title, reference] of parseRules)
  rows.push([
    id,
    title,
    `${title} prevented a complete interpretation of this layer. Earlier layers are retained.`,
    `Check the format and input boundaries, try another candidate, or open the local parser once online. Use a small synthetic example when reporting the issue.`,
    reference,
  ])
for (const flag of ['Secure', 'HttpOnly', 'SameSite'])
  rows.push([
    `COOKIE-NO-${flag.toUpperCase()}`,
    `Missing ${flag} cookie attribute`,
    `The Set-Cookie header did not contain ${flag}.`,
    `Review the cookie’s deployment context and set ${flag} where appropriate.`,
    'https://www.rfc-editor.org/rfc/rfc6265',
  ])
rows.push([
  'HTTP-NO-HSTS',
  'No HSTS header',
  'No Strict-Transport-Security header was seen in this response.',
  'Review whether HSTS is appropriate on the HTTPS origin. Absence alone is not a security verdict.',
  'https://www.rfc-editor.org/rfc/rfc6797',
])
rows.push(
  [
    'TEXT-LOST',
    'Characters already lost',
    'Replacement characters indicate that some original characters are missing. Question marks may also be placeholders; punctuation alone cannot prove loss.',
    'Request the original file or text from the sender. Missing bytes cannot be reconstructed.',
    'https://encoding.spec.whatwg.org/',
  ],
  [
    'MAIL-REPLY-TO',
    'Reply address differs',
    'Reply-To names a different mailbox from From. This can be legitimate, but replies will leave the sender mailbox.',
    'Confirm the reply address with the sender through a trusted channel before sending sensitive information.',
    'https://www.rfc-editor.org/rfc/rfc5322',
  ],
  [
    'MAIL-DISPLAY-ADDRESS',
    'Displayed and actual addresses differ',
    'An address in the display name differs from the mailbox in angle brackets.',
    'Read the full sender mailbox. A display name does not authenticate the sender.',
    'https://www.rfc-editor.org/rfc/rfc5322',
  ],
)
for (const [id, title, why, fix] of [
  [
    'URL-REDIRECT',
    'Different embedded destination',
    'A query field contains an HTTP address with a different host. This is local syntax inspection, not proof of an actual server redirect.',
    'Inspect the embedded destination before opening the link.',
  ],
  [
    'URL-NO-TLS',
    'Unencrypted HTTP',
    'HTTP does not provide TLS encryption for the address.',
    'Prefer the trusted HTTPS origin when it is available.',
  ],
  [
    'URL-IP-HOST',
    'Numeric address',
    'The host is an IPv4 or IPv6 address rather than a domain name.',
    'Confirm the intended host through a trusted source. A numeric host alone is not a danger verdict.',
  ],
  [
    'URL-USERINFO',
    'User information before host',
    'The text before @ is user information, not the destination host.',
    'Read the host after @. Do not mistake a display-like prefix for the destination.',
  ],
  [
    'URL-PERSONAL',
    'Personal query fields',
    'The address has non-empty name, email, phone or address fields.',
    'Remove personal fields before sharing if they are not needed.',
  ],
  [
    'OTP-SECRET',
    'Authentication secret',
    'An otpauth secret can produce the same one-time codes as the authentication app.',
    'Keep the secret private. Rotate the authentication setup through the trusted issuer if exposed.',
  ],
])
  rows.push([id!, title!, why!, fix!, 'https://url.spec.whatwg.org/'])
rows.push([
  'PHOTO-LOCATION',
  'Photo location metadata',
  'The JPEG EXIF metadata contains GPS coordinates. Sharing the original photo can disclose its location.',
  'Review the metadata before sharing. This tool reads metadata and does not remove it.',
  'https://www.cipa.jp/std/documents/e/DC-008-Translation-2023-E.pdf',
])
rows.push([
  'UA-SELF-REPORTED',
  'Self-reported browser information',
  'A User-Agent may be reduced or spoofed. It does not prove the actual browser or device.',
  'Treat this as a reading of the supplied string. Do not use it for identity or security decisions.',
  'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/User-Agent',
])
rows.push([
  'COOKIE-CREDENTIAL',
  'Possible login cookie',
  'Names such as SID, session and token can carry login credentials. Names alone cannot prove the cookie purpose.',
  'Do not paste these values into chats, AI tools or other sites. If exposed, sign out or revoke sessions through the trusted site.',
  'https://httpwg.org/specs/rfc6265.html#section-8.4',
])
rows.push([
  'WALLET-UNVERIFIED',
  'Address text is not ownership verification',
  'A matching address checksum checks the text, not its owner, balance or intended network. Related networks may reuse an address format.',
  'Confirm the network and recipient through your trusted wallet before taking any action. This reader does not contact a blockchain.',
  'https://github.com/bitcoin/bips/blob/master/bip-0350.mediawiki',
])
export const ruleSpecs: RuleSpec[] = rows.map(([id, title, why, fix, reference]) => ({
  id,
  title,
  why,
  fix,
  reference,
}))
