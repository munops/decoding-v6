import { decodeBase64, inputText } from '@decoding/engine'
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
    const jwk = JSON.parse(keyText) as JsonWebKey
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
    if (!pem) throw new Error('Expected public SPKI PEM or JWK')
    const bytes = decodeBase64(pem[1] ?? '')
    if (!bytes) throw new Error('Invalid public key')
    key = await crypto.subtle.importKey('spki', new Uint8Array(bytes), algorithm, false, ['verify'])
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
