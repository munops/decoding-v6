import { readdir, readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import preact from '@astrojs/preact'
import sitemap from '@astrojs/sitemap'
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://decod.ing',
  output: 'static',
  integrations: [
    preact(),
    {
      name: 'decoding-offline-inventory',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          const root = fileURLToPath(dir)
          const walk = async (path) =>
            (
              await Promise.all(
                (await readdir(new URL(path, dir), { withFileTypes: true })).map(async (entry) =>
                  entry.isDirectory() ? walk(`${path}${entry.name}/`) : [`${path}${entry.name}`],
                ),
              )
            ).flat()
          const files = await walk('')
          const allAssets = files
            .filter((path) => /^(?:_astro|fonts)\//.test(path))
            .map((path) => `/${path}`)
          const home = await readFile(new URL('index.html', dir), 'utf8')
          const initial = new Set(
            [...home.matchAll(/(?:src|href|component-url|renderer-url)="(\/_astro\/[^"?]+)"/g)].map(
              (match) => match[1],
            ),
          )
          for (const asset of allAssets)
            if (/decoder\.worker.*\.js$|signals\.module.*\.js$/.test(asset)) initial.add(asset)
          const queue = [...initial]
          for (const asset of queue) {
            if (!asset.endsWith('.js')) continue
            const source = await readFile(new URL(asset.slice(1), dir), 'utf8')
            for (const match of source.matchAll(
              /(?:from\s*|import\s*)["'](\.?\/?[^"']+\.(?:js|css))["']/g,
            )) {
              const relative = new URL(match[1], `https://local.invalid${asset}`).pathname
              if (allAssets.includes(relative) && !initial.has(relative)) {
                initial.add(relative)
                queue.push(relative)
              }
            }
          }
          await writeFile(
            `${root}/offline-assets.json`,
            JSON.stringify({
              initial: [...initial],
              assets: allAssets,
              tools: files
                .filter((path) =>
                  /^(?:(?:ko|ja|zh-cn|es|pt-br|de|fr)\/)?[a-z0-9-]+\/index\.html$/.test(path),
                )
                .map((path) => `/${path.replace(/index\.html$/, '')}`),
            }),
          )
        },
      },
    },
    sitemap({
      filter: (page) => !/^https:\/\/decod\.ing\/(?:ja|zh-cn|es|pt-br|de|fr)(?:\/|$)/.test(page),
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
  vite: { worker: { format: 'es' } },
})
