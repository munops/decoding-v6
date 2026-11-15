import { syntheticJpeg } from '../../fixtures-public/src/file-samples'
import { describe, expect, it } from 'vitest'
import { zipSync, strToU8 } from 'fflate'
import { decode, encodeBase64, identifyMagic } from '../src'
import { photoFacts, zipNames } from '../src/formats/file-facts'

describe('local URL and file facts', () => {
  it('unwraps query destinations without requests and removes only known tracking fields', async () => {
    const destination = 'https://destination.example/path?utm_source=mail&item=1'
    for (const value of [destination, encodeBase64(strToU8(destination))]) {
      const result = await decode(
        `https://click.example/?next=${encodeURIComponent(value)}&utm_medium=email`,
      )
      expect(result.root.selected?.warnings.map((item) => item.ruleId)).toContain('URL-REDIRECT')
      expect(result.root.selected?.metadata?.trackingCount).toBe(1)
      expect(result.root.children[0]?.selected?.metadata?.originalUrl).toBe(
        'https://destination.example/path?item=1',
      )
    }
  })
  it('flags syntax facts and masks OTP and URL password outputs', async () => {
    const result = await decode(
      'http://pretend.example:private@127.0.0.1/?email=local%40example.test',
    )
    expect(result.root.selected?.warnings.map((item) => item.ruleId)).toEqual([
      'URL-NO-TLS',
      'URL-IP-HOST',
      'URL-USERINFO',
      'URL-PERSONAL',
    ])
    expect(JSON.stringify(result.root.selected?.value)).not.toContain('private')
    const otp = await decode('otpauth://totp/Synthetic?secret=SYNTHETICOTP&issuer=Example')
    expect(otp.root.selected?.warnings[0]?.ruleId).toBe('OTP-SECRET')
    expect(JSON.stringify(otp.root.selected)).not.toContain('SYNTHETICOTP')
  })
  it('lists ZIP directory names and recognizes office containers without extraction', async () => {
    const zip = zipSync({
      '[Content_Types].xml': strToU8('synthetic'),
      'word/document.xml': strToU8('not extracted'),
      '../unsafe-name.txt': strToU8('only a name'),
    })
    expect(zipNames(zip)).toEqual([
      '[Content_Types].xml',
      'word/document.xml',
      '../unsafe-name.txt',
    ])
    expect((await decode(zip)).root.selected?.value).toMatchObject({
      extension: 'docx',
      entries: zipNames(zip),
    })
    for (let length = 0; length < zip.length; length += 7)
      expect(() => zipNames(zip.slice(0, length))).not.toThrow()
  })
  it('reads bounded JPEG EXIF GPS, camera and timestamps without editing', async () => {
    const jpeg = syntheticJpeg(),
      original = jpeg.slice()
    expect(photoFacts(jpeg)).toMatchObject({
      width: 24,
      height: 16,
      camera: 'Synth Local',
      takenAt: '2026:11:14 09:00:00',
      gps: { latitude: 37.5, longitude: 127 },
    })
    expect((await decode(jpeg)).root.selected?.warnings[0]?.ruleId).toBe('PHOTO-LOCATION')
    expect(jpeg).toEqual(original)
    for (let length = 0; length < jpeg.length; length += 3)
      expect(() => photoFacts(jpeg.slice(0, length))).not.toThrow()
  })
  it('recognizes new signatures and preserves unrelated negatives', () => {
    for (const [hex, extension] of [
      ['377abcaf271c', '7z'],
      ['526172211a070100', 'rar'],
      ['424d00000000', 'bmp'],
      ['000001000100', 'ico'],
      ['4944330000', 'mp3'],
      ['000000186674797069736f6d', 'mp4'],
      ['53514c69746520666f726d6174203300', 'sqlite'],
    ]) {
      const bytes = Uint8Array.from(hex!.match(/../g)!, (part) => parseInt(part, 16))
      expect(identifyMagic(bytes)?.extension).toBe(extension)
      expect(identifyMagic(Uint8Array.from(bytes, (b) => b ^ 0x55))).toBeNull()
    }
  })
})
