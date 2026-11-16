export const entryTopicIds = [
  'what-encoding-is-this',
  'decode-qr-before-opening',
  'where-does-this-link-go',
  'is-it-safe-to-paste-jwt',
  'how-to-tell-if-a-string-is-base64',
] as const
export type EntryTopicId = (typeof entryTopicIds)[number]
type Topic = {
  title: string
  lead: string
  why: string
  faq: string
  answer: string
  samples: { id: string; label: string; value: string }[]
  photo?: boolean
  proof?: boolean
}
const en: Record<EntryTopicId, Topic> = {
  'what-encoding-is-this': {
    title: 'What encoding is this string?',
    lead: 'Paste the unfamiliar value below. Read an answer, inspect the evidence and copy the result on this device.',
    why: 'A string can be a wrapped message, an identifier or ordinary text. The decoder compares supported forms and follows reversible layers. Close candidates stay uncertain; unrecognized text is not forced into a format.',
    faq: 'Can every string be decoded?',
    answer:
      'No. A random identifier may contain no hidden text. Encryption needs the correct key, and lost characters cannot be reconstructed by guessing. Inspect alternatives or use a specific local tool.',
    samples: [
      {
        id: 'encoding-base64',
        label: 'Korean wrapped in Base64',
        value: '7JWI64WV7ZWY7IS47JqUIOyEuOqzhA==',
      },
      {
        id: 'encoding-url',
        label: 'A twice-wrapped link',
        value: 'https%253A%252F%252Fexample.test%252Fpath%253Fq%253Dhello',
      },
    ],
  },
  'decode-qr-before-opening': {
    title: 'Read a QR code before opening its link',
    lead: 'Choose or drop a QR image below. Read its text and destination before deciding whether to open it.',
    why: 'A QR image can contain a URL, Wi-Fi settings, text or another value. Reading it does not require visiting its destination. The image is processed locally; a decoded link is not a safety verdict.',
    faq: 'Will reading the QR image open its website?',
    answer:
      'No. The image reader returns the code contents to the same answer card. Server redirects and reputation are not fetched. Use a trusted channel to verify important destinations.',
    photo: true,
    samples: [{ id: 'qr', label: 'Try a local QR image', value: 'https://example.test/qr-demo' }],
  },
  'where-does-this-link-go': {
    title: 'Where does this link go?',
    lead: 'Paste a link below. See its host, embedded destinations and tracking fields without opening the link.',
    why: 'Some links carry another address in a query field or wrap it more than once. Those text layers can be read locally. A destination chosen later by a server cannot be known without contacting that server, which this decoder does not do.',
    faq: 'Does the result prove that a link is safe?',
    answer:
      'No. We inspect the text, not the remote site. A familiar-looking label can still lead elsewhere, and a server may redirect later. Check the actual host and verify sensitive requests independently.',
    samples: [
      {
        id: 'link-embedded',
        label: 'A destination inside a link',
        value: 'https://example.test/go?url=https%3A%2F%2Fdestination.test%2Faccount%3Fx%3D1',
      },
      {
        id: 'link-tracking',
        label: 'A link with tracking fields',
        value: 'https://example.test/article?utm_source=mail&ref=demo',
      },
    ],
  },
  'is-it-safe-to-paste-jwt': {
    title: 'Is it safe to paste a JWT online?',
    lead: 'Treat a live token like a password. Start with this synthetic example and inspect local processing before using your own data.',
    why: 'JWT contents can often be read without a key. A token that still grants access may let another person use an account. Decoding does not verify the signature, issuer, audience or whether a server will accept it.',
    faq: 'Should I paste a live token into a chat or AI tool?',
    answer:
      'No. Use synthetic or expired test values. Keep working tokens out of chats, AI tools, support messages and unknown websites. This page decodes locally; its observation panel has explicit visibility limits.',
    proof: true,
    samples: [
      {
        id: 'jwt-expired',
        label: 'Synthetic expired unsigned token',
        value: 'eyJhbGciOiJub25lIn0.eyJleHAiOjF9.',
      },
    ],
  },
  'how-to-tell-if-a-string-is-base64': {
    title: 'How to tell if a string is Base64',
    lead: 'Try a sample or paste the value below. Inspect the alphabet, padding and decoded bytes instead of relying on its appearance alone.',
    why: 'Base64 uses a constrained alphabet and groups bytes into text characters. Those letters can also form ordinary words or identifiers. Successful byte decoding and readable text strengthen the candidate; they do not establish the sender or safety. Readable text is preferred over another uncertain byte guess; select a different step to inspect it.',
    faq: 'Is Base64 encryption?',
    answer:
      'No. Base64 is reversible wrapping, not secrecy. Anyone with the value can decode it. A token or private document remains sensitive even when wrapped in Base64.',
    samples: [
      { id: 'base64-text', label: 'Hello in Base64', value: 'SGVsbG8=' },
      { id: 'base64-korean', label: 'Korean in Base64', value: '7JWI64WV7ZWY7IS47JqUIOyEuOqzhA==' },
    ],
  },
}
const ko: Record<EntryTopicId, Topic> = {
  'what-encoding-is-this': {
    title: '이 문자열 뭐예요?',
    lead: '모르는 값을 아래에 붙여넣으세요. 이 기기 안에서 답과 판별 까닭을 보고 풀린 값을 복사할 수 있어요.',
    why: '긴 문자열은 글을 감싼 값일 수도, 식별 번호나 보통의 글일 수도 있어요. 지원하는 표기를 견주고 되돌릴 수 있는 겹을 이어서 풀어요. 후보가 비슷하면 확정하지 않고 모르는 값을 억지로 형식에 맞추지 않아요.',
    faq: '모든 문자열을 풀 수 있나요?',
    answer:
      '아니요. 임의로 만든 식별 번호에는 숨은 글이 없을 수 있어요. 암호화는 맞는 열쇠가 필요하고 사라진 글자를 추측해서 되살릴 수는 없어요. 다른 후보나 알맞은 로컬 도구를 살펴보세요.',
    samples: [
      {
        id: 'encoding-base64',
        label: 'Base64로 싼 한글',
        value: '7JWI64WV7ZWY7IS47JqUIOyEuOqzhA==',
      },
      {
        id: 'encoding-url',
        label: '두 번 감싼 주소',
        value: 'https%253A%252F%252Fexample.test%252Fpath%253Fq%253Dhello',
      },
    ],
  },
  'decode-qr-before-opening': {
    title: 'QR 코드, 어디로 연결되나요?',
    lead: '아래에 QR 그림을 고르거나 놓아 주세요. 연결된 곳을 열지 않고 먼저 내용과 주소를 읽어요.',
    why: 'QR에는 주소·와이파이 설정·글처럼 여러 값이 들어갈 수 있어요. 연결된 곳에 방문하지 않아도 내용을 읽을 수 있어요. 그림은 이 기기에서 처리하며 주소가 나왔다고 안전한 곳이라는 뜻은 아니에요.',
    faq: 'QR을 읽으면 사이트가 바로 열리나요?',
    answer:
      '아니요. 같은 답 카드에 내용을 보여 줘요. 서버의 이동 경로나 평판은 조회하지 않아요. 중요한 주소는 믿을 수 있는 다른 경로로 확인하세요.',
    photo: true,
    samples: [
      {
        id: 'qr',
        label: '기기 안에서 만든 QR 그림으로 보기',
        value: 'https://example.test/qr-demo',
      },
    ],
  },
  'where-does-this-link-go': {
    title: '이 링크는 어디로 가나요?',
    lead: '아래에 주소를 붙여넣으세요. 열지 않고 사이트 이름과 안에 든 다른 주소·추적 꼬리표를 읽어요.',
    why: '어떤 링크는 물음표 뒤에 다른 주소를 넣거나 여러 번 감싸요. 글자에 적힌 겹은 기기 안에서 풀 수 있어요. 서버가 나중에 정하는 이동 경로는 서버에 묻지 않으면 알 수 없으며 여기서는 조회하지 않아요.',
    faq: '결과가 나오면 안전한 주소인가요?',
    answer:
      '아니요. 실제 사이트 대신 주소 글자를 살펴본 결과예요. 익숙한 이름처럼 보여도 다른 곳으로 가거나 서버가 나중에 옮길 수 있어요. 실제 사이트 이름을 보고 민감한 요청은 별도로 확인하세요.',
    samples: [
      {
        id: 'link-embedded',
        label: '주소 안에 든 다른 주소',
        value: 'https://example.test/go?url=https%3A%2F%2Fdestination.test%2Faccount%3Fx%3D1',
      },
      {
        id: 'link-tracking',
        label: '추적 꼬리표가 붙은 주소',
        value: 'https://example.test/article?utm_source=mail&ref=demo',
      },
    ],
  },
  'is-it-safe-to-paste-jwt': {
    title: 'JWT를 온라인에 붙여넣어도 되나요?',
    lead: '아직 쓸 수 있는 토큰은 비밀번호처럼 다뤄 주세요. 비밀이 없는 이 시험 예시로 기기 안에서 처리되는지 먼저 살펴보세요.',
    why: 'JWT의 내용은 열쇠 없이도 읽을 수 있는 경우가 많아요. 아직 권한이 있는 토큰을 얻으면 남이 계정을 사용할 수 있어요. 내용을 푼 것으로 서명·발급자·받는 대상이나 서버가 받아 주는 토큰인지를 확인한 것은 아니에요.',
    faq: '살아 있는 토큰을 채팅방이나 AI에 붙여넣어도 되나요?',
    answer:
      '아니요. 만든 시험 값이나 끝난 시험용 토큰을 쓰세요. 실제 토큰은 채팅방·AI 도구·문의 글·모르는 사이트에 붙여넣지 마세요. 이 지면은 기기 안에서 풀며 관측 칸에 확인할 수 있는 범위와 한계를 함께 적어요.',
    proof: true,
    samples: [
      {
        id: 'jwt-expired',
        label: '이미 끝난 서명 없는 시험 토큰',
        value: 'eyJhbGciOiJub25lIn0.eyJleHAiOjF9.',
      },
    ],
  },
  'how-to-tell-if-a-string-is-base64': {
    title: 'Base64인지 어떻게 알 수 있나요?',
    lead: '예시를 눌러 보거나 아래에 값을 붙여넣으세요. 생김새만 보지 않고 쓰인 문자·끝의 채움과 풀린 바이트를 살펴봐요.',
    why: 'Base64는 정해진 문자로 바이트를 묶어 적는 방식이에요. 같은 문자로 보통의 단어나 식별 번호도 만들 수 있어요. 바이트로 풀리고 글자로 읽히면 근거가 강해지지만 보낸 사람이나 안전성을 증명하지는 않아요. 추가로 추측한 바이트보다 읽히는 글을 먼저 보여 드려요. 다른 단계를 눌러 비교할 수도 있어요.',
    faq: 'Base64는 암호화인가요?',
    answer:
      '아니요. 누구나 되돌릴 수 있는 포장 방식이에요. 값이 있으면 누구나 풀 수 있어요. 토큰이나 비공개 문서는 Base64로 감싸도 여전히 민감해요.',
    samples: [
      { id: 'base64-text', label: 'Base64로 적은 Hello', value: 'SGVsbG8=' },
      {
        id: 'base64-korean',
        label: 'Base64로 적은 한글',
        value: '7JWI64WV7ZWY7IS47JqUIOyEuOqzhA==',
      },
    ],
  },
}
export function entryTopicCopy(id: EntryTopicId, locale: 'en' | 'ko') {
  return {
    ...(locale === 'ko' ? ko : en)[id],
    examples: locale === 'ko' ? '예시로 미리 보기' : 'Try an example',
    whyTitle: locale === 'ko' ? '어떻게 읽나요?' : 'How this works',
  }
}
