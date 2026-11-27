# Payload visual editing

Click on content in a Next.js preview to open the exact field in the Payload admin, including in
the Live Preview. Text carries an invisible source map (stega); images, numbers and other values
carry `data-` attributes.

| Package | What it does |
| --- | --- |
| [`@derweili/payload-visual-editing`](./packages/payload-visual-editing) | Payload plugin: encodes source maps into draft reads (`/server`), and adds an admin component that focuses a field from a link or a Live Preview click (`/client`) |
| [`@derweili/payload-visual-editing-overlay`](./packages/visual-editing-overlay) | Frontend: the hover outline and edit button (`/vanilla`, `/react`), `stegaClean`, `fieldAttrs` |
| [`@derweili/payload-visual-editing-core`](./packages/visual-editing-core) | Shared protocol, stega, path and source helpers; used by the two above |
| [`@derweili/payload-visual-editing-dev`](./packages/visual-editing-dev) | Private test app (Next + Payload) for development and the e2e tests |
| [`apps/demo`](./apps/demo) | Demo corporate site (Next 16, Payload, Tailwind, shadcn/ui) on Neon and Vercel |

How it fits together:

1. The site reads drafts with `context: { encodeSourceMaps: true }`. The plugin appends an invisible
   ref (collection or global, id, field path, locale) to every text value. Values that can't hold
   hidden text get a source tag instead.
2. The overlay finds the refs in the rendered page and shows an "Edit" button on hover.
3. Standalone, the button opens `/admin/collections/<slug>/<id>?field=<path>`. In the Live
   Preview, it sends a `postMessage` to the admin. Either way, the admin component opens the tab,
   expands the row, scrolls to the field and focuses it.

Start with the [getting started guide](./docs/guide/getting-started.md), or the
[plugin README](./packages/payload-visual-editing) and the
[overlay README](./packages/visual-editing-overlay). The design is in
[docs/architecture.md](./docs/architecture.md), the decisions in [docs/adr](./docs/adr).

### Set up with an AI agent

The repository ships [agent skills](./skills) for Claude Code, Cursor, Codex and others: one for
the setup, one with the rules for working in a project that uses these packages.

```sh
npx skills add derweili/payload-visual-editing
```

Then ask your agent to "set up Payload visual editing". More in
[docs/ai/setup.md](./docs/ai/setup.md).

Requirements: Payload 3.94+, Next.js 15.4+ / 16, React 19. Runs on Cloudflare Workers (no
Node-only APIs in package code).

- **Builds on Payload's preview.** For clicks inside the Live Preview, set up Payload's own
  [Live Preview](https://payloadcms.com/docs/live-preview/overview) first; this plugin adds
  click-to-edit on top and doesn't configure it. See [docs/guide/live-preview.md](./docs/guide/live-preview.md).
- **Multilingual sites are supported and tested.** With Payload
  [localization](https://payloadcms.com/docs/configuration/localization), the admin opens the
  field in the locale of the page. The e2e tests run against a two-locale site.

## Development

```sh
pnpm install
pnpm typecheck
pnpm test         # unit + integration (in-memory D1)
pnpm dev          # test app on http://localhost:3100 (login: packages/visual-editing-dev/src/seed.ts)
pnpm dev:demo     # demo site on http://localhost:3000 (needs Postgres, see apps/demo/README.md)
pnpm test:e2e     # Playwright against the test app
pnpm pack:check   # build, pack, install into an empty project, import and type-check
pnpm docs:dev     # documentation site (VitePress) on http://localhost:5173
pnpm docs:build   # build the documentation; fails on dead links
```

- **Source in the workspace, `dist/` when published.** In this repo the `exports` point at `src/`,
  so the test app uses the TypeScript source directly.
  `publishConfig` switches a published package to `dist/`, which `pnpm build` produces (swc for the
  JavaScript, tsc for the declarations).
- **Relative imports name the real file (`./stega.ts`).** Every bundler resolves them as written:
  Turbopack, webpack and Vitest. The build rewrites them to `.js` (`rewriteRelativeImportExtensions`).
  An app that uses the source directly (e.g. via `link:`) needs the packages in
  `transpilePackages` and `allowImportingTsExtensions` in its tsconfig.
- **CI** (`.github/workflows/ci.yml`): typecheck, tests, the pack check and the e2e tests on every
  pull request.
- **Docs:** a VitePress site in [`docs/`](./docs) (guides, reference, architecture, ADRs). The
  homepage (`docs/index.md`) is the marketing page; its components live in
  `docs/.vitepress/theme/`. The demo video is hosted elsewhere: set `video.src` in the
  homepage frontmatter.
- **Agent skills:** [`skills/`](./skills), installable with `npx skills add`. Keep them in step
  with the API when it changes.
- **Decisions:** [docs/adr](./docs/adr).

## Releasing

Versioned with [Changesets](https://github.com/changesets/changesets). The three packages share
one version (`fixed`). The test app and the demo are ignored. Releases run only in CI
([`.github/workflows/release.yml`](./.github/workflows/release.yml)):

1. With every change to a package, add a changeset in the same pull request:
   `pnpm changeset` (pick the packages, the bump (0.x: minor = breaking, patch = the rest), a
   summary). The summary becomes the changelog entry.
2. On merge to `main`, the release workflow opens or updates the **Version Packages** pull
   request: versions bumped, `CHANGELOG.md` written.
3. Merging that pull request publishes to npm (Trusted Publishing, with provenance), pushes the
   git tags and creates a GitHub Release per package.

Don't publish from a local machine.
