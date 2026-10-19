import type { ChainNode } from '@decoding/engine'
export function linearChain(root: ChainNode): ChainNode[] {
  const nodes: ChainNode[] = []
  let node: ChainNode | undefined = root
  while (node) {
    nodes.push(node)
    node = node.children[0]
  }
  return nodes
}
export function reproduceCommands(root: ChainNode): {
  shell: string
  python: string
  javascript: string
} {
  const nodes = linearChain(root).filter((n) => !!n.selected)
  const shell = ['printf \'%s\' "$VALUE"'],
    python = [
      '# Set VALUE locally; never paste secrets into shared code.',
      'import base64, gzip, json, os, urllib.parse',
      'data = os.environ["VALUE"].encode()',
    ],
    js = [
      '// Set VALUE locally. Run as an async module; this code makes no network requests.',
      'const asText = value => typeof value === "string" ? value : new TextDecoder().decode(value);',
      'const asBytes = value => typeof value === "string" ? new TextEncoder().encode(value) : value;',
      'let data = VALUE;',
    ]
  for (const node of nodes) {
    const id = node.selected!.detector
    if (id === 'base64') {
      shell.push('base64 --decode')
      python.push('data = base64.b64decode(data)')
      js.push(
        'data = Uint8Array.from(atob(asText(data).replace(/-/g, "+").replace(/_/g, "/")), char => char.charCodeAt(0));',
      )
    } else if (id === 'compression') {
      const label = node.selected?.label
      if (label === 'gzip') {
        shell.push('gunzip')
        python.push('data = gzip.decompress(data)')
        js.push(
          'data = new Uint8Array(await new Response(new Blob([asBytes(data)]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer());',
        )
      } else {
        python.push('# This compression wrapper needs a matching local decompressor.')
        js.push('// Use a matching local decompressor for this wrapper.')
      }
    } else if (id === 'json') {
      python.push('data = json.loads(data)')
      js.push('data = JSON.parse(asText(data));')
    } else if (id === 'hex') {
      shell.push('xxd -r -p')
      python.push('data = bytes.fromhex(data.decode().removeprefix("0x"))')
      js.push(
        'data = Uint8Array.from(asText(data).replace(/^0x/, "").replace(/\\s/g, "").match(/.{2}/g), x => parseInt(x, 16));',
      )
    } else if (id === 'url') {
      python.push('data = urllib.parse.unquote(data.decode()).encode()')
      js.push('data = decodeURIComponent(asText(data));')
    } else {
      python.push(`# ${id}: reproduce with its documented local parser.`)
      js.push(`// ${id}: use its documented local parser.`)
    }
  }
  python.push('print(data)')
  js.push('console.log(data);')
  return { shell: shell.join(' | '), python: python.join('\n'), javascript: js.join('\n') }
}
