import { brotliCompressSync, brotliDecompressSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { decode, detect, DEFAULT_LIMITS, encodeBase64 } from '@decoding/engine'
import { publicFixtures } from '@decoding/fixtures-public'
import { webCodecs } from './codecs'
describe('injected local codecs and manual decoding', () => {
  it('expands real zstd fixtures and enforces output limits', async () => {
    const bytes = publicFixtures.find((f) => f.detector === 'zstd' && f.class === 'positive')!
      .input as Uint8Array
    const result = await decode(bytes, { codecs: webCodecs })
    expect(result.root.children[0]?.selected?.value).toEqual({ fixture: 0 })
    const limited = await decode(bytes, { codecs: webCodecs, limits: { maxExpandedBytes: 2 } })
    expect(limited.root.selected?.warnings[0]?.ruleId).toBe('COMPRESSION-LIMIT')
  })
  it('decodes MessagePack and CBOR trees only after complete consumption', async () => {
    const msgpack = await detect(new Uint8Array([0x81, 0xa1, 0x61, 1]), { codecs: webCodecs })
    expect(msgpack.find((c) => c.detector === 'msgpack')?.value).toEqual({ a: 1 })
    expect(msgpack.find((c) => c.detector === 'msgpack')?.confidence).toBeLessThan(0.85)
    const cbor = (
      await decode(new Uint8Array([0xd9, 0xd9, 0xf7, 0xa1, 0x61, 0x61, 1]), { codecs: webCodecs })
    ).root.selected
    expect(cbor?.detector).toBe('cbor')
    expect(cbor?.value).toEqual({ a: 1 })
    expect(
      (await detect(new Uint8Array([0x81, 0xa1, 0x61, 1, 0]), { codecs: webCodecs })).some(
        (c) => c.detector === 'msgpack',
      ),
    ).toBe(false)
    expect(
      (await detect(new Uint8Array([0xd9, 0xd9, 0xf7, 0xa1, 0x61]), { codecs: webCodecs })).some(
        (c) => c.detector === 'cbor',
      ),
    ).toBe(false)
  })
  it('parses TOML, schema-free Protobuf fields and data URI image signatures', async () => {
    const toml = await decode('[package]\nname = "fixture"\nversion = "1.0.0"', {
      codecs: webCodecs,
    })
    expect(toml.root.selected?.value).toEqual({ package: { name: 'fixture', version: '1.0.0' } })
    const protobuf = (await detect(new Uint8Array([8, 0x96, 1]))).find(
      (c) => c.detector === 'protobuf',
    )
    expect(protobuf?.value).toMatchObject({ fields: [{ field: 1, wire: 0, value: '150' }] })
    const image = await decode(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/a0kAAAAASUVORK5CYII=',
    )
    expect(image.root.children[0]?.selected?.value).toMatchObject({
      mime: 'image/png',
      extension: 'png',
    })
  })
  it('supports layer overrides and undo without changing the original input', async () => {
    const encoded = encodeBase64(new TextEncoder().encode('hello'))
    const forced = await decode(encoded, { overrides: { '0-1': 'base64' } })
    expect(forced.root.selected?.value).toBe('hello')
    expect((await decode(encoded)).root.selected?.detector).toBe('base64')
    const bytes = brotliCompressSync('{"local":true}')
    const result = await decode(bytes, {
      codecs: { brotli: async (bytes) => new Uint8Array(brotliDecompressSync(bytes)) },
      overrides: { '0-1': 'brotli' },
    })
    expect(result.root.children[0]?.selected?.value).toEqual({ local: true })
    const failed = await decode('not base64 !', { overrides: { '0-1': 'base64' } })
    expect(failed.root.selected?.warnings[0]?.ruleId).toBe('MANUAL-DECODE-FAILED')
  })
  it('preserves codec-less host recognition and rejects uncached expansion honestly', async () => {
    const bytes = publicFixtures.find((f) => f.detector === 'zstd' && f.class === 'positive')!
      .input as Uint8Array
    expect((await decode(bytes)).root.selected?.warnings[0]?.ruleId).toBe('CODEC-UNAVAILABLE')
    await expect(
      webCodecs.zstd!(bytes, { ...DEFAULT_LIMITS, maxExpandedBytes: 1 }),
    ).rejects.toThrow()
  })
})
