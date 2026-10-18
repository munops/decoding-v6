import type { Detector } from '../types'
import { found, hex } from './common'
export function identifyMagic(
  bytes: Uint8Array,
): { label: string; mime: string; extension: string } | null {
  const h = hex(bytes.slice(0, 16))
  const signatures: [string, string, string, string][] = [
    ['89504e470d0a1a0a', 'PNG image', 'image/png', 'png'],
    ['ffd8ff', 'JPEG image', 'image/jpeg', 'jpg'],
    ['474946383761', 'GIF image', 'image/gif', 'gif'],
    ['474946383961', 'GIF image', 'image/gif', 'gif'],
    ['25504446', 'PDF document', 'application/pdf', 'pdf'],
    ['504b0304', 'ZIP archive', 'application/zip', 'zip'],
    ['7f454c46', 'ELF executable', 'application/octet-stream', 'elf'],
    ['cffaedfe', 'Mach-O executable', 'application/octet-stream', 'macho'],
    ['feedfacf', 'Mach-O executable', 'application/octet-stream', 'macho'],
    ['cafebabe', 'Mach-O universal / Java class', 'application/octet-stream', 'bin'],
    ['1f8b08', 'gzip stream', 'application/gzip', 'gz'],
  ]
  if (h.startsWith('52494646') && h.slice(16, 24) === '57454250')
    return { label: 'WebP image', mime: 'image/webp', extension: 'webp' }
  const entry = signatures.find(([prefix]) => h.startsWith(prefix))
  return entry ? { label: entry[1], mime: entry[2], extension: entry[3] } : null
}
export const magicBytes: Detector = {
  id: 'magic-bytes',
  detect(input) {
    if (typeof input === 'string') return null
    const magic = identifyMagic(input)
    return magic
      ? found(
          'magic-bytes',
          magic.label,
          { ...magic, bytes: input.length },
          magic.extension === 'gz' ? 0.7 : 0.999,
          {
            metadata: { ...magic, imageBytes: magic.mime.startsWith('image/') ? input : undefined },
          },
        )
      : null
  },
}
