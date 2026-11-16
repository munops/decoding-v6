import type { Locale } from './catalog'

export function toolNavigationCopy(locale: Locale) {
  return locale === 'ko'
    ? {
        favorites: '즐겨찾는 도구',
        recent: '최근 연 도구',
        all: '도구 모두 보기',
        unavailable: '설정을 저장하지 못했어요. 지금 화면에서만 유지되며 도구는 계속 쓸 수 있어요.',
        guides: '상황별로 풀어보기',
        related: '다른 상황도 살펴보기',
        example: '예시로 확인한 결과예요.',
        ownInput: '내 글로 풀기',
      }
    : {
        favorites: 'Favorite tools',
        recent: 'Recently opened tools',
        all: 'All tools',
        unavailable:
          'Preferences could not be saved. They last on this page only; the tools still work.',
        guides: 'Start with your situation',
        related: 'Explore another situation',
        example: 'This result uses an example.',
        ownInput: 'Use my own text',
      }
}
