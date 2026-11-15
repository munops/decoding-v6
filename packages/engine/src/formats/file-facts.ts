/** Reads bounded ZIP directory entries only. Never inflates an entry. */
export function zipNames(bytes: Uint8Array): string[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  let eocd = -1
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd < 0) return []
  const count = Math.min(view.getUint16(eocd + 10, true), 1000)
  const names: string[] = []
  let at = view.getUint32(eocd + 16, true)
  for (let i = 0; i < count && at + 46 <= bytes.length; i++) {
    if (view.getUint32(at, true) !== 0x02014b50) break
    const length = view.getUint16(at + 28, true)
    const extra = view.getUint16(at + 30, true),
      comment = view.getUint16(at + 32, true)
    if (at + 46 + length + extra + comment > bytes.length) break
    const name = new TextDecoder(
      view.getUint16(at + 8, true) & 0x800 ? 'utf-8' : 'windows-1252',
    ).decode(bytes.subarray(at + 46, at + 46 + length))
    names.push(name.slice(0, 1024))
    at += 46 + length + extra + comment
  }
  return names
}
export type PhotoFacts = {
  width?: number
  height?: number
  camera?: string
  takenAt?: string
  gps?: { latitude: number; longitude: number }
}
export function photoFacts(bytes: Uint8Array): PhotoFacts {
  const facts: PhotoFacts = {}
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  if (bytes.length >= 24 && view.getUint32(0) === 0x89504e47) {
    facts.width = view.getUint32(16)
    facts.height = view.getUint32(20)
    return facts
  }
  if (bytes.length >= 10 && new TextDecoder().decode(bytes.subarray(0, 3)) === 'GIF') {
    facts.width = view.getUint16(6, true)
    facts.height = view.getUint16(8, true)
    return facts
  }
  if (bytes[0] !== 255 || bytes[1] !== 216) return facts
  let at = 2
  while (at + 4 <= bytes.length) {
    if (bytes[at] !== 255) break
    const marker = bytes[at + 1]!,
      size = view.getUint16(at + 2)
    if (marker === 0xda || marker === 0xd9 || size < 2 || at + 2 + size > bytes.length) break
    if ([0xc0, 0xc1, 0xc2, 0xc3].includes(marker) && size >= 7) {
      facts.height = view.getUint16(at + 5)
      facts.width = view.getUint16(at + 7)
    }
    if (
      marker === 0xe1 &&
      size > 14 &&
      new TextDecoder().decode(bytes.subarray(at + 4, at + 10)) === 'Exif\0\0'
    ) {
      const start = at + 10,
        end = at + 2 + size
      const little = view.getUint16(start) === 0x4949
      const valid = (offset: number, length: number) => offset >= start && offset + length <= end
      const readIFD = (relative: number): Map<number, unknown> => {
        const out = new Map<number, unknown>(),
          offset = start + relative
        if (!valid(offset, 2)) return out
        const count = Math.min(view.getUint16(offset, little), 128)
        for (let i = 0; i < count; i++) {
          const entry = offset + 2 + i * 12
          if (!valid(entry, 12)) break
          const tag = view.getUint16(entry, little),
            type = view.getUint16(entry + 2, little),
            count = view.getUint32(entry + 4, little)
          const size = ({ 1: 1, 2: 1, 3: 2, 4: 4, 5: 8 } as Record<number, number>)[type]
          if (!size || count > 1024) continue
          const length = count * size,
            data = length <= 4 ? entry + 8 : start + view.getUint32(entry + 8, little)
          if (!valid(data, length)) continue
          if (type === 2)
            out.set(
              tag,
              new TextDecoder()
                .decode(bytes.subarray(data, data + length))
                .replace(/\0.*$/, '')
                .slice(0, 256),
            )
          else if (type === 4 && count === 1) out.set(tag, view.getUint32(data, little))
          else if (type === 5 && count === 3) {
            const values = Array.from(
              { length: 3 },
              (_, i) =>
                view.getUint32(data + i * 8, little) / view.getUint32(data + i * 8 + 4, little),
            )
            if (values.every(Number.isFinite)) out.set(tag, values)
          }
        }
        return out
      }
      if (valid(start, 8) && view.getUint16(start + 2, little) === 42) {
        const main = readIFD(view.getUint32(start + 4, little))
        const exif =
          typeof main.get(0x8769) === 'number' ? readIFD(main.get(0x8769) as number) : new Map()
        const camera = [main.get(0x010f), main.get(0x0110)]
          .filter((v) => typeof v === 'string')
          .join(' ')
        const takenAt = exif.get(0x9003) ?? main.get(0x0132)
        if (camera) facts.camera = camera
        if (typeof takenAt === 'string') facts.takenAt = takenAt
        if (typeof main.get(0x8825) === 'number') {
          const gps = readIFD(main.get(0x8825) as number),
            lat = gps.get(2),
            lon = gps.get(4)
          if (Array.isArray(lat) && Array.isArray(lon)) {
            const latitude = (lat[0] + lat[1] / 60 + lat[2] / 3600) * (gps.get(1) === 'S' ? -1 : 1)
            const longitude = (lon[0] + lon[1] / 60 + lon[2] / 3600) * (gps.get(3) === 'W' ? -1 : 1)
            if (Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180)
              facts.gps = { latitude, longitude }
          }
        }
      }
    }
    at += 2 + size
  }
  return facts
}
