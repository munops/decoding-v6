import { decodeBase64, inputText } from '@decoding/engine'
export class KeyFormatError extends Error {
  constructor(
    public readonly line: number,
    public readonly column: number,
    format = 'JWK JSON',
  ) {
    super(`Invalid ${format} at line ${line}, column ${column}.`)
  }
}
function parseJwk(text: string): JsonWebKey {
  try {
    return JSON.parse(text) as JsonWebKey
  } catch (error) {
    // Use only numeric positions from parser diagnostics; never expose its message or key text.
    const message = error instanceof Error ? error.message : ''
    const explicit = /line (\d+) column (\d+)/.exec(message)
    const position = /position (\d+)/.exec(message)
    const offset = position ? Math.min(text.length, Number(position[1])) : text.length
    const prefix = text.slice(0, offset).split('\n')
    throw new KeyFormatError(
      explicit ? Number(explicit[1]) : prefix.length,
      explicit ? Number(explicit[2]) : (prefix.at(-1)?.length ?? 0) + 1,
    )
  }
}
export async function verifyJwt(token: string, keyText: string): Promise<boolean> {
  const parts = token.trim().split('.')
  if (parts.length !== 3) throw new Error('Not JWT')
  const headerBytes = decodeBase64(parts[0] ?? ''),
    signature = decodeBase64(parts[2] ?? '')
  if (!headerBytes || !signature) throw new Error('Invalid segments')
  const header = JSON.parse(inputText(headerBytes)) as { alg?: unknown }
  const alg = String(header.alg),
    match = /^(HS|RS|PS|ES)(256|384|512)$/.exec(alg)
  if (!match) throw new Error('Unsupported algorithm')
  const family = match[1],
    bits = Number(match[2]),
    hash = `SHA-${bits}`
  let algorithm: HmacImportParams | RsaHashedImportParams | EcKeyImportParams
  if (family === 'HS') algorithm = { name: 'HMAC', hash }
  else if (family === 'ES')
    algorithm = {
      name: 'ECDSA',
      namedCurve: bits === 256 ? 'P-256' : bits === 384 ? 'P-384' : 'P-521',
    }
  else algorithm = { name: family === 'PS' ? 'RSA-PSS' : 'RSASSA-PKCS1-v1_5', hash }
  let key: CryptoKey
  if (keyText.trim().startsWith('{')) {
    const jwk = parseJwk(keyText)
    if (jwk.d) throw new Error('Use public keys only')
    key = await crypto.subtle.importKey('jwk', jwk, algorithm, false, ['verify'])
  } else if (family === 'HS')
    key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(keyText),
      algorithm,
      false,
      ['verify'],
    )
  else {
    const pem = /^-----BEGIN PUBLIC KEY-----\s*([\s\S]+?)\s*-----END PUBLIC KEY-----$/.exec(
      keyText.trim(),
    )
    if (!pem) {
      const lines = keyText.trim().split('\n')
      const line = lines[0]?.trim() !== '-----BEGIN PUBLIC KEY-----' ? 1 : lines.length
      throw new KeyFormatError(line, 1, 'public SPKI PEM boundary')
    }
    const lines = keyText.trim().split('\n')
    for (let i = 1; i < lines.length - 1; i++) {
      const bad = /[^A-Za-z0-9+/=\s]/.exec(lines[i] ?? '')
      if (bad) throw new KeyFormatError(i + 1, bad.index + 1, 'PEM Base64')
    }
    const bytes = decodeBase64(pem[1] ?? '')
    if (!bytes) throw new KeyFormatError(2, 1, 'PEM Base64 body')
    try {
      key = await crypto.subtle.importKey('spki', new Uint8Array(bytes), algorithm, false, [
        'verify',
      ])
    } catch {
      throw new KeyFormatError(
        2,
        1,
        'SPKI DER body (body starts here; check key type and algorithm)',
      )
    }
  }
  const verifyAlgorithm =
    family === 'PS'
      ? { name: 'RSA-PSS', saltLength: bits / 8 }
      : family === 'ES'
        ? { name: 'ECDSA', hash }
        : algorithm
  return crypto.subtle.verify(
    verifyAlgorithm,
    key,
    new Uint8Array(signature),
    new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
  )
}
