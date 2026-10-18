/** Bounded grammar checks; no external parsers and no guessed semantic types. */
export function binaryGrammar(bytes: Uint8Array, kind: 'msgpack' | 'cbor'): boolean {
  let offset = 0,
    nodes = 0
  const take = (count: number) => {
    if (!Number.isSafeInteger(count) || count < 0 || count > bytes.length - offset)
      throw new Error('Truncated')
    offset += count
  }
  const number = (size: number) => {
    if (size > 6) {
      take(size)
      return -1
    }
    let n = 0
    for (let i = 0; i < size; i++) {
      const b = bytes[offset++]
      if (b === undefined) throw new Error('Truncated')
      n = n * 256 + b
    }
    return n
  }
  const walk = (depth: number): void => {
    if (depth > 16 || ++nodes > 10000) throw new Error('Structure limit')
    const b = bytes[offset++]
    if (b === undefined) throw new Error('Truncated')
    if (kind === 'msgpack') {
      if (b <= 0x7f || b >= 0xe0 || [0xc0, 0xc2, 0xc3].includes(b)) return
      if (b >= 0xa0 && b <= 0xbf) {
        take(b & 31)
        return
      }
      let entries = 0
      if (b >= 0x80 && b <= 0x8f) entries = (b & 15) * 2
      else if (b >= 0x90 && b <= 0x9f) entries = b & 15
      else if ([0xdc, 0xdd, 0xde, 0xdf].includes(b))
        entries = number(b === 0xdc || b === 0xde ? 2 : 4) * (b >= 0xde ? 2 : 1)
      else {
        const fixed: Record<number, number> = {
          0xca: 4,
          0xcb: 8,
          0xcc: 1,
          0xcd: 2,
          0xce: 4,
          0xcf: 8,
          0xd0: 1,
          0xd1: 2,
          0xd2: 4,
          0xd3: 8,
          0xd4: 2,
          0xd5: 3,
          0xd6: 5,
          0xd7: 9,
          0xd8: 17,
        }
        if (fixed[b] !== undefined) {
          take(fixed[b]!)
          return
        }
        const widths: Record<number, number> = {
          0xc4: 1,
          0xc5: 2,
          0xc6: 4,
          0xc7: 1,
          0xc8: 2,
          0xc9: 4,
          0xd9: 1,
          0xda: 2,
          0xdb: 4,
        }
        if (widths[b] !== undefined) {
          const length = number(widths[b]!)
          take(length + ([0xc7, 0xc8, 0xc9].includes(b) ? 1 : 0))
          return
        }
        throw new Error('Invalid marker')
      }
      if (entries > 10000) throw new Error('Structure limit')
      for (let i = 0; i < entries; i++) walk(depth + 1)
    } else {
      const major = b >> 5,
        extra = b & 31
      if (extra === 31) {
        if (![2, 3, 4, 5].includes(major)) throw new Error('Invalid indefinite')
        let count = 0
        while (bytes[offset] !== 0xff) {
          if (offset >= bytes.length) throw new Error('Truncated')
          walk(depth + 1)
          count++
        }
        offset++
        if (major === 5 && count % 2) throw new Error('Incomplete map')
        return
      }
      if (extra > 27) throw new Error('Invalid argument')
      const n = extra < 24 ? extra : number(2 ** (extra - 24))
      if (major <= 1) return
      if (major === 2 || major === 3) {
        take(n)
        return
      }
      if (major === 4 || major === 5) {
        const count = n * (major === 5 ? 2 : 1)
        if (n < 0 || count > 10000) throw new Error('Structure limit')
        for (let i = 0; i < count; i++) walk(depth + 1)
        return
      }
      if (major === 6) {
        walk(depth + 1)
        return
      }
      if (major === 7) return
      throw new Error('Invalid marker')
    }
  }
  try {
    walk(0)
    return offset === bytes.length
  } catch {
    return false
  }
}
