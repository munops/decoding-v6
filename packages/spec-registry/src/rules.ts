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
export const ruleSpecs: RuleSpec[] = rows.map(([id, title, why, fix, reference]) => ({
  id,
  title,
  why,
  fix,
  reference,
}))
