import type { Locale } from './catalog'
const en = {
  whenToUse: 'When to use it',
  example: 'Input → output example',
  workspaceTitle: 'Saved on this device',
  workspaceLead: 'Find results you chose to keep. Nothing is synced to a server.',
  dataTitle: 'Data on this device',
  dataLead: 'Read or remove settings, saved results and offline files on this device.',
  notFoundTitle: 'There is nothing at this address.',
  notFoundLead: 'Paste a value below, or find the tool you need.',
  offlineTitle: 'This tool has not been downloaded yet.',
  offlineLead: 'Open it once while connected, then use it offline. Your input has not been sent.',
  decoder: 'Open decoder',
  tools: 'Find a tool',
  counts: 'Anonymous counts',
  countLead:
    'Only fixed event names are counted. Your input and identity are never included. You can turn counting off here.',
}
const ko: typeof en = {
  whenToUse: '이럴 때 써요',
  example: '넣는 예 → 나오는 예',
  workspaceTitle: '넣어 둔 것',
  workspaceLead: '이 기기에 넣어 둔 결과를 찾아보세요. 서버와 맞추거나 보내지 않아요.',
  dataTitle: '이 기기에 남은 것',
  dataLead: '이 기기의 설정, 넣어 둔 것과 인터넷 없이 쓰는 파일을 살펴보고 지워요.',
  notFoundTitle: '이 주소에는 아무것도 없어요',
  notFoundLead: '아래에 값을 붙여넣거나 필요한 도구를 찾아보세요.',
  offlineTitle: '이 도구는 아직 받아 두지 못했어요.',
  offlineLead: '인터넷이 될 때 한 번 열어 주세요. 입력한 값은 밖으로 보내지 않았어요.',
  decoder: '붙여넣어 풀기',
  tools: '도구 찾기',
  counts: '횟수 세기',
  countLead:
    '정해진 이름으로 횟수만 세요. 무엇을 붙여넣었는지, 누구인지는 세지 않아요. 여기서 끌 수 있어요.',
}
export const deviceMessages = Object.fromEntries(
  ['en', 'ko', 'ja', 'zh-cn', 'es', 'pt-br', 'de', 'fr'].map((locale) => [
    locale,
    locale === 'ko' ? ko : en,
  ]),
) as Record<Locale, typeof en>
