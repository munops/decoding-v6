import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { validateSponsor } from '../apps/web/src/lib/sponsors'
import {
  decideSponsorSurface,
  isSponsorReleaseApproved,
} from '../packages/workbench-ui/src/monetization'

const path = resolve('apps/web/src/content/sponsors.json')
const values = JSON.parse(readFileSync(path, 'utf8')) as unknown
if (!Array.isArray(values)) throw new Error('sponsors.json must contain an array')

for (const value of values) {
  const sponsor = validateSponsor(value)
  if (!existsSync(resolve('apps/web/public', sponsor.imagePath.slice(1)))) {
    throw new Error(`${sponsor.id}: sponsor image does not exist`)
  }
}

const validFixture = {
  id: 'fixture-sponsor',
  locale: 'global',
  label: 'Sponsored',
  headline: 'Synthetic fixture',
  cta: 'Learn more',
  targetUrl: 'https://example.invalid/sponsor',
  imagePath: '/sponsors/fixture.webp',
  imageAlt: 'Fixture',
  categories: ['format'],
  startsAt: '2026-01-01T00:00:00Z',
  endsAt: '2027-01-01T00:00:00Z',
}
validateSponsor(validFixture)
if (isSponsorReleaseApproved(undefined) || isSponsorReleaseApproved('false')) {
  throw new Error('Sponsor release flag must fail closed')
}
if (
  decideSponsorSurface({
    releaseApproved: false,
    campaignConfigured: true,
    surface: 'web_tool_below_fold',
  }).visible
) {
  throw new Error('Configured sponsor bypassed release approval')
}
for (const invalid of [
  { ...validFixture, targetUrl: 'http://example.invalid/' },
  { ...validFixture, targetUrl: 'https://example.invalid/?payload=secret' },
  { ...validFixture, imagePath: 'https://example.invalid/ad.svg' },
  { ...validFixture, endsAt: validFixture.startsAt },
]) {
  let rejected = false
  try {
    validateSponsor(invalid)
  } catch {
    rejected = true
  }
  if (!rejected) throw new Error('Unsafe sponsor fixture was accepted')
}

const component = readFileSync(resolve('apps/web/src/components/SponsorSlot.astro'), 'utf8')
for (const contract of [
  'PUBLIC_SPONSOR_RELEASE_APPROVED',
  'rel="sponsored noopener noreferrer"',
  'loading="lazy"',
  'sponsor-label',
  'hidden',
  'SPONSOR_FIRST_VALUE_EVENT',
  '__DECODING_DIRECT_SPONSOR_PROVIDER__',
  'requestConfirmedSponsorImpression',
  'collapse:',
]) {
  if (!component.includes(contract)) throw new Error(`Sponsor component is missing ${contract}`)
}
if (component.includes('CustomEvent') || component.includes('dispatchEvent')) {
  throw new Error('Sponsor component may not self-confirm an impression through a DOM event')
}

const toolPage = readFileSync(resolve('apps/web/src/components/ToolPage.astro'), 'utf8')
if (toolPage.indexOf('<SponsorSlot') < toolPage.indexOf('<WebTool')) {
  throw new Error('Sponsor slot must remain after the first-value workbench')
}

console.log(`sponsors: ${values.length} configured; none fallback and safety contract OK`)
