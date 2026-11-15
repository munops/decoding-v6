const garble = (value: string) =>
  new TextDecoder('windows-1252').decode(new TextEncoder().encode(value))
const base64 = (value: string) =>
  btoa(Array.from(new TextEncoder().encode(value), (b) => String.fromCharCode(b)).join(''))
export const recoveryIds = [
  'fix-garbled-text',
  'decode-mail-subject',
  'normalize-korean-filename',
] as const
export type RecoveryId = (typeof recoveryIds)[number]
const examples = {
  'fix-garbled-text': [
    ['안녕하세요', garble('안녕하세요')],
    ['한글 변환', 'ÇÑ±Û º¯È¯'],
    ['café', garble('café')],
  ],
  'decode-mail-subject': ['한글 제목', '안내 메일', '회의 일정'].map((value) => [
    value,
    `=?UTF-8?B?${base64(value)}?=`,
  ]),
  'normalize-korean-filename': ['한글 파일.txt', '여행 사진.jpg', '회의 자료.pdf'].map((value) => [
    value,
    value.normalize('NFD'),
  ]),
}
const en = {
  examplesTitle: 'Three real examples',
  before: 'Received value',
  after: 'Decoded result',
  try: 'Try an example',
  diagram: 'Why this happens',
  local: 'The input and results stay on this device. Nothing is uploaded.',
  'fix-garbled-text': {
    title: 'Fix garbled text and Korean mojibake',
    lead: 'Reverse a wrong character encoding locally. Try a sample, or paste your own text below.',
    why: 'Characters were written as bytes, then read with a different encoding. Reversing that path can recover the original if no bytes were lost. Legacy encodings can have several plausible readings.',
    faq: 'Can every garbled message be recovered?',
    answer:
      'No. Replacement characters and question-mark placeholders may mean the original bytes are already gone. Ask the sender for the original instead of guessing.',
    asset: 'encoding',
  },
  'decode-mail-subject': {
    title: 'Decode a garbled mail subject',
    lead: 'Read a subject starting with =?UTF-8?B? or another MIME encoded word. Paste it below without uploading the mail.',
    why: 'Mail systems wrap non-ASCII subject text as MIME encoded words. Normally the mail app decodes them. This page performs that same decoding locally.',
    faq: 'Does this verify the sender?',
    answer:
      'No. Reading a subject or header does not authenticate the sender. Compare the full sender and reply addresses, and verify important requests through a trusted channel.',
    asset: 'mail',
  },
  'normalize-korean-filename': {
    title: 'Join separated Korean filename letters',
    lead: 'Convert Korean filenames with separated consonants and vowels from NFD to NFC. Paste the filename below.',
    why: 'Unicode can represent a Korean syllable as separate letters or a composed syllable. Different file systems and apps may display the separated form. NFC joins equivalent letters without renaming your actual file.',
    faq: 'Will this rename my files?',
    answer:
      'No. This page only shows the normalized text. Copy the result and choose yourself whether to rename a file.',
    asset: 'normalization',
  },
}
const ko: typeof en = {
  examplesTitle: '실제 예 세 가지',
  before: '받은 값',
  after: '되돌린 결과',
  try: '예시로 미리 보기',
  diagram: '왜 이렇게 되나요?',
  local: '넣은 값과 풀린 값은 이 기기 안에만 있어요. 업로드하지 않아요.',
  'fix-garbled-text': {
    title: '한글 깨짐 복구',
    lead: '다른 문자 방식으로 읽어서 깨진 글자를 되돌려요. 예시를 눌러 보거나 아래에 직접 붙여넣으세요.',
    why: '글자를 바이트로 쓴 뒤 다른 방식으로 읽으면 깨져 보여요. 바이트가 남아 있다면 거꾸로 읽어 되돌릴 수 있어요. 옛 문자 방식은 여러 읽기가 가능해 확실하지 않을 수 있어요.',
    faq: '깨진 글자는 전부 되돌릴 수 있나요?',
    answer:
      '아니요. �나 물음표가 원래 글자 대신 들어갔다면 이미 바이트가 사라졌을 수 있어요. 지어서 채우지 않고 보낸 쪽에 원본을 요청해야 해요.',
    asset: 'encoding',
  },
  'decode-mail-subject': {
    title: '메일 제목 깨짐 풀기',
    lead: '=?UTF-8?B?로 시작하는 메일 제목을 읽을 수 있게 풀어요. 메일을 업로드하지 않고 아래에 제목만 붙여넣으세요.',
    why: '메일은 영문이 아닌 제목을 MIME 전송 표기로 감싸기도 해요. 보통 메일 앱이 풀어 주지만 그대로 도착했다면 여기서 같은 방식으로 풀 수 있어요.',
    faq: '보낸 사람이 진짜인지도 확인하나요?',
    answer:
      '아니요. 제목이나 머리말을 읽는 것으로 보낸 사람을 인증할 수는 없어요. 실제 발신·답장 주소를 확인하고 중요한 요청은 믿을 수 있는 다른 경로로 확인하세요.',
    asset: 'mail',
  },
  'normalize-korean-filename': {
    title: '파일 이름 자음 모음 붙이기',
    lead: '자음과 모음이 따로 떨어진 한글 파일 이름을 NFD에서 NFC로 붙여요. 아래에 파일 이름을 붙여넣으세요.',
    why: '유니코드는 같은 한글을 자음·모음으로 나누거나 한 음절로 붙여 적을 수 있어요. 파일 시스템과 앱이 다르면 나뉜 형태가 보이기도 해요. 실제 파일을 건드리지 않고 같은 글자를 NFC로 붙여 보여 줘요.',
    faq: '내 파일 이름을 바로 바꾸나요?',
    answer:
      '아니요. 붙인 글자를 보여 주기만 해요. 결과를 복사한 뒤 파일 이름을 바꿀지는 직접 정하세요.',
    asset: 'normalization',
  },
}
export function recoveryCopy(id: RecoveryId, locale: 'en' | 'ko') {
  const copy = locale === 'ko' ? ko : en
  return { ...copy, ...copy[id], examples: examples[id] }
}
