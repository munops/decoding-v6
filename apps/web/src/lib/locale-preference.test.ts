import { expect, it } from 'vitest'
import { preferredHomeLocale } from './locale-preference'
it('redirects Korean first visits but preserves explicit choices, return visits and crawler URLs', () => {
  const first = {
    language: 'ko-KR',
    choice: null,
    seen: false,
    automatic: null,
    userAgent: 'Mozilla/5.0 Chrome/140.0 Safari/537.36',
  }
  expect(preferredHomeLocale(first)).toBe('ko')
  expect(preferredHomeLocale({ ...first, choice: 'en' })).toBe('en')
  expect(preferredHomeLocale({ ...first, choice: 'fr' })).toBe('fr')
  expect(preferredHomeLocale({ ...first, seen: true, automatic: 'en' })).toBe('en')
  expect(preferredHomeLocale({ ...first, seen: true, automatic: 'ko' })).toBe('ko')
  expect(preferredHomeLocale({ ...first, language: 'en-US' })).toBe('en')
  expect(preferredHomeLocale({ ...first, choice: 'https://untrusted.invalid' })).toBe('ko')
  for (const userAgent of [
    'Googlebot/2.1',
    'bingbot/2.0',
    'Google-InspectionTool/1.0',
    'ExampleCrawler/1.0',
    'Mozilla/5.0 (compatible; Yeti/1.1; +https://naver.me/spd)',
  ])
    expect(preferredHomeLocale({ ...first, userAgent })).toBeUndefined()
})
