import { completionMessages } from './completion-messages'
import type { WorkbenchLocale } from './messages'
export function byteStats(bytes: Uint8Array) {
  const counts = new Uint32Array(256)
  let printable = 0
  for (const byte of bytes) {
    counts[byte] = counts[byte]! + 1
    if ((byte >= 32 && byte <= 126) || [9, 10, 13].includes(byte)) printable++
  }
  let entropy = 0
  for (const count of counts)
    if (count) {
      const p = count / bytes.length
      entropy -= p * Math.log2(p)
    }
  return { entropy, printable: bytes.length ? printable / bytes.length : 0 }
}
export function ByteMap({ bytes, locale }: { bytes: Uint8Array; locale: WorkbenchLocale }) {
  const stats = byteStats(bytes),
    copy = completionMessages[locale]
  return (
    <section class="byte-map">
      <h3>{copy.map}</h3>
      <p>
        {stats.entropy.toFixed(3)} bit/byte · {(stats.printable * 100).toFixed(1)}% ASCII
      </p>
      {bytes.length >= 16 ? (
        <>
          <meter min="0" max="8" value={stats.entropy} aria-label={copy.map} />
          {stats.entropy >= 7.5 ? (
            <p>
              {locale === 'ko'
                ? '무작위에 가까워요. 압축됐거나 암호화된 값일 수 있어요.'
                : 'Near-random bytes: this may be compressed or encrypted.'}
            </p>
          ) : null}
        </>
      ) : null}
    </section>
  )
}
