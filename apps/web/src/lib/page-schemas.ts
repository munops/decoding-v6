export function pageSchemas(
  title: string,
  path: string,
  question: string,
  answer: string,
  locale: 'en' | 'ko',
) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer },
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'decod.ing',
          item: `https://decod.ing/${locale === 'ko' ? 'ko/' : ''}`,
        },
        { '@type': 'ListItem', position: 2, name: title, item: `https://decod.ing${path}` },
      ],
    },
  ]
}
