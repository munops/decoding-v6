export const triageSamples = [
  { id: 'broken', labelKey: 'sampleBroken', value: 'ì•ˆë…•í•˜ì„¸ìš”' },
  {
    id: 'link',
    labelKey: 'sampleLink',
    value:
      'https://click.example.invalid/?url=https%3A%2F%2Fdestination.example.invalid%2Foffer%3Futm_source%3Dmail',
  },
  {
    id: 'expired-jwt',
    labelKey: 'sampleToken',
    value: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjF9.signature',
  },
  {
    id: 'nested',
    labelKey: 'sampleNested',
    value: 'ZXlKdmNtUmxjaUk2SWtFdE1qQXpPVEVpTENKd1lXbGtJanAwY25WbGZRPT0=',
  },
  { id: 'mail', labelKey: 'sampleMail', value: '=?UTF-8?B?7JWI64WV7ZWY7IS47JqU?=' },
  { id: 'time', labelKey: 'sampleTime', value: '1700000000' },
  { id: 'qr', labelKey: 'sampleQr', value: 'https://example.invalid/' },
] as const
export type TriageSampleId = (typeof triageSamples)[number]['id']
