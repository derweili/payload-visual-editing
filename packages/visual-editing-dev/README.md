# @derweili/payload-visual-editing-dev

A small Next + Payload site for developing the visual editing packages and running their e2e tests.
Private; it is never published.

- **Schema** (`src/payload.config.ts`): every field shape the plugin supports. That covers named and
  unnamed tabs, nested arrays, groups, collapsible + row, blocks, localized fields, Lexical, an
  upload, a number, a relationship and a localized global. Live Preview is on for the page and the
  global.
- **Database:** an in-memory D1 from Miniflare (`src/db.ts`). Every start begins empty and is seeded
  in `onInit` (`src/seed.ts`, which also holds the test login).
- **Page** (`src/app/(frontend)/page.tsx`): renders every field. In Draft Mode the text is encoded,
  images and numbers carry source tags, and the overlay is mounted.

## Use

```sh
pnpm --filter @derweili/payload-visual-editing-dev dev       # http://localhost:3100
pnpm --filter @derweili/payload-visual-editing-dev test:e2e  # starts the app, or reuses a running one
pnpm test:e2e                                                 # the same, from the repo root
pnpm --filter @derweili/payload-visual-editing-dev pack:check # build, pack, install, import, type-check
```

Log in at `/admin` with the user from `src/seed.ts`. Open `/next/preview?path=/` for the page in
Draft Mode. Run `generate:importmap` after changing admin components.

## e2e tests (`e2e/`)

- Published HTML has no encoded characters and no `data-pve-` attributes. A counter-check shows
  that the Draft Mode HTML does have them, so this test can actually fail.
- Standalone: the edit button opens the field in a new tab. Covered: a text field, a field in an
  unnamed tab, a field in a named tab, a nested array row, a nested group, a collapsible + row, a
  block, Lexical, a number, an upload, an English value, the global, and a populated relationship
  (opens the related document).
- Live Preview: the same tab focuses the field. Covered: an array row, a tab switch, an upload,
  another document, and the global.

## Pack check (`scripts/pack-check.mjs`)

Checks what npm would ship. It builds and packs the three packages, installs the tarballs into an
empty project, imports every entry point in Node, and type-checks them with `nodenext`. This
catches missing files, wrong `publishConfig` exports, `workspace:` versions that weren't replaced,
and import paths without extensions.

CI (`.github/workflows/ci.yml`) runs the tests, the pack check and the e2e tests on every pull
request.
