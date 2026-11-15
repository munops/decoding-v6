import { readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { detectorSpecs } from '@decoding/spec-registry'
import { operations } from '@decoding/operations'
const pages = (path: string): number =>
  readdirSync(path, { withFileTypes: true }).reduce(
    (count, file) =>
      count +
      (file.isDirectory() ? pages(join(path, file.name)) : file.name.endsWith('.html') ? 1 : 0),
    0,
  )
console.log(
  JSON.stringify(
    {
      formats: detectorSpecs.length,
      tools: operations.length,
      builtPages: existsSync('apps/web/dist') ? pages('apps/web/dist') : null,
    },
    null,
    2,
  ),
)
