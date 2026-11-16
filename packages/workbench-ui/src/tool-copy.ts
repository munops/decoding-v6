import type { WorkbenchLocale } from './messages'
const en = {
  unknown: 'If you do not know what it is, paste it into the decoder.',
  paste: 'Paste',
  pasteFailed: 'Paste was unavailable. Use your keyboard to paste.',
  automatic: 'Results update as you type.',
  inspectToken: 'Inspect this token and its warnings',
  continue: 'Decode this result further',
  related: 'Tools to use next',
  charset: 'Original character encoding',
  auto: 'Try supported encodings',
  key: 'Your key (letters only)',
  direction: 'Direction',
  encode: 'Encode',
  decode: 'Decode',
  caesar: 'Caesar: compare all 25 shifts',
  atbash: 'Atbash',
  a1z26: 'A=1, B=2…',
  vigenere: 'Vigenere with your key',
  noGuess: 'Compare the results yourself. We do not guess which cipher was used or recover a key.',
}
const ko: typeof en = {
  inspectToken: '이 토큰의 근거와 주의점 보기',
  unknown: '뭔지 모르는 값이면 그냥 붙여넣기',
  paste: '붙여넣기',
  pasteFailed: '붙여넣기를 쓸 수 없어요. 키보드로 붙여넣으세요.',
  automatic: '치는 대로 결과가 바뀌어요.',
  continue: '이 결과를 더 풀기',
  related: '같이 쓰는 도구',
  charset: '원래 문자 방식',
  auto: '지원하는 방식으로 살펴보기',
  key: '내가 가진 열쇠 (영문자)',
  direction: '방향',
  encode: '싸기',
  decode: '풀기',
  caesar: '시저: 25가지 밀기 견주기',
  atbash: '아트배시',
  a1z26: 'A=1, B=2…',
  vigenere: '내 열쇠로 비즈네르',
  noGuess: '결과를 읽고 직접 고르세요. 어떤 암호인지 확정하거나 열쇠를 찾아 주지는 않아요.',
}
export function toolCopy(locale: WorkbenchLocale) {
  return locale === 'ko' ? ko : en
}
