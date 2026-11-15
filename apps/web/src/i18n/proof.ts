const en = {
  title: 'Check local decoding.',
  lead: 'Try this synthetic example, watch the page and then turn off the network.',
  outgoing: 'Observed requests containing the current input or decoded text',
  time: 'Time watching this value',
  seconds: 'seconds',
  preparing: 'Opening the local decoder…',
  offlineReady:
    'The decoder and its initial offline files are ready. Disconnect and keep using this page.',
  offlineWaiting: 'The decoder is ready. Checking whether this build’s offline files are cached…',
  offlineUnavailable: 'The decoder is ready, but offline-file readiness could not be confirmed.',
  scope: 'What this observation can see',
  scopeBody:
    'This page checks readable fetch, XMLHttpRequest and sendBeacon requests, plus resource URLs. It looks for the current text and decoded text in literal, JSON-escaped, URL-encoded or Base64 form. A request attempt is counted even if it is later blocked or served from cache.',
  limits:
    'It cannot inspect Worker request bodies, other tabs, extensions, the operating system, every browser transport, truncated values or arbitrary encodings. This panel is an observation aid. Use the browser’s Network panel or disconnect for a stronger check.',
  inputScope:
    'Use text from 8 to 65,536 characters. Files, shorter/longer text and unreadable bodies show an unknown result instead of an unearned zero. Checks stay only in page memory and reset when the input changes.',
  calls: 'Page API calls',
  resources: 'Resource loads',
  uninspected: 'Bodies or headers not fully inspected',
  limited: 'Some request details or APIs are outside this observation.',
  unknownInput: 'Paste an eligible text value to start a meaningful comparison.',
  concern:
    'A request attempt contained the observed text. Stop using real secrets and inspect the Network panel.',
  whyTitle: 'Why keep the value on your device?',
  why: 'On 25 November 2025, watchTowr reported that more than 80,000 saved JSON submissions from JSONFormatter and CodeBeautify were publicly accessible. The saved data included credentials and private keys. Use synthetic examples for checks and keep working secrets private.',
  source: 'Read watchTowr’s original research',
  countsTitle: 'Count actions, not your values',
  counts:
    'The app can count opens, completed/unsupported decodes, returns, shares and sponsor-interest actions. Each fixed event name is sent at most once per page. The event contains no input, result, hash, filename, tool name, cookie or user identifier.',
  countsMore:
    'The first-visit date used for the return count stays on this device for at most 13 months. It is not sent. Turn counts off here; the same setting applies throughout the site. This proof page itself is excluded from counts.',
  data: 'See or remove this device’s data',
  countLabel: 'Count actions only',
  countFailure: 'This browser cannot remember the setting. Counts are off in this tab only.',
}
const ko: typeof en = {
  title: '기기 안에서 풀리는지 확인해요.',
  lead: '비밀이 없는 이 시험 값을 풀고, 관측 칸을 본 뒤 인터넷을 끊어 보세요.',
  outgoing: '현재 입력·풀린 문자가 담긴 요청 관측',
  time: '이 값을 지켜본 시간',
  seconds: '초',
  preparing: '기기 안의 풀이기를 여는 중이에요…',
  offlineReady:
    '풀이기와 처음 쓸 오프라인 파일이 준비됐어요. 인터넷을 끊고 이 지면에서 계속 써 보세요.',
  offlineWaiting: '풀이기는 준비됐어요. 이 빌드의 오프라인 파일이 캐시에 있는지 확인하고 있어요…',
  offlineUnavailable: '풀이기는 준비됐지만 오프라인 파일의 준비 상태는 확인하지 못했어요.',
  scope: '볼 수 있는 범위와 한계',
  scopeBody:
    '이 페이지의 읽을 수 있는 fetch·XMLHttpRequest·sendBeacon 요청과 리소스 주소를 살펴봐요. 현재 문자와 풀린 문자의 원문·JSON 이스케이프·URL 표기·Base64가 들어 있는지 확인해요. 나중에 막히거나 캐시로 처리된 요청 시도도 셀 수 있어요.',
  limits:
    'Worker의 요청 본문·다른 탭·확장 프로그램·운영체제·모든 브라우저 전송 경로·잘린 값·임의의 다른 표기까지 볼 수는 없어요. 이 칸은 관측을 돕는 도구예요. 더 확인하려면 브라우저 Network 칸을 보거나 인터넷을 끊고 써 보세요.',
  inputScope:
    '문자 8~65,536자를 관측해요. 파일·너무 짧거나 긴 글·읽을 수 없는 본문은 근거 없이 0으로 표시하지 않아요. 비교 자료는 페이지 메모리에만 두고 입력을 바꾸면 새로 시작해요.',
  calls: '페이지 API 호출',
  resources: '리소스 읽기',
  uninspected: '끝까지 살펴보지 못한 본문·머리말',
  limited: '이 관측으로 볼 수 없는 요청 내용이나 API가 있어요.',
  unknownInput: '관측할 수 있는 길이의 문자 값을 붙여넣어 주세요.',
  concern:
    '관측한 문자가 담긴 요청 시도가 있었어요. 실제 비밀 값은 쓰지 말고 Network 칸을 살펴보세요.',
  whyTitle: '왜 값을 내 기기에 두나요?',
  why: '2025년 11월 25일 watchTowr는 JSONFormatter·CodeBeautify 두 사이트에 저장된 JSON 자료 8만 건 넘게에 공개로 접근할 수 있었다고 보고했어요. 그 안에는 로그인 정보와 개인키도 있었어요. 확인에는 만든 시험 값을 쓰고 실제 비밀은 비공개로 두세요.',
  source: 'watchTowr의 원문 보기',
  countsTitle: '값 대신 동작 횟수만 세어요',
  counts:
    '열림·풀이 완료나 미지원·재방문·공유·후원 관심 같은 동작을 셀 수 있어요. 고정된 사건 이름마다 한 페이지에서 한 번만 보내요. 입력·결과·해시·파일명·도구명·쿠키·사용자 식별자는 보내지 않아요.',
  countsMore:
    '재방문 횟수에 쓰는 첫 방문 날짜는 이 기기에만 최대 13개월 두고 보내지 않아요. 여기서 끄면 다른 지면에도 같은 설정이 적용돼요. 이 확인 지면 자체는 횟수에 넣지 않아요.',
  data: '이 기기의 데이터 보기·지우기',
  countLabel: '동작 횟수만 세기',
  countFailure: '이 브라우저는 설정을 기억하지 못해요. 이 탭에서만 꺼져요.',
}
export function proofCopy(locale: string) {
  return locale === 'ko' ? ko : en
}
export const proofResearchUrl =
  'https://labs.watchtowr.com/stop-putting-your-passwords-into-random-websites-yes-seriously-you-are-the-problem/'
