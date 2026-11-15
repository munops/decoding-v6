import type { Detector } from '../../types'
import { found } from '../common'
/** Bounded lexical recognition, never a database parser, planner or executor. */
export function sqlStatements(source: string): string[] | null {
  const statements: string[] = []
  let output = '',
    depth = 0
  const flush = () => {
    if (output.trim()) statements.push(output.trim())
    output = ''
  }
  for (let i = 0; i < source.length; i++) {
    const c = source[i]!,
      next = source[i + 1]
    if (c === '-' && next === '-') {
      const end = source.indexOf('\n', i + 2)
      if (end < 0) break
      i = end
      output += ' '
      continue
    }
    if (c === '/' && next === '*') {
      let nesting = 1
      i += 2
      for (; i < source.length && nesting; i++) {
        if (source[i] === '/' && source[i + 1] === '*') {
          if (++nesting > 12) return null
          i++
        } else if (source[i] === '*' && source[i + 1] === '/') {
          nesting--
          i++
        }
      }
      if (nesting) return null
      i--
      output += ' '
      continue
    }
    const dollar = c === '$' ? /^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/.exec(source.slice(i)) : null
    if (dollar) {
      const end = source.indexOf(dollar[0], i + dollar[0].length)
      if (end < 0) return null
      i = end + dollar[0].length - 1
      output += ' LITERAL '
      continue
    }
    if (c === "'" || c === '"' || c === '`' || c === '[') {
      const close = c === '[' ? ']' : c
      let closed = false
      for (i++; i < source.length; i++) {
        if (source[i] === close) {
          if (source[i + 1] === close) {
            i++
            continue
          }
          closed = true
          break
        }
      }
      if (!closed) return null
      output += c === "'" ? ' LITERAL ' : ' IDENTIFIER '
      continue
    }
    if (c === '(') {
      if (++depth > 64) return null
    }
    if (c === ')' && --depth < 0) return null
    if (c === ';' && depth === 0) {
      flush()
      if (statements.length > 64) return null
    } else output += c
  }
  if (depth) return null
  flush()
  return statements.length && statements.length <= 64 ? statements : null
}
const patterns = [
  /^SELECT\s+(?:DISTINCT\s+)?(?:[\d(]|LITERAL\b|IDENTIFIER\b|[\s\S]+\s+FROM\b)/i,
  /^WITH\s+(?:RECURSIVE\s+)?\w+\s+AS\s*\([\s\S]+\)\s*(?:SELECT|INSERT|UPDATE|DELETE)\b/i,
  /^INSERT\s+INTO\s+(?:[\w.]+|IDENTIFIER)\b[\s\S]+\b(?:VALUES|SELECT|DEFAULT)\b/i,
  /^UPDATE\s+(?:[\w.]+|IDENTIFIER)\s+SET\s+[\s\S]+=/i,
  /^DELETE\s+FROM\s+(?:[\w.]+|IDENTIFIER)(?:\s|$)/i,
  /^CREATE\s+(?:TEMP(?:ORARY)?\s+)?(?:TABLE|VIEW|INDEX)\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:[\w.]+|IDENTIFIER)\s*[\s\S]+/i,
  /^ALTER\s+TABLE\s+(?:[\w.]+|IDENTIFIER)\s+(?:ADD|DROP|ALTER|RENAME)\b/i,
  /^DROP\s+(?:TABLE|VIEW|INDEX)\s+(?:IF\s+EXISTS\s+)?(?:[\w.]+|IDENTIFIER)(?:\s|$)/i,
  /^TRUNCATE\s+(?:TABLE\s+)?(?:[\w.]+|IDENTIFIER)(?:\s|$)/i,
]
export const sql: Detector = {
  id: 'sql',
  detect(input) {
    if (
      typeof input !== 'string' ||
      input.length > 262144 ||
      !/^\s*(?:(?:SELECT|WITH|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE)\b|--|\/\*)/i.test(
        input,
      )
    )
      return null
    const statements = sqlStatements(input)
    if (
      !statements ||
      statements.some((statement) => !patterns.some((pattern) => pattern.test(statement)))
    )
      return null
    return found(
      'sql',
      'SQL statement candidate',
      {
        statements: statements.length,
        commands: statements.map((statement) => statement.split(/\s/)[0]!.toUpperCase()),
      },
      0.8,
      { metadata: { tool: 'sql-format' } },
    )
  },
}
