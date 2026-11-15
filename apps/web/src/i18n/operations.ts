import { operationCopy } from '@decoding/workbench-ui'
import { taskAliases } from './tool-aliases'
import type { OperationDescriptor } from '@decoding/operations'
import type { Locale } from './catalog'

export function localizeOperation(
  locale: Locale,
  operation: OperationDescriptor,
): OperationDescriptor {
  const aliased = { ...operation, aliases: [...operation.aliases, ...taskAliases(operation.id)] }
  if (locale !== 'ko') return aliased
  const copy = operationCopy(locale, operation.id)
  return copy ? { ...aliased, ...copy } : aliased
}

export function localizeOperations(
  locale: Locale,
  operations: OperationDescriptor[],
): OperationDescriptor[] {
  return operations.map((operation) => localizeOperation(locale, operation))
}

export { koreanOperationIds } from '@decoding/workbench-ui'
