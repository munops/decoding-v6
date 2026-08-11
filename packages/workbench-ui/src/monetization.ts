/**
 * Shared free-first and sponsor policy.
 *
 * This module contains no ad network, payment, account, storage, or network code.
 * A release approval flag represents a completed evidence review; it is never
 * inferred from a configured campaign.
 */

export const PERMANENT_FREE_RIGHTS = [
  'automatic_local_detection',
  'recursive_decode_chain',
  'all_decoder_and_utility_operations',
  'deterministic_warnings_and_evidence',
  'copy_export_and_safe_share_projection',
  'offline_pwa_cli_desktop_and_extension_use',
] as const

export const FORBIDDEN_MONETIZATION_OUTCOMES = [
  'user_payment_or_subscription',
  'paid_decoder_or_operation',
  'account_or_email_gate',
  'payload_or_result_targeting',
  'personalized_or_retargeted_advertising',
  'sponsor_inside_input_result_or_first_viewport',
  'sponsor_affects_tool_order_or_output_ranking',
] as const

export const SPONSOR_FIRST_VALUE_EVENT = 'decoding:local-operation-completed'
export const SPONSOR_SESSION_COUNT_KEY = 'decoding:sponsor:web-tool-below-fold:session-count'
export const SPONSOR_LAST_IMPRESSION_KEY = 'decoding:sponsor:web-tool-below-fold:last-impression-at'

export const SPONSOR_FREQUENCY_POLICY = {
  maxPerSession: 1,
  cooldownSeconds: 0,
} as const

export type SponsorSurface =
  | 'web_tool_below_fold'
  | 'web_first_viewport'
  | 'pwa_standalone'
  | 'workspace'
  | 'cli'
  | 'desktop'
  | 'extension'

export type SponsorDecisionReason =
  'release_not_approved' | 'campaign_not_configured' | 'surface_forbidden' | 'eligible'

export interface SponsorDecision {
  visible: boolean
  reason: SponsorDecisionReason
}

export interface SponsorFrequencyState {
  impressionsThisSession: number
  lastImpressionAt: number | null
}

export interface SponsorImpressionRequest {
  placementId: 'web_tool_below_fold'
  sponsorId: string
}

export interface SponsorImpressionConfirmation extends SponsorImpressionRequest {
  providerReceiptId: string
}

export interface SponsorImpressionCallbacks {
  onConfirmed: (confirmation: SponsorImpressionConfirmation) => void
  onNoFill: () => void
  onError: () => void
}

export interface SponsorImpressionProvider {
  requestImpression: (
    request: SponsorImpressionRequest,
    callbacks: SponsorImpressionCallbacks,
  ) => void | (() => void)
}

export function isSponsorReleaseApproved(value: string | undefined): boolean {
  return value === 'true'
}

export function decideSponsorSurface(input: {
  releaseApproved: boolean
  campaignConfigured: boolean
  surface: SponsorSurface
}): SponsorDecision {
  if (!input.releaseApproved) return { visible: false, reason: 'release_not_approved' }
  if (!input.campaignConfigured) return { visible: false, reason: 'campaign_not_configured' }
  if (input.surface !== 'web_tool_below_fold') {
    return { visible: false, reason: 'surface_forbidden' }
  }
  return { visible: true, reason: 'eligible' }
}

export function decideSponsorReveal(input: {
  firstValueCompleted: boolean
  frequency: SponsorFrequencyState
  now: number
}): SponsorDecision {
  if (!input.firstValueCompleted) return { visible: false, reason: 'surface_forbidden' }
  if (input.frequency.impressionsThisSession >= SPONSOR_FREQUENCY_POLICY.maxPerSession) {
    return { visible: false, reason: 'surface_forbidden' }
  }
  const cooldownMs = SPONSOR_FREQUENCY_POLICY.cooldownSeconds * 1_000
  if (
    cooldownMs > 0 &&
    input.frequency.lastImpressionAt !== null &&
    input.now - input.frequency.lastImpressionAt < cooldownMs
  ) {
    return { visible: false, reason: 'surface_forbidden' }
  }
  return { visible: true, reason: 'eligible' }
}

type SponsorStorage = Pick<Storage, 'getItem' | 'setItem'>

export function readSponsorFrequencyState(
  sessionStore: SponsorStorage,
  localStore: SponsorStorage,
): SponsorFrequencyState {
  try {
    const count = Number.parseInt(sessionStore.getItem(SPONSOR_SESSION_COUNT_KEY) ?? '0', 10)
    const timestamp = Number.parseInt(localStore.getItem(SPONSOR_LAST_IMPRESSION_KEY) ?? '', 10)
    return {
      impressionsThisSession: Number.isFinite(count) && count > 0 ? count : 0,
      lastImpressionAt: Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null,
    }
  } catch {
    return {
      impressionsThisSession: SPONSOR_FREQUENCY_POLICY.maxPerSession,
      lastImpressionAt: null,
    }
  }
}

/** Record only after the channel adapter acknowledges an impression. */
export function recordSponsorImpression(
  sessionStore: SponsorStorage,
  localStore: SponsorStorage,
  previous: SponsorFrequencyState,
  now: number,
): SponsorFrequencyState {
  const next = {
    impressionsThisSession: previous.impressionsThisSession + 1,
    lastImpressionAt: now,
  }
  sessionStore.setItem(SPONSOR_SESSION_COUNT_KEY, String(next.impressionsThisSession))
  localStore.setItem(SPONSOR_LAST_IMPRESSION_KEY, String(next.lastImpressionAt))
  return next
}

/**
 * Bind the frequency ledger to the provider-owned callback. Merely rendering,
 * observing viewability, or dispatching a DOM event can never commit an
 * impression. A no-fill, error, malformed receipt, or mismatched receipt
 * collapses the slot without touching storage.
 */
export function requestConfirmedSponsorImpression(input: {
  provider: SponsorImpressionProvider
  request: SponsorImpressionRequest
  sessionStore: SponsorStorage
  localStore: SponsorStorage
  previous: SponsorFrequencyState
  now: () => number
  collapse: () => void
  onCommitted?: (next: SponsorFrequencyState) => void
}): () => void {
  let settled = false
  const collapse = () => {
    if (settled) return
    settled = true
    input.collapse()
  }
  try {
    const cleanup = input.provider.requestImpression(input.request, {
      onConfirmed: (confirmation) => {
        if (settled) return
        if (
          confirmation.placementId !== input.request.placementId ||
          confirmation.sponsorId !== input.request.sponsorId ||
          !confirmation.providerReceiptId.trim()
        ) {
          collapse()
          return
        }
        settled = true
        const next = recordSponsorImpression(
          input.sessionStore,
          input.localStore,
          input.previous,
          input.now(),
        )
        input.onCommitted?.(next)
      },
      onNoFill: collapse,
      onError: collapse,
    })
    return typeof cleanup === 'function' ? cleanup : () => undefined
  } catch {
    collapse()
    return () => undefined
  }
}
