export type ReadPhoto = { text: string; format: string; width: number; height: number }
type BarcodeReader = {
  detect: (source: HTMLCanvasElement) => Promise<Array<{ rawValue: string; format: string }>>
}
type BarcodeConstructor = {
  new (options: { formats: string[] }): BarcodeReader
  getSupportedFormats: () => Promise<string[]>
}
/** Explicit file gesture only. No URL is opened and no photo leaves the browser. */
export async function readPhoto(file: File): Promise<ReadPhoto | null> {
  if (!file.type.startsWith('image/')) return null
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    if (image.naturalWidth * image.naturalHeight > 40_000_000) return null
    const scale = Math.min(1, 2048 / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return null
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const { executeOperation } = await import('@decoding/operations')
    try {
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
      const result = await executeOperation('qr-code', new Uint8Array(pixels.data), {
        mode: 'read',
        width: canvas.width,
        height: canvas.height,
      })
      const value = result.output as { data?: unknown }
      if (typeof value?.data === 'string')
        return {
          text: value.data,
          format: 'QR',
          width: image.naturalWidth,
          height: image.naturalHeight,
        }
    } catch {
      /* No QR found. Try a browser-supported barcode next. */
    }
    const BarcodeDetector = (globalThis as unknown as { BarcodeDetector?: BarcodeConstructor })
      .BarcodeDetector
    if (BarcodeDetector) {
      const formats = (await BarcodeDetector.getSupportedFormats()).filter(
        (format) => format !== 'qr_code',
      )
      if (formats.length) {
        const values = await new BarcodeDetector({ formats }).detect(canvas)
        if (values[0]?.rawValue)
          return {
            text: values[0].rawValue,
            format: values[0].format,
            width: image.naturalWidth,
            height: image.naturalHeight,
          }
      }
    }
    return null
  } finally {
    URL.revokeObjectURL(url)
  }
}
