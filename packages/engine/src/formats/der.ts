export type Der = { tag: number; body: Uint8Array; children: Der[] }
export function der(bytes: Uint8Array, depth = 0): Der {
  if (depth > 12 || bytes.length < 2) throw new Error('Invalid DER')
  let start = 2,
    length = bytes[1]!
  if (length & 128) {
    const count = length & 127
    if (!count || count > 4 || bytes.length < 2 + count) throw new Error('Invalid DER length')
    length = 0
    for (let i = 0; i < count; i++) length = length * 256 + bytes[2 + i]!
    start += count
  }
  if (start + length !== bytes.length) throw new Error('Truncated DER')
  const body = bytes.slice(start),
    children: Der[] = []
  if (bytes[0]! & 32) {
    let offset = 0
    while (offset < body.length) {
      let header = 2,
        n = body[offset + 1]
      if (n === undefined) throw new Error('Truncated DER')
      if (n & 128) {
        const count = n & 127
        if (!count || count > 4) throw new Error('Invalid DER')
        n = 0
        for (let i = 0; i < count; i++) n = n * 256 + (body[offset + 2 + i] ?? NaN)
        header += count
      }
      if (!Number.isFinite(n) || header + n > body.length - offset) throw new Error('Truncated DER')
      children.push(der(body.slice(offset, offset + header + n), depth + 1))
      offset += header + n
      if (children.length > 128) throw new Error('DER node limit')
    }
  }
  return { tag: bytes[0]!, body, children }
}
