import { describe, expect, it } from 'vitest'
import {
  decideSponsorSurface,
  decideSponsorReveal,
  FORBIDDEN_MONETIZATION_OUTCOMES,
  isSponsorReleaseApproved,
  PERMANENT_FREE_RIGHTS,
  readSponsorFrequencyState,
  recordSponsorImpression,
  requestConfirmedSponsorImpression,
  SPONSOR_LAST_IMPRESSION_KEY,
  SPONSOR_SESSION_COUNT_KEY,
  type SponsorSurface,
} from '../src/monetization'

describe('free-first monetization policy', () => {
  it('keeps every product capability free and forbids user payment', () => {
    expect(PERMANENT_FREE_RIGHTS).toContain('all_decoder_and_utility_operations')
    expect(FORBIDDEN_MONETIZATION_OUTCOMES).toContain('user_payment_or_subscription')
    expect(FORBIDDEN_MONETIZATION_OUTCOMES).toContain('payload_or_result_targeting')
    expect(FORBIDDEN_MONETIZATION_OUTCOMES).toContain(
      'sponsor_affects_tool_order_or_output_ranking',
    )
  })

  it('reveals only after first value and enforces the real session counter', () => {
    const empty = { impressionsThisSession: 0, lastImpressionAt: null }
    expect(decideSponsorReveal({ firstValueCompleted: false, frequency: empty, now: 100 })).toEqual(
      {
        visible: false,
        reason: 'surface_forbidden',
      },
    )
    expect(decideSponsorReveal({ firstValueCompleted: true, frequency: empty, now: 100 })).toEqual({
      visible: true,
      reason: 'eligible',
    })
    expect(
      decideSponsorReveal({
        firstValueCompleted: true,
        frequency: { impressionsThisSession: 1, lastImpressionAt: 99 },
        now: 100,
      }),
    ).toEqual({ visible: false, reason: 'surface_forbidden' })
  })

  it('persists the session counter and local timestamp only through the record owner', () => {
    const sessionValues = new Map<string, string>()
    const localValues = new Map<string, string>()
    const storage = (values: Map<string, string>) => ({
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    })
    const sessionStore = storage(sessionValues)
    const localStore = storage(localValues)
    const before = readSponsorFrequencyState(sessionStore, localStore)
    expect(before).toEqual({ impressionsThisSession: 0, lastImpressionAt: null })
    expect(recordSponsorImpression(sessionStore, localStore, before, 123)).toEqual({
      impressionsThisSession: 1,
      lastImpressionAt: 123,
    })
    expect(sessionValues.get(SPONSOR_SESSION_COUNT_KEY)).toBe('1')
    expect(localValues.get(SPONSOR_LAST_IMPRESSION_KEY)).toBe('123')
  })

  it('commits only a matching provider confirmation and collapses no-fill without a gap', () => {
    const sessionValues = new Map<string, string>()
    const localValues = new Map<string, string>()
    const storage = (values: Map<string, string>) => ({
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
    })
    const callbacks: Array<
      Parameters<
        Parameters<typeof requestConfirmedSponsorImpression>[0]['provider']['requestImpression']
      >[1]
    > = []
    const provider = {
      requestImpression: (_request: unknown, next: (typeof callbacks)[number]) => {
        callbacks.push(next)
      },
    }
    let collapsed = 0
    const common = {
      provider,
      request: { placementId: 'web_tool_below_fold' as const, sponsorId: 'sponsor-a' },
      sessionStore: storage(sessionValues),
      localStore: storage(localValues),
      previous: { impressionsThisSession: 0, lastImpressionAt: null },
      now: () => 456,
      collapse: () => {
        collapsed += 1
      },
    }

    requestConfirmedSponsorImpression(common)
    callbacks[0]!.onNoFill()
    expect(collapsed).toBe(1)
    expect(sessionValues.size).toBe(0)
    expect(localValues.size).toBe(0)

    requestConfirmedSponsorImpression(common)
    callbacks[1]!.onConfirmed({
      placementId: 'web_tool_below_fold',
      sponsorId: 'sponsor-a',
      providerReceiptId: 'provider-receipt-1',
    })
    expect(sessionValues.get(SPONSOR_SESSION_COUNT_KEY)).toBe('1')
    expect(localValues.get(SPONSOR_LAST_IMPRESSION_KEY)).toBe('456')
    expect(collapsed).toBe(1)
  })

  it('requires the exact release approval value', () => {
    expect(isSponsorReleaseApproved(undefined)).toBe(false)
    expect(isSponsorReleaseApproved('false')).toBe(false)
    expect(isSponsorReleaseApproved('TRUE')).toBe(false)
    expect(isSponsorReleaseApproved('true')).toBe(true)
  })

  it('renders only a configured, approved, below-fold web sponsor', () => {
    expect(
      decideSponsorSurface({
        releaseApproved: false,
        campaignConfigured: true,
        surface: 'web_tool_below_fold',
      }),
    ).toEqual({ visible: false, reason: 'release_not_approved' })
    expect(
      decideSponsorSurface({
        releaseApproved: true,
        campaignConfigured: false,
        surface: 'web_tool_below_fold',
      }),
    ).toEqual({ visible: false, reason: 'campaign_not_configured' })
    expect(
      decideSponsorSurface({
        releaseApproved: true,
        campaignConfigured: true,
        surface: 'web_tool_below_fold',
      }),
    ).toEqual({ visible: true, reason: 'eligible' })
  })

  it('keeps every non-web or first-viewport surface sponsor-free', () => {
    const forbidden: SponsorSurface[] = [
      'web_first_viewport',
      'pwa_standalone',
      'workspace',
      'cli',
      'desktop',
      'extension',
    ]
    for (const surface of forbidden) {
      expect(
        decideSponsorSurface({ releaseApproved: true, campaignConfigured: true, surface }),
      ).toEqual({ visible: false, reason: 'surface_forbidden' })
    }
  })
})
