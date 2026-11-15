const en = {
  menu: 'Decode with decod.ing',
  heading: 'Decode on this device',
  local: 'Only on this device',
  input: 'Paste an unfamiliar value',
  copy: 'Copy decoded value',
  note: 'The selected text is passed once through extension memory. It never enters a URL, persistent storage or a network request. If the worker has closed, paste it here again.',
  expired: 'Paste a value, or select text on a page and choose Decode with decod.ing.',
  failed: 'This value could not be decoded.',
  copied: 'Copied',
  concerns: 'Things to check',
  none: 'No concerns were found.',
}
const ko: typeof en = {
  menu: 'decod.ing으로 풀기',
  heading: '이 기기 안에서 풀기',
  local: '내 기기 안에서만',
  input: '모르는 값을 붙여넣으세요',
  copy: '풀린 값 복사',
  note: '선택한 글은 확장 메모리로 한 번만 넘겨요. 주소·영구 저장소·외부 요청에는 넣지 않아요. 워커가 닫혔다면 여기에 다시 붙여넣으세요.',
  expired: '값을 붙여넣거나 웹페이지에서 글을 선택한 뒤 decod.ing으로 풀기를 누르세요.',
  failed: '이 값은 풀지 못했어요.',
  copied: '복사했어요',
  concerns: '조심할 점',
  none: '조심할 점은 찾지 못했어요.',
}
export const locale = navigator.language.startsWith('ko') ? 'ko' : 'en'
export const copy = locale === 'ko' ? ko : en
