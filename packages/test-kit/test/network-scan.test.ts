import { expect, it } from 'vitest'
import { hasNetworkPrimitive } from '../../../scripts/lib/network-scan'

it('distinguishes authored code examples from executable network calls', () => {
  expect(hasNetworkPrimitive('const output = \'fetch("https://example.invalid/")\'')).toBe(false)
  for (const source of [
    'fetch(source)',
    'window.fetch(source)',
    'new WebSocket(source)',
    'navigator.sendBeacon(url, value)',
    'globalThis["fetch"](url)',
  ])
    expect(hasNetworkPrimitive(source)).toBe(true)
  expect(hasNetworkPrimitive('---\nconst text = "fetch(url)"\n---\n<p>{text}</p>', true)).toBe(
    false,
  )
  expect(hasNetworkPrimitive('<script>fetch(secret)</script>', true)).toBe(true)
})
