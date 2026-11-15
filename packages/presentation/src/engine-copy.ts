import type { Detection, MessageFact } from '@decoding/engine'
import { englishEngineCopy, legacyParamFormats } from './engine-copy-catalog'
import type { PresentationLocale } from './locale'
const ko: Record<MessageFact['code'], string> = {
  'diagnostic-worker-certificate': '인증서의 DER 구조를 읽지 못했어요.',
  'diagnostic-worker-layer': '이 겹을 {format}로 읽지 못했어요.',
  'diagnostic-pem-encrypted': '암호화된 비밀 키라 내용을 해석하지 않았어요.',
  'diagnostic-pem-unknown': '종류를 알 수 없는 비밀 키예요.',
  'diagnostic-pem-invalid': '잘못된 비밀 키라 내용을 해석하지 않았어요.',
  'warning-ua-self-reported':
    '브라우저가 스스로 적은 정보예요. 일부를 줄이거나 다르게 적을 수 있어 실제 기기를 확인한 것은 아니에요.',
  'warning-cookie-credential':
    '로그인 값이 들어 있을 수 있어요. 채팅방·AI·다른 사이트에 붙여넣지 마세요.',
  'warning-wallet-unverified':
    '글자의 모양과 확인값만 살펴봤어요. 소유자·잔액·실제 망은 조회하지 않았어요. 같은 주소 모양을 쓰는 다른 망도 있어요.',
  'warning-wallet-checksum-absent':
    '대문자나 소문자 한 가지로만 적혀 있어요. 대소문자를 섞은 확인값이 없는 옛 표기로 읽었어요. 보통의 16진수 자료일 수도 있어요.',
  'warning-hcert-unverified':
    'HC1은 건강 증명서에 쓰는 겉 표기예요. 내용을 읽어도 서명·발급자·자료 틀이나 지금 사용할 수 있는 증명서인지는 확인한 것이 아니에요.',
  'diagnostic-curl-unsupported':
    '이 curl 문법이나 여러 요청을 담은 명령은 여기서 읽을 수 있는 범위를 벗어나요.',
  'diagnostic-curl-unclosed': 'curl 명령의 따옴표나 이어 쓰기가 닫히지 않았어요.',
  'diagnostic-curl-url':
    '글자로 적은 HTTP(S) 주소가 필요해요. 셸 명령이나 변수를 실행해서 주소를 만들지 않아요.',
  'diagnostic-curl-size': 'curl 입력은 1MiB까지 읽을 수 있어요.',
  'diagnostic-curl-argument': 'curl 선택 항목 뒤에 값이 빠져 있어요.',
  'diagnostic-curl-method': 'HTTP 요청 방식을 영문·숫자·밑줄·붙임표로 적어 주세요.',
  'diagnostic-curl-header': '요청 머리말을 이름: 값 형태의 한 줄로 적어 주세요.',
  'diagnostic-curl-file':
    '명령이 기기의 파일을 가리켜요. 파일 내용은 직접 붙여넣어 주세요. 명령을 읽는 과정에서 파일을 열지는 않아요.',
  'warning-curl-text-only': '명령을 글자로만 읽었어요. 셸·파일·서버 요청은 실행하지 않았어요.',
  'warning-curl-unmodeled':
    '선택 항목이나 인자 {optionCount}종류를 해석하지 못했어요. 만들어진 코드를 쓰기 전에 요청을 확인해 주세요.',
  'warning-curl-shell-literal':
    '셸 변수와 명령 치환은 글자로 남아 있어요. 실행해서 값을 만들지 않아요.',
  'warning-curl-file-body': '보낼 내용이 기기의 파일을 가리켜요. 파일 내용은 읽지 않았어요.',
  'photo-read': '사진에서 코드를 읽었어요. 연결되는 곳은 열지 않았어요.',
  'summary-url': '{protocol}//{host}',
  'summary-epoch': '{milliseconds}',
  'summary-format-label': '{label}',
  'warning-url': '{rule}',
  'summary-jwt': '{algorithm} 방식의 토큰이며 내용 항목 {claimCount}개가 있어요.',
  'summary-json': '{kind}의 첫 단계 항목이 {entryCount}개예요.',
  'summary-json-2': 'JSON 문자열 안에 감싼 값이에요.',
  'summary-base64': '{bytes}바이트를 풀었어요. 대부분 읽을 수 있는 문자예요.',
  'summary-base64-2': '{bytes}바이트를 풀었어요.',
  'summary-hex': '{bytes}바이트예요.',
  'summary-url-2': '이름과 값으로 이루어진 주소의 검색 조건이에요.',
  'summary-url-3': '특수 문자를 퍼센트로 적은 글이에요.',
  'summary-uuid-ulid': 'RFC 4122 방식의 UUID 버전 {version}이에요.',
  'summary-uuid-ulid-2': '{milliseconds} 시간을 담아 정렬할 수 있는 식별값이에요.',
  'summary-compression': '압축을 푼 결과가 {expandedBytes}바이트({ratio}:1)에 이르러 멈췄어요.',
  'summary-compression-2': '{compressedBytes}바이트를 {expandedBytes}바이트로 풀었어요.',
  'summary-compression-3': '안전하게 처리할 수 있는 한도에서 압축 풀기를 멈췄어요.',
  'evidence-three-segments': '점으로 나뉜 Base64URL 구간이 세 개예요.',
  'evidence-json-header': '머리글과 내용이 올바른 JSON 객체예요.',
  'evidence-alg': '머리글의 서명 방식은 {algorithm}이에요.',
  'evidence-json-parse': 'JSON 문법에 맞아요.',
  'evidence-alphabet': 'Base64에서 쓰는 문자로 이루어져 있어요.',
  'evidence-decode': '잘못된 바이트 없이 풀 수 있어요.',
  'evidence-printable': '결과의 {printablePercent}%를 읽을 수 있는 문자로 표시할 수 있어요.',
  'evidence-hex-alphabet': '짝수 길이의 16진수예요.',
  'evidence-url-syntax': '주소나 검색 조건의 표기 규칙에 맞아요.',
  'evidence-integer-width': '숫자 길이가 {unit} 단위와 맞아요.',
  'evidence-date-range': '일반적으로 쓰는 날짜 범위 안이에요.',
  'evidence-date-range-2': '일반적으로 쓰는 날짜 범위를 벗어나요.',
  'evidence-uuid-layout': '표준 UUID 배치와 종류에 맞아요.',
  'evidence-ulid-layout': 'Crockford Base32로 된 26자 ULID예요.',
  'evidence-magic': '{format} 시작 표식과 맞아요.',
  'evidence-magic-2': '{format} 시작 표식과 데이터 흐름이 올바라요.',
  'evidence-common': '{label}의 문법과 구조에 맞아요.',
  'rejection-below-auto-threshold': '자동으로 고르기에는 근거가 부족해요.',
  'rejection-lower-ranked': '근거가 더 강한 후보를 골랐어요.',
  'rejection-insufficient-margin': '후보의 근거가 비슷해 자동으로 고르지 않았어요.',
  'warning-jwt-signature-unverified':
    '신뢰할 수 있는 키가 없어 서명이 올바른지는 확인하지 않았어요.',
  'warning-jwt-alg-none': '서명이 없는 토큰이에요. 인증된 값으로 받아들이면 안 돼요.',
  'warning-jwt-no-exp': '숫자로 된 만료 시각이 없어요.',
  'warning-jwt-long-lifetime': '적힌 사용 기간이 24시간을 넘어요.',
  'warning-jwt-remote-key-header': '외부 키 주소가 있어요. 자동으로 열거나 믿지 않아요.',
  'warning-jwt-symmetric-alg':
    'HMAC 방식은 공유 비밀 값이 필요해요. 공개 키를 비밀 값으로 쓰면 안 돼요.',
  'warning-jwt-expired': '만료 시각이 이미 지났어요.',
  'warning-jwt-not-active': '사용 시작 시각이 아직 오지 않았어요.',
  'warning-compression-limit': '압축을 푼 결과가 안전하게 처리할 수 있는 크기를 넘었어요.',
  'warning-local-parser-unavailable':
    '인터넷에 연결해 이 풀이기를 한 번 연 뒤 다시 해 보세요. 앞의 겹과 원본 바이트는 남아 있어요.',
  'diagnostic-auth-header-error': '머리말의 값이 비어 있어요.',
  'diagnostic-auth-header-error-2': '올바른 Base64가 아니에요.',
  'warning-basic-credential':
    'Basic 로그인 값은 되돌릴 수 있어요. 비밀번호는 가렸어요. 노출됐다면 바꿔 주세요.',
  'diagnostic-base-n-error': '채움 문자의 위치가 잘못됐어요.',
  'warning-base32-padding': 'Base32 채움 문자의 위치가 잘못됐어요.',
  'diagnostic-base-n-error-2': '올바른 Ascii85 묶음이 아니에요.',
  'diagnostic-cbor-note': 'CBOR로 알아봤지만 이 화면에 풀이기가 없어요.',
  'diagnostic-cbor-note-2': '웹 풀이기에서 전체 구조를 볼 수 있어요.',
  'diagnostic-common-error': '풀이기가 이 기기에 없어요. 인터넷에 연결한 뒤 다시 해 보세요.',
  'diagnostic-cron-error': 'cron은 칸이 5개나 6개여야 해요.',
  'warning-cron-range': '앞으로 6년 동안 실행 시점이 5개보다 적어요.',
  'diagnostic-cron-error-2': '올바른 5칸·6칸 cron이 아니에요.',
  'diagnostic-data-uri-error': '입력 크기 한도를 넘었어요.',
  'warning-input-limit': 'data URI가 이 기기에서 처리할 입력 한도를 넘었어요.',
  'diagnostic-data-uri-error-2': 'data URI의 문자 표기가 잘못됐어요.',
  'diagnostic-datetime-error': '달력에 없는 날짜예요.',
  'warning-date-invalid': '달력에 없는 날짜예요.',
  'warning-dns-weak-policy':
    '누구나 보낼 수 있게 하거나, 차단 없이 지켜보기만 하는 DNS 정책이에요.',
  'warning-entity-unknown': '알 수 없는 문자 표기는 그대로 두었어요.',
  'warning-unicode-surrogate': '짝이 맞지 않는 유니코드 문자가 있어요.',
  'warning-text-maybe-lost':
    '물음표가 사라진 글자 자리일 수 있어요. 원래 문장 부호였을 수도 있어요.',
  'warning-text-lost': '글자가 이미 사라져 되돌릴 수 없어요. 보낸 쪽에서 다시 받아 주세요.',
  'diagnostic-hash-id-basis': '길이만 보고 추정했어요. 보통의 16진수일 수도 있어요.',
  'diagnostic-hash-id-note': '지문 값은 원래 값으로 되돌릴 수 없어요.',
  'warning-http-no-hsts': 'HSTS 머리말이 없어요. 필요한지는 응답을 보낸 사이트에 따라 달라요.',
  'warning-mail-reply-to': '답장을 받을 주소가 보낸 주소와 달라요.',
  'warning-mail-display-address': '보낸 사람 이름에 적힌 주소와 실제 주소가 달라요.',
  'warning-json-more-nodes': '64개 항목까지만 확인했어요. 그 뒤에도 항목이 있어요.',
  'diagnostic-jwe-note': '내용이 암호화돼 있어 열쇠 없이는 읽을 수 없어요.',
  'warning-k8s-secret-plaintext':
    'Base64는 암호화가 아니에요. 믿을 수 있는 곳에서만 값을 펼쳐 보세요.',
  'warning-kv': '쿠키에 {flag} 설정이 없어요.',
  'warning-photo-location': '사진에 찍은 곳이 들어 있어요. 그대로 올리면 위치가 알려져요.',
  'diagnostic-manual-error':
    '이 겹을 {format}로 풀지 못했어요. 형식을 확인하거나 인터넷에 연결해 풀이기를 한 번 연 뒤 다시 해 보세요.',
  'warning-manual-decode-failed':
    '이 겹을 {format}로 풀지 못했어요. 되돌리면 자동 판별로 돌아가요.',
  'diagnostic-manual-error-2': '이 겹을 {format}로 풀지 못했어요.',
  'warning-mime-charset-unsupported':
    '지원하지 않는 문자셋이에요. 원래 단어와 바이트는 남겼어요. 문자 살펴보기에서 문자셋을 골라 주세요.',
  'diagnostic-msgpack-note':
    'MessagePack 구조로 알아봤지만 전체를 열 수 없어요. 웹 풀이기를 써 주세요.',
  'diagnostic-pem-note': '비밀 키 내용은 가렸어요. 이 키를 바꾸는 것이 좋아요.',
  'warning-private-key-exposed':
    '비밀 키를 붙여넣었어요. 내용은 표시하지 않아요. 키를 바꾸는 것이 좋아요.',
  'diagnostic-pem-error': '올바른 Base64가 아니에요.',
  'diagnostic-pem-error-2': '인증서나 키의 DER 구조를 읽지 못했어요.',
  'warning-pem-der-invalid': 'PEM 겉 표시는 있지만 안의 DER 구조가 올바르지 않아요.',
  'diagnostic-pgp-armor-note': '비밀 키 내용은 가렸어요. 이 키를 바꾸는 것이 좋아요.',
  'warning-private-key-exposed-2': 'PGP 비밀 키를 붙여넣었어요. 내용은 가렸어요.',
  'diagnostic-pgp-armor-error': '겉을 감싼 Base64가 올바르지 않아요.',
  'diagnostic-pgp-armor-note-2': '암호화된 메시지라면 열쇠 없이는 내용을 읽을 수 없어요.',
  'warning-pgp-checksum': '잘렸거나 바뀐 묶음이에요. CRC24 확인값이 맞지 않아요.',
  'diagnostic-protobuf-note': '틀이 없어 항목 이름과 뜻은 알 수 없어요.',
  'warning-idn-confusable':
    '영문과 닮은 그리스·키릴 문자가 들어 있어요. 주소의 각 부분을 확인해 주세요.',
  'diagnostic-punycode-error': 'Punycode 주소를 풀지 못했어요.',
  'diagnostic-saml-error': '압축 풀기 한도를 넘었어요.',
  'warning-compression-limit-2': 'SAML 압축을 푼 결과가 한도를 넘었어요.',
  'diagnostic-saml-error-2': '압축 풀기를 멈췄어요.',
  'warning-compression-limit-3': '압축을 푼 결과가 한도를 넘었어요.',
  'diagnostic-saml-error-3': 'XML 구조가 잘못됐어요.',
  'warning-xml-malformed': 'SAML XML이 완전하지 않아요. 원래 XML은 남겼어요.',
  'warning-saml-expired': 'SAML의 유효 기간이 지났어요.',
  'warning-saml-signature-unverified': '서명이 있다는 것만으로 올바른 서명임을 알 수 없어요.',
  'warning-secret-exposed':
    '{prefix}…로 시작하는 알려진 비밀 값 모양이에요. 노출됐다면 폐기하거나 바꿔 주세요. 일치하지 않아도 안전하다는 뜻은 아니에요.',
  'diagnostic-ssh-key-error': '잘렸거나 구조가 잘못된 공개 키예요.',
  'warning-ssh-truncated': '공개 키가 잘렸거나 구조가 올바르지 않아요.',
  'diagnostic-time-ids-note': '보통의 16진수일 수도 있어요.',
  'diagnostic-toml-note':
    'TOML의 표와 항목 구조예요. 인터넷에 연결해 웹 풀이기를 한 번 열면 전체를 볼 수 있어요.',
  'diagnostic-toml-error': 'TOML 문법이 올바르지 않아요.',
  'warning-toml-invalid': 'TOML 풀이기가 이 문서를 읽지 못했어요.',
  'warning-xml-malformed-2':
    '{line}줄 {column}칸(위치 {offset})에 짝이 맞지 않거나 닫히지 않은 XML 항목이 있어요. XML 안의 명령은 실행하지 않아요.',
  'diagnostic-yaml-note': 'YAML 구조예요. 풀이기가 준비되면 이 기기에서 읽어요.',
  'diagnostic-zstd-note': '이 화면은 zstd 압축을 풀 수 없어요. 웹 풀이기를 써 주세요.',
  'warning-codec-unavailable':
    '이 기기에 풀이기가 없어요. 인터넷에 연결해 웹 풀이기를 한 번 열어 주세요.',
  'diagnostic-zstd-error': '출력 한도를 넘었거나 데이터가 잘못돼 압축 풀기를 멈췄어요.',
  'warning-compression-limit-4': '이 zstd 데이터를 안전하게 풀 수 없어요. 앞의 겹은 남겼어요.',
  'warning-cert-expired': '유효 기간이 지난 인증서예요.',
  'warning-decoder-worker':
    '{format} 문법을 읽지 못했어요. 표시된 위치를 확인해 주세요. 앞의 겹은 남아 있어요.',
}
export function formatEngineMessage(
  fact: MessageFact,
  locale: PresentationLocale = 'en',
  detection?: Pick<Detection, 'label'>,
): string {
  const template = (locale === 'ko' ? ko[fact.code] : undefined) ?? englishEngineCopy[fact.code]
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const value = fact.params?.[key] ?? (key === 'label' ? detection?.label : undefined)
    const style = legacyParamFormats[fact.code]?.[key]
    if (style === 'iso' && typeof value === 'number') return new Date(value).toISOString()
    if (style === 'fixed-one' && typeof value === 'number') return value.toFixed(1)
    if (locale === 'ko' && key === 'kind') return value === 'Array' ? '배열' : '객체'
    if (locale === 'ko' && key === 'unit')
      return (
        (
          {
            seconds: '초',
            milliseconds: '밀리초',
            microseconds: '마이크로초',
            nanoseconds: '나노초',
          } as Record<string, string>
        )[String(value)] ?? String(value)
      )
    return String(value ?? '')
  })
}
export type PresentedDetection = Omit<
  Detection,
  'summary' | 'evidence' | 'warnings' | 'rejection' | 'diagnostics'
> & {
  summary: string
  evidence: Array<Omit<Detection['evidence'][number], 'message'> & { message: string }>
  warnings: Array<Omit<Detection['warnings'][number], 'message'> & { message: string }>
  rejection?: { code: NonNullable<Detection['rejection']>['code']; message: string }
  diagnostics?: Array<{ path: (string | number)[]; message: string }>
}
export function presentDetection(
  detection: Detection,
  locale: PresentationLocale,
): PresentedDetection {
  const { rejection, diagnostics, ...rest } = detection
  return {
    ...rest,
    summary: formatEngineMessage(detection.summary, locale, detection),
    evidence: detection.evidence.map((item) => ({
      ...item,
      message: formatEngineMessage(item.message, locale, detection),
    })),
    warnings: detection.warnings.map((item) => ({
      ...item,
      message: formatEngineMessage(item.message, locale, detection),
    })),
    ...(rejection
      ? {
          rejection: {
            ...rejection,
            message: formatEngineMessage(rejection.message, locale, detection),
          },
        }
      : {}),
    ...(diagnostics
      ? {
          diagnostics: diagnostics.map((item) => ({
            ...item,
            message: formatEngineMessage(item.message, locale, detection),
          })),
        }
      : {}),
  }
}
