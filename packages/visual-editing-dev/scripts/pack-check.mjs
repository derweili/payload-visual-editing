/**
 * Checks what npm would ship: builds and packs the three packages, installs the tarballs into an
 * empty project, then imports every entry point in Node and type-checks them with `nodenext`.
 * Catches missing files, wrong `publishConfig` exports, unresolved `workspace:` versions and ESM
 * import paths without extensions. Run: `pnpm pack:check` (in this package).
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packages = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const names = ['visual-editing-core', 'payload-visual-editing', 'visual-editing-overlay']
const work = mkdtempSync(join(tmpdir(), 'pve-pack-'))
const tarballs = join(work, 'tgz')
const consumer = join(work, 'consumer')
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: 'inherit' })

try {
  for (const name of names) {
    run('pnpm', ['run', 'build'], join(packages, name))
    run('pnpm', ['pack', '--pack-destination', tarballs], join(packages, name))
  }

  run('mkdir', ['-p', consumer])
  writeFileSync(join(consumer, 'package.json'), JSON.stringify({ name: 'consumer', private: true, type: 'module' }))
  const files = readdirSync(tarballs).map((file) => join(tarballs, file))
  // Peers (payload, react, next) are the consumer's; the entries below don't load them at import
  run('npm', ['install', '--no-audit', '--no-fund', '--legacy-peer-deps', ...files], consumer)

  writeFileSync(
    join(consumer, 'check.mjs'),
    `
const core = await import('@derweili/payload-visual-editing-core')
const vanilla = await import('@derweili/payload-visual-editing-overlay/vanilla')
const server = await import('@derweili/payload-visual-editing/server')
const encoded = core.stegaEncode('Hallo', core.encodeRef({ collection: 'pages', id: 1, path: 'title' }))
if (core.decodeRef(core.stegaDecode(encoded))?.path !== 'title') throw new Error('stega roundtrip failed')
if (vanilla.stegaClean(encoded) !== 'Hallo') throw new Error('stegaClean failed')
if (typeof server.visualEditingPlugin !== 'function') throw new Error('server entry incomplete')
console.log('pack check: imports ok')
`,
  )
  run('node', ['check.mjs'], consumer)

  writeFileSync(
    join(consumer, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: { module: 'nodenext', moduleResolution: 'nodenext', strict: true, noEmit: true, lib: ['ES2022', 'DOM'], types: [] },
      files: ['check.ts'],
    }),
  )
  writeFileSync(
    join(consumer, 'check.ts'),
    `
import { encodeRef, stegaEncode, type SourceLocation } from '@derweili/payload-visual-editing-core'
import { fieldAttrs, stegaClean } from '@derweili/payload-visual-editing-overlay/vanilla'
const source: SourceLocation = { collection: 'pages', id: 1, path: 'title' }
export const text: string = stegaClean(stegaEncode('Hallo', encodeRef(source)))
export const attrs: Record<string, string> = fieldAttrs(source)
`,
  )
  run('pnpm', ['exec', 'tsc', '-p', consumer], resolve(packages, 'visual-editing-dev'))
  console.log('pack check: types ok')
} finally {
  rmSync(work, { recursive: true, force: true })
}
