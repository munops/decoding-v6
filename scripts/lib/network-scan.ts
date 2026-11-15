import ts from 'typescript'

/** Inspect executable calls, so authored code examples remain inert content. */
export function hasNetworkPrimitive(source: string, astro = false): boolean {
  const code = astro
    ? [
        source.match(/^---\s*\n([\s\S]*?)\n---/)?.[1] ?? '',
        ...[...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((match) => match[1]),
      ].join('\n')
    : source
  const ast = ts.createSourceFile(
    'runtime.tsx',
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  let forbidden = false
  const visit = (node: ts.Node): void => {
    if (ts.isCallExpression(node) || ts.isNewExpression(node)) {
      const expression = node.expression
      const name = ts.isIdentifier(expression)
        ? expression.text
        : ts.isPropertyAccessExpression(expression)
          ? expression.name.text
          : ts.isElementAccessExpression(expression) &&
              expression.argumentExpression &&
              ts.isStringLiteral(expression.argumentExpression)
            ? expression.argumentExpression.text
            : ''
      if (['fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource', 'sendBeacon'].includes(name))
        forbidden = true
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
  return forbidden
}
