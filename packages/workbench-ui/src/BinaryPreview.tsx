import { identifyMagic, type Detection } from '@decoding/engine'
import { useEffect, useState } from 'preact/hooks'
export function BinaryPreview({ detection }: { detection: Detection }) {
  const [url, setUrl] = useState('')
  const raw =
    detection.metadata?.imageBytes instanceof Uint8Array
      ? detection.metadata.imageBytes
      : detection.decoded instanceof Uint8Array
        ? detection.decoded
        : detection.value instanceof Uint8Array
          ? detection.value
          : null
  const magic = raw ? identifyMagic(raw) : null
  useEffect(() => {
    if (!raw || !magic?.mime.startsWith('image/')) {
      setUrl('')
      return
    }
    const href = URL.createObjectURL(new Blob([new Uint8Array(raw)], { type: magic.mime }))
    setUrl(href)
    return () => URL.revokeObjectURL(href)
  }, [detection])
  return url && magic ? (
    <figure class="decoded-image">
      <img src={url} alt={magic.label} loading="lazy" />
      <figcaption>
        {magic.label} · {raw?.length} bytes
      </figcaption>
    </figure>
  ) : null
}
