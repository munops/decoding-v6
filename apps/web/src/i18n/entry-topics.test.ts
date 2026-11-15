import { expect, it } from 'vitest'
import { decode } from '@decoding/engine'
import { entryTopicCopy, entryTopicIds } from './entry-topics'
import { pageSchemas } from '../lib/page-schemas'
it('keeps every English/Korean entry topic actionable and its authored schema consistent', async () => {
  const expected: Record<string, string> = {
    'what-encoding-is-this': 'base64',
    'where-does-this-link-go': 'url',
    'is-it-safe-to-paste-jwt': 'jwt',
    'how-to-tell-if-a-string-is-base64': 'base64',
  }
  for (const locale of ['en', 'ko'] as const)
    for (const id of entryTopicIds) {
      const copy = entryTopicCopy(id, locale),
        path = `${locale === 'ko' ? '/ko' : ''}/${id}/`
      const schemas = pageSchemas(copy.title, path, copy.faq, copy.answer, locale)
      expect(schemas[0]).toMatchObject({
        '@type': 'FAQPage',
        mainEntity: [{ name: copy.faq, acceptedAnswer: { text: copy.answer } }],
      })
      expect(JSON.stringify(schemas[1])).toContain('https://decod.ing' + path)
      if (copy.photo) {
        expect(copy.samples[0]?.id).toBe('qr')
        continue
      }
      expect((await decode(copy.samples[0]!.value)).root.selected?.detector, id).toBe(expected[id])
    }
})
