export function syntheticJpeg(): Uint8Array {
  const tiff = new Uint8Array(400),
    view = new DataView(tiff.buffer)
  tiff.set([0x49, 0x49, 42, 0, 8, 0, 0, 0])
  view.setUint16(8, 5, true)
  const entry = (at: number, tag: number, type: number, count: number, value: number) => {
    view.setUint16(at, tag, true)
    view.setUint16(at + 2, type, true)
    view.setUint32(at + 4, count, true)
    view.setUint32(at + 8, value, true)
  }
  entry(10, 0x010f, 2, 6, 100)
  entry(22, 0x0110, 2, 6, 110)
  entry(34, 0x0132, 2, 20, 120)
  entry(46, 0x8769, 4, 1, 150)
  entry(58, 0x8825, 4, 1, 200)
  tiff.set(new TextEncoder().encode('Synth\0'), 100)
  tiff.set(new TextEncoder().encode('Local\0'), 110)
  tiff.set(new TextEncoder().encode('2026:11:15 10:20:30\0'), 120)
  view.setUint16(150, 1, true)
  entry(152, 0x9003, 2, 20, 360)
  tiff.set(new TextEncoder().encode('2026:11:14 09:00:00\0'), 360)
  view.setUint16(200, 4, true)
  entry(202, 1, 2, 2, 78)
  entry(214, 2, 5, 3, 260)
  entry(226, 3, 2, 2, 69)
  entry(238, 4, 5, 3, 284)
  for (const [at, values] of [
    [260, [37, 30, 0]],
    [284, [127, 0, 0]],
  ] as const)
    for (let i = 0; i < 3; i++) {
      view.setUint32(at + i * 8, values[i]!, true)
      view.setUint32(at + i * 8 + 4, 1, true)
    }
  const bytes = new Uint8Array(2 + 4 + 6 + tiff.length + 19 + 2)
  bytes.set([255, 216, 255, 225, 1, 152])
  bytes.set(new TextEncoder().encode('Exif\0\0'), 6)
  bytes.set(tiff, 12)
  bytes.set([255, 192, 0, 17, 8, 0, 16, 0, 24, 3, 1, 17, 0, 2, 17, 0, 3, 17, 0], 412)
  bytes.set([255, 217], 431)
  return bytes
}
