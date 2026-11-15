import type { EngineMessageCode } from './message-codes'
export type SafeName = string & { readonly __safeName: unique symbol }
/** A technical name, never a ready-made explanation. Exports must omit these input-derived facts. */
export function safeName(value: unknown): SafeName {
  return String(value) as SafeName
}
export const algorithmName = safeName
export type MessageFact = {
  code: EngineMessageCode
  params?: Record<string, number | boolean | SafeName | undefined>
}
