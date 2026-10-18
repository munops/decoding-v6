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
  const ids = linearChain(root)
    .map((n) => n.selected?.detector)
    .filter((id): id is string => !!id)
  const shell = ['printf \'%s\' "$VALUE"'],
    python = [
      '# Set VALUE locally; never paste secrets into shared code.',
      'import base64, gzip, json, os, urllib.parse',
      'data = os.environ["VALUE"].encode()',
    ],
    js = ['// Set VALUE locally. This code makes no network requests.', 'let data = VALUE;']
  for (const id of ids) {
    if (id === 'base64') {
      shell.push('base64 --decode')
      python.push('data = base64.b64decode(data)')
      js.push('data = atob(data);')
    } else if (id === 'compression') {
      const label = linearChain(root).find((n) => n.selected?.detector === id)?.selected?.label
      if (label === 'gzip') {
        shell.push('gunzip')
        python.push('data = gzip.decompress(data)')
        js.push('// gzip: use DecompressionStream("gzip") on the byte output.')
      } else {
        python.push('# This compression wrapper needs a matching local decompressor.')
        js.push('// Use a matching local decompressor for this wrapper.')
      }
    } else if (id === 'json') {
      python.push('data = json.loads(data)')
      js.push('data = JSON.parse(data);')
    } else if (id === 'hex') {
      shell.push('xxd -r -p')
      python.push('data = bytes.fromhex(data.decode().removeprefix("0x"))')
      js.push('data = Uint8Array.from(data.match(/.{2}/g), x => parseInt(x, 16));')
    } else if (id === 'url') {
      python.push('data = urllib.parse.unquote(data.decode()).encode()')
      js.push('data = decodeURIComponent(data);')
    } else {
      python.push(`# ${id}: reproduce with its documented local parser.`)
      js.push(`// ${id}: use its documented local parser.`)
    }
  }
  python.push('print(data)')
  js.push('console.log(data);')
  return { shell: shell.join(' | '), python: python.join('\n'), javascript: js.join('\n') }
}
