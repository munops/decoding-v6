import { formatEngineMessage } from './engine-copy'
import type { ChainNode, Detection, LintWarning } from '@decoding/engine'
import type { PresentationLocale as WorkbenchLocale } from './locale'

const en = {
  cookieSentence:
    'These are cookies: values a site asks your browser to remember so it can recognize you.',
  colorPreview: 'Color preview',
  barcodeUnavailable:
    'This browser cannot read linear barcodes. If no QR was found, the photo is inspected as a file.',
  title: 'decod.ing — Paste anything. See what it is.',
  footer: 'Unknown text. Clear answers. On this device.',
  largeText: 'Larger text',
  normalText: 'Standard text',
  dark: 'Dark appearance',
  light: 'Light appearance',
  numberAlternative: 'This may also be an ordinary number, phone number or order number.',
  manual: 'Choose a decoding method',
  inspect: 'Inspect each character',
  final: 'Decoded value',
  copy: 'Copy decoded value',
  facts: 'What we found',
  layers: 'How it was decoded',
  details: 'Details and advanced tools',
  concerns: 'Things to check',
  none: 'No concerns were found.',
  uncertain: 'This is not certain.',
  alternate: 'Other possibilities',
  plain: 'This is ordinary text. There is nothing wrapped around it to decode.',
  unknown:
    'We could not identify this value. We compared {count} supported formats without finding a clear match.',
  size: 'Size',
  expiry: 'Expires',
  issued: 'Created',
  owner: 'Belongs to',
  destination: 'Destination',
  fields: 'Fields',
  bytes: 'bytes',
  empty: 'Paste a value to begin.',
  photo: 'Photo / QR',
  more: 'More',
  decode: 'Decode',
  saved: 'Saved',
  tools: 'Tools',
  summary: 'Paste an unfamiliar value here.',
  lead: 'Unknown text, garbled letters, long links or a QR photo. Find out what it is and decode every layer on this device.',
  examples: 'Does one of these look familiar? Try an example.',
  local: 'Only on this device',
  placeholder: 'Tap here and paste',
  sampleBroken: 'Garbled text',
  sampleLink: 'Long link',
  sampleToken: 'Login token',
  sampleNested: 'Several layers',
  sampleMail: 'Mail subject',
  sampleTime: 'Ten-digit number',
  sampleQr: 'QR photo',
  moreHeading: 'Make this work for you',
  offline: 'Home screen and offline use',
  share: 'Send from another app',
  display: 'Text and appearance',
  language: 'Language',
  support: 'Contact us',
  privacy: 'Privacy and terms',
  method: 'How decoding works',
}
const ko: typeof en = {
  cookieSentence: '사이트가 나를 알아보려고 브라우저에 둔 값이에요.',
  colorPreview: '색 견본',
  barcodeUnavailable:
    '이 브라우저에서는 막대 바코드를 못 읽어요. QR이 없다면 사진 파일 정보를 보여 줘요.',
  title: 'decod.ing — 이게 뭔지 모르겠다면 붙여넣으세요',
  footer: '모르는 글자를 이 기기 안에서 풀어요.',
  largeText: '글자 크게',
  normalText: '기본 글자 크기',
  dark: '어두운 화면',
  light: '밝은 화면',
  numberAlternative: '그냥 숫자, 전화번호·주문번호일 수도 있어요.',
  manual: '풀 방법을 직접 고르기',
  inspect: '글자 하나하나 살펴보기',
  final: '풀린 값',
  copy: '풀린 값 복사',
  facts: '알게 된 것',
  layers: '어떻게 풀었나',
  details: '자세히 · 고급 도구',
  concerns: '조심할 점',
  none: '조심할 점은 찾지 못했어요',
  uncertain: '확실하지는 않아요.',
  alternate: '다른 가능성',
  plain: '싸여 있지 않은 그냥 글이에요. 풀 것이 없다는 뜻이에요.',
  unknown:
    '아직 알아보지 못한 값이에요. 아는 형식 {count}가지와 맞춰 봤지만 확실한 것이 없었어요. 틀린 답을 지어내지 않아요.',
  size: '크기',
  expiry: '끝나는 때',
  issued: '만든 때',
  owner: '누구 것',
  destination: '가는 곳',
  fields: '칸 수',
  bytes: '바이트',
  empty: '값을 붙여넣으면 시작해요.',
  photo: '사진·QR',
  more: '더보기',
  decode: '풀기',
  saved: '넣어 둔 것',
  tools: '도구',
  summary: '이게 뭔지 모르겠다면 여기에 붙여넣으세요',
  lead: '알 수 없는 글자, 깨진 한글, 긴 주소, QR 사진. 무엇인지 알려 드리고 끝까지 풀어 드려요.',
  examples: '이런 걸 들고 오셨나요? 눌러서 미리 보기',
  local: '내 기기 안에서만',
  placeholder: '여기를 눌러 붙여넣기',
  sampleBroken: '깨진 글자',
  sampleLink: '긴 주소',
  sampleToken: '로그인 토큰',
  sampleNested: '여러 겹 싸인 값',
  sampleMail: '메일 제목',
  sampleTime: '숫자 열 자리',
  sampleQr: 'QR 사진',
  moreHeading: '나에게 맞게 쓰기',
  offline: '홈 화면에 두기·인터넷 없이 쓰기',
  share: '다른 앱에서 바로 보내기',
  display: '글자 크게·어두운 화면',
  language: '언어',
  support: '문의',
  privacy: '개인정보·약관',
  method: '푸는 방법 설명',
}
export function answerMessages(locale: WorkbenchLocale) {
  return locale === 'ko' ? ko : en
}

// One authored sentence per detector. EN is also the six technical-beta fallback.
const sentences: Record<string, [string, string]> = {
  'auth-header': [
    'This is a login header. Its contents are readable, so keep them private.',
    '로그인할 때 보내는 머리말이에요. 안을 읽을 수 있으니 다른 곳에 붙여넣지 마세요.',
  ],
  datetime: [
    'This is a date and time, written with its time-zone information.',
    '날짜와 시간을 적은 값이에요. 시간대도 함께 살펴봤어요.',
  ],
  'html-entities': [
    'These are characters written as HTML references. We restored the text.',
    'HTML에서 쓰는 문자 표기예요. 원래 글자로 되돌렸어요.',
  ],
  'unicode-escapes': [
    'These are characters written with backslash escapes. We restored the text.',
    '백슬래시로 글자를 적은 거예요. 원래 글자로 되돌렸어요.',
  ],
  pem: [
    'This is a certificate or key wrapped in PEM. Private key contents stay hidden.',
    '인증서나 키를 PEM으로 싼 값이에요. 개인키의 내용은 가려요.',
  ],
  'ssh-key': [
    'This is an SSH public key. Its fingerprint identifies the key.',
    'SSH 공개키예요. 지문 값으로 같은 키인지 견줄 수 있어요.',
  ],
  ip: [
    'This is an IP address. We show its notation and address range.',
    'IP 주소예요. 주소의 표기와 쓰이는 범위를 살펴봤어요.',
  ],
  'octal-bytes': [
    'This writes bytes as octal numbers. We decoded the next layer.',
    '글자를 8진수로 적은 거예요. 한 겹 풀었어요.',
  ],
  'user-agent': [
    "This is a browser's self-description. It reports {browser} {version} on {device}.",
    '브라우저가 자기를 소개하는 글이에요. {device}의 {browser} {version}이라고 적혀 있어요.',
  ],
  color: [
    'This is a color value. Here is the color and other ways to write it.',
    '색을 적은 값이에요. 색 견본과 다른 적는 법을 보여 드려요.',
  ],
  'bitcoin-address': [
    'This looks like a Bitcoin-family address. Its text checksum matches; this does not verify the owner or funds.',
    '비트코인 계열 지갑 주소로 보여요. 글자의 확인값은 맞지만 소유자나 잔액을 확인한 것은 아니에요.',
  ],
  'ethereum-address': [
    'This looks like an Ethereum-style address. Other EVM networks use the same form, so the network cannot be inferred from it.',
    '이더리움 계열 지갑 주소로 보여요. 같은 모양을 쓰는 다른 EVM 망도 있어 어느 망인지는 확정할 수 없어요.',
  ],
  base45: [
    'This value was wrapped in Base45. We decoded the next layer.',
    'Base45로 싼 값이에요. 한 겹 풀었어요.',
  ],
  'binary-bytes': [
    'This writes bytes using zeros and ones. We decoded the next layer.',
    '글자를 0과 1로 적은 거예요. 한 겹 풀었어요.',
  ],
  cron: [
    'This is a schedule expression. It describes when a task should run.',
    '작업을 언제 할지 적은 예약식이에요.',
  ],
  punycode: [
    'This is an international domain name written in Punycode. Inspect the letters carefully.',
    '여러 나라 글자로 된 사이트 이름을 Punycode로 적은 거예요. 글자를 하나씩 확인해 주세요.',
  ],
  mime: [
    'A mail subject arrived without its character encoding being decoded.',
    '메일 제목이 풀리지 않은 채로 온 거예요.',
  ],
  kv: [
    'This groups names and values, as a query string or cookie does.',
    '이름과 값을 묶어 적은 거예요. 주소의 검색 조건이나 쿠키에 쓰여요.',
  ],
  env: [
    'This is a list of environment settings. Secret-looking fields stay hidden.',
    '환경 설정을 이름과 값으로 적은 거예요. 비밀로 보이는 칸은 가려요.',
  ],
  base32: [
    'This value was wrapped in Base32. We decoded the next layer.',
    'Base32로 싼 값이에요. 한 겹 풀었어요.',
  ],
  base58: [
    'This looks like Base58. Several kinds of data use this alphabet.',
    'Base58로 보여요. 여러 종류의 값이 이 글자 표기를 써요.',
  ],
  ascii85: [
    'This value was wrapped in Ascii85. We decoded the next layer.',
    'Ascii85로 싼 값이에요. 한 겹 풀었어요.',
  ],
  hash: [
    'This looks like a hash. Hashes cannot be decoded back to their original text.',
    '지문 값(해시)으로 보여요. 되돌려 풀 수 있는 값이 아니에요.',
  ],
  'secret-patterns': [
    'This looks like a private credential. Keep it out of chats and other websites.',
    '로그인에 쓰는 비밀 값으로 보여요. 채팅방이나 다른 사이트에 붙여넣지 마세요.',
  ],
  jwe: [
    'This is an encrypted login token (JWE). Reading the contents requires its key.',
    '암호화된 로그인 토큰(JWE)이에요. 안을 읽으려면 열쇠가 필요해요.',
  ],
  'http-headers': [
    'These are message headers, describing who sent data and how to read it.',
    '메시지의 머리말이에요. 보낸 곳과 읽는 방법 등이 적혀 있어요.',
  ],
  'dns-txt': [
    'This is a mail-domain policy. It describes which senders a domain trusts.',
    '메일을 누가 보낼 수 있는지 적은 사이트의 정책이에요.',
  ],
  yaml: [
    'This is structured data written as YAML.',
    '이름과 값을 YAML 방식으로 묶어 적은 자료예요.',
  ],
  xml: [
    'This is structured data written between XML tags.',
    'XML 꼬리표 사이에 자료를 묶어 적은 거예요.',
  ],
  'k8s-secret': [
    'This is a Kubernetes Secret. Base64 wrapping is not encryption.',
    'Kubernetes의 비밀 설정이에요. Base64로 싸는 것은 암호화가 아니에요.',
  ],
  'json-deep': [
    'This is JSON containing fields that are themselves encoded.',
    'JSON 자료 안에 다시 싸인 값이 들어 있어요.',
  ],
  'text-scan': [
    'This text contains values that can be inspected separately.',
    '글 안에 따로 풀어 볼 수 있는 값이 들어 있어요.',
  ],
  mojibake: [
    'Garbled text can be reversed into readable letters.',
    '되돌릴 수 있는 깨진 글자예요. 원래 글로 되돌렸어요.',
  ],
  'unicode-normalization': [
    'The Korean letters were separated. We joined them again.',
    '자음과 모음이 따로 떨어진 한글이에요. 다시 붙였어요. 맥에서 만든 파일 이름이 윈도우로 가면 생기는 일이에요.',
  ],
  'damaged-text': [
    'Some characters have already been lost. Ask the sender for the original.',
    '이미 글자가 사라진 깨짐이에요. 되돌릴 수 없어요. 보낸 쪽에서 다시 받아야 해요.',
  ],
  'pgp-armor': [
    'This is data wrapped in PGP armor. Reading encrypted content requires a key.',
    'PGP로 싼 자료예요. 암호화된 내용이라면 열쇠가 있어야 읽을 수 있어요.',
  ],
  'data-uri': [
    'This embeds a file inside a text value called a data URI.',
    '파일을 data URI라는 글자 값 안에 담은 거예요.',
  ],
  zstd: [
    'This is Zstandard-compressed data. We unpack it locally.',
    'Zstandard로 압축한 자료예요. 기기 안에서 압축을 풀어요.',
  ],
  msgpack: [
    'This looks like MessagePack, a compact way of storing structured data.',
    '자료를 작게 담는 MessagePack 형식으로 보여요.',
  ],
  cbor: [
    'This is CBOR, a compact binary representation of data.',
    '자료를 작은 바이트로 담는 CBOR 형식이에요.',
  ],
  protobuf: [
    'This looks like Protobuf. Without its schema, field names are unknown.',
    'Protobuf로 보여요. 틀이 없어 칸의 이름은 알 수 없어요.',
  ],
  saml: [
    'This is a SAML login message. Decoding does not verify its signature.',
    'SAML 로그인 메시지예요. 내용을 푸는 것만으로 서명이 확인되지는 않아요.',
  ],
  toml: ['This is configuration data written as TOML.', '설정을 TOML 방식으로 적은 자료예요.'],
  'magic-bytes': [
    'This is a file. We identified its type from its opening bytes.',
    '파일이에요. 맨 앞의 바이트로 종류를 알아봤어요.',
  ],
  jwt: [
    'This is a login token (JWT). Decoding does not prove who issued it.',
    '로그인 토큰(JWT)이에요. 내용을 푼 것만으로 누가 만들었는지 확인되지는 않아요.',
  ],
  base64: [
    'This value was wrapped in Base64. We decoded the next layer.',
    'Base64로 싼 값이에요. 한 겹 풀었어요.',
  ],
  json: ['This is JSON, which groups names and values.', '이름과 값을 묶어 적은 자료(JSON)예요.'],
  hex: ['These are bytes written as hexadecimal.', '바이트를 16진수로 적은 거예요.'],
  url: [
    'This is a link or text written with URL escapes. We inspect it without opening it.',
    '주소나 주소용 글자 표기예요. 열지 않고 내용을 살펴봤어요.',
  ],
  epoch: [
    'This number records a point in time. We converted it to a date.',
    '시간을 숫자로 적은 거예요. 날짜로 바꿨어요.',
  ],
  'uuid-ulid': [
    'This is an identifier. It names something rather than hiding text.',
    '대상을 구별하는 식별값이에요. 글을 숨겨 놓은 값은 아니에요.',
  ],
  compression: [
    'This is compressed data. We unpack it locally within safe size limits.',
    '압축한 자료예요. 크기 한도 안에서 기기 안에서 풀어요.',
  ],
}
export const summaryFormats = Object.keys(sentences)
export function primaryLayers(root: ChainNode): ChainNode[] {
  const layers: ChainNode[] = []
  let node: ChainNode | undefined = root
  while (node) {
    if (node.selected) layers.push(node)
    node = node.children.find((child) => !child.sourcePath)
  }
  return layers
}
export function answerSentence(root: ChainNode, locale: WorkbenchLocale, source: string): string {
  const layers = primaryLayers(root),
    first = root.selected ?? root.candidates[0]
  if (!first)
    return /\s|[가-힣]/.test(source)
      ? answerMessages(locale).plain
      : answerMessages(locale).unknown.replace('{count}', String(summaryFormats.length))
  const ko = locale === 'ko'
  let sentence = sentences[first.detector]?.[ko ? 1 : 0] ?? first.label
  if (first.detector === 'kv' && first.label === 'Cookie header')
    sentence = answerMessages(locale).cookieSentence
  if (first.detector === 'user-agent') {
    const value = first.value as Record<string, unknown>
    sentence = sentence.replace(/\{(browser|version|device)\}/g, (_, key: string) =>
      String(value[key] ?? ''),
    )
  }
  if (first.metadata?.photoRead) {
    sentence = ko
      ? `사진에서 ${first.metadata.photoRead}을 읽었어요. 연결된 곳을 열지 않고 먼저 보여 드려요.`
      : `We read ${first.metadata.photoRead} from the photo without opening its destination.`
    if (root.children[0]?.selected)
      sentence += ` ${answerSentence(root.children[0], locale, source)}`
  } else if (
    first.detector === 'damaged-text' &&
    first.metadata?.placeholders &&
    !first.metadata.replacementCount
  ) {
    sentence = ko
      ? '물음표가 사라진 글자 자리일 수 있어요. 이미 글자가 사라졌다면 되돌릴 수 없어요.'
      : 'These question marks may stand for missing characters. Already lost characters cannot be recovered.'
  } else if (first.detector === 'url' && first.metadata?.charset === 'euc-kr') {
    sentence = ko
      ? '옛 방식(EUC-KR) 한글을 %로 바꿔 적은 거예요.'
      : 'This is Korean text percent-encoded using EUC-KR.'
  } else if (first.detector === 'http-headers' && first.metadata?.kind === 'mail') {
    sentence = ko
      ? '메일 머리말이에요. 보낸 곳과 제목, 거쳐 온 곳을 살펴봤어요.'
      : 'These are mail headers. We inspected the sender, subject and delivery hops.'
  } else if (first.detector === 'url' && first.metadata?.redirect) {
    const host = (first.value as { host?: string }).host
    sentence = ko
      ? `${host} 주소 안에 ${first.metadata.destination} 쪽으로 가는 주소가 들어 있어요. 실제 서버 이동은 조회하지 않았어요.`
      : `The ${host} address contains a destination at ${first.metadata.destination}. No server redirect was requested.`
  } else if (first.detector === 'jwt') {
    const payload = (first.value as { payload?: { exp?: unknown } })?.payload
    if (typeof payload?.exp === 'number') {
      const elapsed = Date.now() / 1000 - payload.exp
      const days = Math.max(0, Math.floor(Math.abs(elapsed) / 86400))
      sentence = ko
        ? `로그인 토큰(JWT)이에요. ${elapsed > 0 ? `${days}일 전에 이미 끝났어요.` : `${days}일 뒤에 끝나요.`}`
        : `This is a login token (JWT). It ${elapsed > 0 ? `expired ${days} days ago` : `expires in ${days} days`}.`
    }
  } else if (layers.length > 1) {
    const last = layers.at(-1)!.selected!
    const inside =
      last.detector === 'json'
        ? ko
          ? '이름과 값을 묶어 적은 자료(JSON)'
          : 'JSON data'
        : last.label
    sentence = ko
      ? `${layers.length}겹으로 싸여 있었어요. 속은 ${inside}예요.`
      : `There were ${layers.length} layers. Inside is ${inside}.`
  } else if (first.detector === 'json' && first.value && typeof first.value === 'object') {
    const count = Object.keys(first.value).length
    sentence += ko ? ` 칸이 ${count}개 있어요.` : ` It has ${count} fields.`
  } else if (first.detector === 'hash') {
    const algorithm = (first.value as { possibleAlgorithm?: string }).possibleAlgorithm
    if (algorithm)
      sentence = ko
        ? `지문 값(해시)으로 보여요. 길이가 ${algorithm}와 같아요. 되돌려 풀 수 있는 값이 아니에요.`
        : `This looks like a hash with the same length as ${algorithm}. It cannot be decoded back to its original text.`
  }
  return `${sentence}${layers.some((layer) => layer.status === 'ambiguous') ? ` ${answerMessages(locale).uncertain}` : ''}`
}
const warningTitles: Record<string, [string, string]> = {
  'PHOTO-LOCATION': [
    'This photo contains its location. Sharing the file can reveal where it was taken.',
    '이 사진에는 찍은 곳이 들어 있어요. 그대로 올리면 위치가 알려져요.',
  ],
  'URL-REDIRECT': [
    'The outer and embedded destinations differ.',
    '겉 주소와 안에 든 주소의 사이트가 달라요.',
  ],
  'URL-NO-TLS': ['This address uses unencrypted HTTP.', '잠기지 않은 HTTP 주소예요.'],
  'URL-IP-HOST': [
    'This address uses numbers instead of a site name.',
    '사이트 이름 대신 숫자로 된 주소예요.',
  ],
  'URL-USERINFO': [
    'The part before @ is not the destination.',
    '주소 앞에 다른 이름이 붙어 있어요. @ 앞은 가는 곳이 아니에요.',
  ],
  'URL-PERSONAL': [
    'Sharing this address also shares personal fields.',
    '주소에 사람 정보가 들어 있어요. 남에게 보내면 같이 넘어가요.',
  ],
  'OTP-SECRET': [
    'This secret can generate your authentication codes. Do not share it.',
    '인증 앱에 넣는 비밀 값이에요. 이 값을 아는 사람은 내 인증 번호를 만들 수 있어요.',
  ],

  'TEXT-LOST': [
    'Missing characters cannot be reconstructed.',
    '사라진 글자는 되돌릴 수 없어요. 보낸 쪽에 원본을 요청하세요.',
  ],
  'MAIL-REPLY-TO': [
    'Replies go to a different address from the sender.',
    '답장은 보낸 곳과 다른 주소로 가요.',
  ],
  'MAIL-DISPLAY-ADDRESS': [
    'The displayed address differs from the actual sender address.',
    '보낸 사람 이름에 적힌 주소와 실제 주소가 달라요.',
  ],
  'JWT-LONG-LIFETIME': [
    'This token lasts for more than a day.',
    '하루 넘게 쓸 수 있는 토큰이에요.',
  ],
  'JWT-REMOTE-KEY-HEADER': [
    'This token refers to a remote key. We do not request it.',
    '토큰에 외부 키 주소가 있어요. 그 주소에 요청하지 않아요.',
  ],
  'JWT-SYMMETRIC-ALG': [
    'Verification needs the same secret used to sign this token.',
    '서명할 때 쓴 비밀 값이 있어야 확인할 수 있어요.',
  ],
  'DATE-INVALID': ['This date is not valid.', '실제로 없는 날짜예요.'],
  'ENTITY-UNKNOWN': [
    'Some character references could not be decoded.',
    '풀 수 없는 문자 표기가 들어 있어요.',
  ],
  'UNICODE-SURROGATE': [
    'Part of a Unicode character is missing.',
    '유니코드 글자의 짝이 빠져 있어요.',
  ],
  'BASE32-PADDING': ['The Base32 padding is not valid.', 'Base32 끝의 채움 글자가 맞지 않아요.'],
  'XML-MALFORMED': [
    'The XML tags do not form a complete document.',
    'XML 꼬리표의 짝이나 문법이 맞지 않아요.',
  ],
  'PEM-DER-INVALID': [
    'We could not read the certificate data inside this wrapper.',
    '안에 든 인증서 자료를 읽지 못했어요.',
  ],
  'SSH-TRUNCATED': ['This SSH key appears incomplete.', 'SSH 키의 일부가 빠져 있어요.'],
  'PGP-CHECKSUM': ['The PGP data failed its checksum.', 'PGP 자료가 변했거나 일부가 빠져 있어요.'],
  'TOML-INVALID': ['This TOML data could not be parsed.', 'TOML 자료의 문법을 읽지 못했어요.'],
  'MANUAL-DECODE-FAILED': [
    'This layer does not match the method you chose.',
    '고른 풀이 방법과 이 겹의 형식이 맞지 않아요.',
  ],
  'CODEC-UNAVAILABLE': [
    'This decoder is unavailable on this surface.',
    '이 화면에서는 이 풀이기를 쓸 수 없어요.',
  ],
  'INPUT-LIMIT': [
    'This input exceeds the local size limit.',
    '기기에서 풀 수 있는 크기를 넘었어요.',
  ],
  'JSON-MORE-NODES': [
    'There are more fields than the scan limit allows.',
    '살펴볼 수 있는 수보다 칸이 더 많아요.',
  ],
  'CRON-RANGE': [
    'We stopped searching for a future scheduled time.',
    '다음 예약 시간을 찾는 범위를 넘었어요.',
  ],
  'COOKIE-NO-SECURE': [
    'This cookie has no Secure flag.',
    '이 쿠키에는 암호화된 연결에서만 쓰라는 표시가 없어요.',
  ],
  'COOKIE-NO-HTTPONLY': [
    'This cookie has no HttpOnly flag.',
    '이 쿠키는 화면의 스크립트가 읽을 수 있어요.',
  ],
  'COOKIE-NO-SAMESITE': [
    'This cookie has no SameSite flag.',
    '이 쿠키에는 다른 사이트에서 보낼 때의 제한이 없어요.',
  ],
  'HTTP-NO-HSTS': [
    'This response has no HSTS header. Context still matters.',
    '이 응답에는 HTTPS를 계속 쓰라는 표시가 없어요.',
  ],
  'DNS-WEAK-POLICY': [
    'This mail policy permits broad or unverified sending.',
    '메일을 보낼 수 있는 조건이 느슨해요.',
  ],
  'K8S-SECRET-PLAINTEXT': [
    'Base64 wrapping does not encrypt a Kubernetes secret.',
    'Base64로 싼 비밀 값은 누구나 풀 수 있어요.',
  ],
  'SAML-EXPIRED': [
    'This SAML login message has expired.',
    '이 SAML 로그인 메시지는 이미 끝났어요.',
  ],
  'SAML-SIGNATURE-UNVERIFIED': [
    'We have not verified the SAML signature.',
    'SAML 서명이 올바른지 확인하지 않았어요.',
  ],
  'JWT-EXPIRED': ['This token has expired.', '이미 끝난 로그인 토큰이에요.'],
  'JWT-ALG-NONE': ['This token has no signature.', '서명이 없는 토큰이에요.'],
  'JWT-SIGNATURE-UNVERIFIED': [
    'We have not verified who issued this token.',
    '누가 만든 토큰인지 확인하지 않았어요.',
  ],
  'JWT-NO-EXP': ['This token has no expiry time.', '끝나는 때가 없는 토큰이에요.'],
  'JWT-NOT-ACTIVE': ['This token is not active yet.', '아직 쓸 수 없는 토큰이에요.'],
  'PRIVATE-KEY-EXPOSED': [
    'This is a private key. Its contents stay hidden.',
    '개인키예요. 내용은 가려 두었어요.',
  ],
  'SECRET-EXPOSED': [
    'Do not paste this credential elsewhere.',
    '이 비밀 값을 다른 곳에 붙여넣지 마세요.',
  ],
  'BASIC-CREDENTIAL': [
    'This login value is readable, not encrypted.',
    '읽을 수 있는 로그인 값이에요. 암호화된 값이 아니에요.',
  ],
  'IDN-CONFUSABLE': [
    'Some letters in this address can be confused with other letters.',
    '글자를 바꿔 적은 주소예요.',
  ],
  'COMPRESSION-LIMIT': [
    'We stopped before expanding too much data.',
    '자료가 너무 커지기 전에 풀기를 멈췄어요.',
  ],
  'LOCAL-PARSER-UNAVAILABLE': [
    'This decoder has not been downloaded yet.',
    '이 풀이기는 아직 받아 두지 못했어요.',
  ],
  'CERT-EXPIRED': ['This certificate has expired.', '이미 끝난 인증서예요.'],
  'MIME-CHARSET-UNSUPPORTED': [
    'Your browser does not support this character set.',
    '이 브라우저가 읽지 못하는 문자 방식이에요.',
  ],
}
export function warningTitle(warning: LintWarning, locale: WorkbenchLocale) {
  if (warning.message.code === 'warning-text-maybe-lost')
    return formatEngineMessage(warning.message, locale)
  return (
    warningTitles[warning.ruleId]?.[locale === 'ko' ? 1 : 0] ??
    formatEngineMessage(warning.message, locale)
  )
}
export function answerFacts(
  detection: Detection | undefined,
  locale: WorkbenchLocale,
): Array<[string, string]> {
  if (detection?.metadata?.photoRead)
    return [
      [
        locale === 'ko' ? '사진 크기' : 'Photo dimensions',
        `${detection.metadata.width} × ${detection.metadata.height}`,
      ],
    ]
  if (detection?.detector === 'mojibake')
    return [
      [
        locale === 'ko' ? '깨진 까닭' : 'Encoding path',
        `${detection.metadata?.charset} → ${detection.metadata?.misreadAs}`,
      ],
      ...(Array.isArray(detection.metadata?.alternatives) && detection.metadata.alternatives.length
        ? [
            [
              locale === 'ko' ? '다른 읽기 방식' : 'Other possible encodings',
              detection.metadata.alternatives.join(', '),
            ] as [string, string],
          ]
        : []),
    ]
  if (!detection || !detection.value || typeof detection.value !== 'object') return []
  const value = detection.value as Record<string, unknown>,
    copy = answerMessages(locale),
    rows: Array<[string, string]> = []
  if (detection.detector === 'kv' && Array.isArray(value.entries))
    return [[copy.fields, String(value.entries.length)]]
  if (detection.detector === 'ethereum-address')
    return [
      [locale === 'ko' ? '주소 모양' : 'Address format', 'Ethereum / EVM'],
      [
        locale === 'ko' ? '대소문자 확인값' : 'Mixed-case checksum',
        value.checksum === 'valid'
          ? locale === 'ko'
            ? '일치'
            : 'Matches'
          : locale === 'ko'
            ? '확인값 없는 표기'
            : 'Not supplied',
      ],
    ]
  if (detection.detector === 'bitcoin-address')
    return [
      [locale === 'ko' ? '주소 표기' : 'Address format', String(value.encoding)],
      [locale === 'ko' ? '망 표기' : 'Network format', String(value.network)],
    ]
  if (detection.detector === 'user-agent')
    return [
      ['브라우저', 'Browser'],
      ['버전', 'Version'],
      ['운영체제', 'Operating system'],
      ['기기', 'Device'],
    ].map((labels, i) => [
      labels[locale === 'ko' ? 0 : 1]!,
      String(value[['browser', 'version', 'os', 'device'][i]!] ?? ''),
    ])
  const payload = (
    value.payload && typeof value.payload === 'object' ? value.payload : value
  ) as Record<string, unknown>
  for (const [key, label] of [
    ['exp', copy.expiry],
    ['iat', copy.issued],
  ] as const)
    if (typeof payload[key] === 'number') {
      const date = new Date(payload[key] * 1000)
      if (Number.isFinite(date.getTime())) rows.push([label, date.toLocaleString(locale)])
    }
  if (detection.metadata?.kind === 'mail') {
    rows.push(
      [locale === 'ko' ? '보낸 곳' : 'Sender', String(detection.metadata.sender)],
      [
        locale === 'ko' ? '거쳐 온 서버 수' : 'Delivery hops',
        String(detection.metadata.receivedCount),
      ],
      [locale === 'ko' ? '제목' : 'Subject', String(detection.metadata.subject)],
    )
  }
  if (typeof value.width === 'number' && typeof value.height === 'number')
    rows.push([
      locale === 'ko' ? '사진 크기' : 'Photo dimensions',
      `${value.width} × ${value.height}`,
    ])
  if (typeof value.camera === 'string')
    rows.push([locale === 'ko' ? '기기' : 'Camera', value.camera])
  if (typeof value.takenAt === 'string')
    rows.push([locale === 'ko' ? '찍은 때' : 'Photo timestamp', value.takenAt])
  if (value.gps && typeof value.gps === 'object')
    rows.push([locale === 'ko' ? '찍은 곳' : 'Photo location', JSON.stringify(value.gps)])
  if (Array.isArray(value.entries))
    rows.push([
      locale === 'ko'
        ? '압축 안 파일 (최대 1,000개, 풀지 않음)'
        : 'Archive names (up to 1,000; not extracted)',
      value.entries.join('\n'),
    ])
  if (typeof payload.iss === 'string') rows.push([copy.owner, payload.iss])
  if (typeof detection.metadata?.trackingCount === 'number')
    rows.push([
      locale === 'ko' ? '뗀 꼬리표 수' : 'Tracking fields removed',
      String(detection.metadata.trackingCount),
    ])
  if (typeof detection.metadata?.destination === 'string')
    rows.push([
      locale === 'ko' ? '안에 든 이동 대상' : 'Embedded destination',
      detection.metadata.destination,
    ])
  if (typeof value.host === 'string') rows.push([copy.destination, value.host])
  if (typeof value.iso === 'string')
    rows.push([copy.issued, new Date(value.iso).toLocaleString(locale)])
  if (detection.detector === 'json') rows.push([copy.fields, String(Object.keys(value).length)])
  return rows
}
