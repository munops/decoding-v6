import { useEffect, useState } from 'preact/hooks'
import { completionMessages } from './completion-messages'
import type { WorkbenchLocale } from './messages'
import { KeyFormatError, verifyJwt } from './jwt-verify'
export function JwtVerify({ token, locale }: { token: string; locale: WorkbenchLocale }) {
  const [key, setKey] = useState(''),
    [status, setStatus] = useState(''),
    [busy, setBusy] = useState(false),
    copy = completionMessages[locale]
  useEffect(() => {
    const clear = () => {
      setKey('')
      setStatus('')
    }
    addEventListener('pagehide', clear)
    return () => removeEventListener('pagehide', clear)
  }, [])
  useEffect(() => setStatus(''), [token, key])
  return (
    <details class="jwt-verifier">
      <summary>{copy.verify}</summary>
      <p>{copy.keyNotice}</p>
      <label>
        {copy.key}
        <textarea
          value={key}
          onInput={(event) => setKey(event.currentTarget.value)}
          spellcheck={false}
          autocomplete="off"
        />
      </label>
      <button
        type="button"
        class="button secondary"
        disabled={!key || busy}
        onClick={() => {
          setBusy(true)
          void verifyJwt(token, key)
            .then(
              (ok) => setStatus(ok ? copy.signatureValid : copy.signatureInvalid),
              (error: unknown) =>
                setStatus(
                  error instanceof KeyFormatError
                    ? locale === 'ko'
                      ? `키 ${error.line}행 ${error.column}열의 형식을 확인해 주세요.`
                      : error.message
                    : locale === 'ko'
                      ? '키 형식이나 알고리즘을 확인해 주세요. 공개키 PEM 또는 JWK를 사용해요.'
                      : 'Check the key format and algorithm. Use a public SPKI PEM or JWK.',
                ),
            )
            .finally(() => setBusy(false))
        }}
      >
        {copy.verify}
      </button>
      <p role="status">{status}</p>
    </details>
  )
}
