export const triageSamples = [
  {
    id: 'nested',
    value: 'eyJsb2NhbCI6dHJ1ZSwidG9vbHMiOjQ3fQ==',
  },
  {
    id: 'ambiguous',
    value: 'deadbeef',
  },
  {
    id: 'expired-jwt',
    value: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjMiLCJleHAiOjF9.signature',
  },
] as const

export type TriageSampleId = (typeof triageSamples)[number]['id']
