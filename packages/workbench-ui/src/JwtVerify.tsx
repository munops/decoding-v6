import { uiMessage } from './ui-copy'
import { useEffect, useRef, useState } from 'preact/hooks'
import { completionMessages } from './completion-messages'
import type { WorkbenchLocale } from './messages'
import { KeyFormatError, verifyJwt } from './jwt-verify'
export function JwtVerify({ token, locale }: { token: string; locale: WorkbenchLocale }) {
  const generation = useRef(0)
  const [key, setKey] = useState(''),
    [status, setStatus] = useState(''),
    [busy, setBusy] = useState(false),
    copy = completionMessages[locale]
  useEffect(() => {
    const clear = () => {
      generation.current += 1
      setBusy(false)
      setKey('')
      setStatus('')
    }
    addEventListener('pagehide', clear)
    return () => {
      generation.current += 1
      removeEventListener('pagehide', clear)
    }
  }, [])
  useEffect(() => {
    generation.current += 1
    setStatus('')
    setBusy(false)
  }, [token])
  return (
    <details class="jwt-verifier">
      <summary>{copy.verify}</summary>
      <p>{copy.keyNotice}</p>
      <label>
        {copy.key}
        <textarea
          value={key}
          onInput={(event) => {
            generation.current += 1
            setKey(event.currentTarget.value)
            setStatus('')
            setBusy(false)
          }}
          spellcheck={false}
          autocomplete="off"
        />
      </label>
      <button
        type="button"
        class="button secondary"
        disabled={!key || busy}
        onClick={() => {
          const current = ++generation.current
          setBusy(true)
          void verifyJwt(token, key)
            .then(
              (ok) => {
                if (current === generation.current)
                  setStatus(ok ? copy.signatureValid : copy.signatureInvalid)
              },
              (error: unknown) => {
                if (current !== generation.current) return
                setStatus(
                  error instanceof KeyFormatError
                    ? locale === 'ko'
                      ? `키 ${error.line}행 ${error.column}열의 형식을 확인해 주세요.`
                      : error.message
                    : uiMessage(
                        locale,
                        'check_the_key_format_and_algorithm_use_a_public_spki_pem_or_jwk',
                      ),
                )
              },
            )
            .finally(() => {
              if (current === generation.current) setBusy(false)
            })
        }}
      >
        {copy.verify}
      </button>
      <p role="status">{status}</p>
    </details>
  )
}
