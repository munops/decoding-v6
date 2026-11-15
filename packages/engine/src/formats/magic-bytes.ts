import { zipNames, photoFacts } from './file-facts'
import type { Detector } from '../types'
import { found, hex } from './common'
export function identifyMagic(
  bytes: Uint8Array,
): { label: string; mime: string; extension: string } | null {
  const h = hex(bytes.slice(0, 16))
  const signatures: [string, string, string, string][] = [
    ['377abcaf271c', '7z archive', 'application/x-7z-compressed', '7z'],
    ['526172211a0700', 'RAR archive', 'application/vnd.rar', 'rar'],
    ['526172211a070100', 'RAR archive', 'application/vnd.rar', 'rar'],
    ['424d', 'BMP image', 'image/bmp', 'bmp'],
    ['00000100', 'ICO image', 'image/x-icon', 'ico'],
    ['494433', 'MP3 audio', 'audio/mpeg', 'mp3'],
    ['53514c69746520666f726d6174203300', 'SQLite database', 'application/vnd.sqlite3', 'sqlite'],
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
  if (bytes.length >= 12 && h.slice(8, 16) === '66747970')
    return { label: 'MP4 media', mime: 'video/mp4', extension: 'mp4' }
  if (bytes[0] === 0xff && bytes[1] !== undefined && (bytes[1] & 0xe6) === 0xe2)
    return { label: 'MP3 audio', mime: 'audio/mpeg', extension: 'mp3' }
  const entry = signatures.find(([prefix]) => h.startsWith(prefix))
  return entry ? { label: entry[1], mime: entry[2], extension: entry[3] } : null
}
export const magicBytes: Detector = {
  id: 'magic-bytes',
  detect(input) {
    if (typeof input === 'string') return null
    const magic = identifyMagic(input)
    const entries = magic?.extension === 'zip' ? zipNames(input) : []
    if (magic && entries.length) {
      const office =
        entries.includes('[Content_Types].xml') &&
        (entries.some((name) => name.startsWith('word/'))
          ? ['Word document', 'docx']
          : entries.some((name) => name.startsWith('xl/'))
            ? ['Excel workbook', 'xlsx']
            : entries.some((name) => name.startsWith('ppt/'))
              ? ['PowerPoint presentation', 'pptx']
              : null)
      if (office) {
        magic.label = office[0]!
        magic.extension = office[1]!
      }
    }
    const photo = magic?.mime.startsWith('image/') ? photoFacts(input) : {}
    return magic
      ? found(
          'magic-bytes',
          magic.label,
          { ...magic, bytes: input.length, ...photo, ...(entries.length ? { entries } : {}) },
          magic.extension === 'gz' ? 0.7 : 0.999,
          {
            warnings: photo.gps
              ? [
                  {
                    ruleId: 'PHOTO-LOCATION',
                    severity: 'warning',
                    message: { code: 'warning-photo-location' },
                  },
                ]
              : [],
            metadata: { ...magic, imageBytes: magic.mime.startsWith('image/') ? input : undefined },
          },
        )
      : null
  },
}
