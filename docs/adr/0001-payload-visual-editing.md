---
status: accepted
date: 2026-11-27
---

# Payload visual editing: encoding design and setup

The design decisions behind these packages, checked against Payload 3.94.1. The overall design is in
`docs/architecture.md`; where the two disagree, this record wins. The packages were first built inside
a client site's repository and moved here without their history; the reasoning lives on in this
record.

## 1. Encode in one collection/global `afterRead` hook that walks the schema

The plugin adds one `afterRead` hook to each collection and global. The hook walks the finished
document together with `flattenedFields` and builds every data path itself.

We rejected an `afterRead` hook on every field. Payload does pass those hooks the correct path, array
indices included. But when a document is read with every locale at once (`locale: 'all'`), the hook runs
once per locale without being told which one. "Startseite" and "Home" arrive under the same path, so the
ref can't carry the right locale. Rows of a localized array are ambiguous the same way. Supporting
`locale: 'all'` is a requirement. A field hook would also make the plugin rewrite every field in the config, and Lexical
needs its own node walk in either approach.

The walk stays small because `flattenedFields` already drops unnamed tabs, rows and collapsibles (they
don't nest data). Named tabs appear as `tab` with their own fields. The cost: we maintain the walk and must
extend it for field types it doesn't know yet. Blocks defined once in the config and referenced by slug,
join fields and virtual fields aren't covered yet.

Note for focusing fields in the admin: Payload's `indexPath` is not an array index. It is the position of unnamed tabs, rows and
collapsibles. `schemaPath` names unnamed tabs as `_index-<field>-<tab>`.

## 2. Populated relationships keep their own ref; the innermost ref wins

Payload populates a relationship with a nested `find` on the same `req`, so `req.context` (and with it
the encode switch) reaches the related document. The related collection runs its own hook and encodes
with its own collection and id before the parent's hook runs. The parent walk skips relationship and
upload values. As a safety net, `stegaEncode` returns a string unchanged if it already carries a ref.

## 3. Switching encoding on: context flag, REST parameter, `canEncode` option

- Local API: `context: { encodeSourceMaps: true }`.
- REST: `?encodeSourceMaps=true`. A `beforeOperation` hook on each collection and global copies it into
  `req.context` (REST requests start with an empty `req.context`).
- Who may switch it on is decided per request by a plugin option `canEncode({ req })`. The default is
  logged-in users only (`Boolean(req.user)`), so anonymous visitors of the public API never get encoded
  output. Projects can allow more, e.g. a preview deployment or a secret header.
- Encoding covers all content, published and draft. Being a draft doesn't switch encoding on by itself.

## 4. Stega skip mode: "auto" by default, stricter on URLs than @vercel/stega, configurable

By default, strings that look like a URL or a date stay unencoded, so links and dates don't break.
Dates follow `@vercel/stega`'s `'auto'` rule. For URLs we deviate (core `looksLikeUrlOrDate`):
`@vercel/stega` skips anything `new URL()` accepts, which includes prose like "Platzhaltertext: Umbau …"
(scheme `platzhaltertext:`). On a real site that left a project description unencoded and not
clickable. A
string now counts as a URL only if it has no whitespace and parses as one, because link targets never
contain whitespace. Link fields are excluded by name anyway. A plugin option allows `skip: false` (encode
everything not excluded) or `true`.

## 5. IDs are never encoded

Any field named `id` at any level is never encoded: the document id, array row ids and block ids. Neither
are relationship/upload values or `blockType`. This is not configurable. IDs are used as React keys, for
lookups and for matching rows; hidden characters in them would break that, and the overlay has no use for
them. The spike showed this rule is needed: array rows and blocks have an `id` field of type `text`, so a
naive walk encodes them. Text ids (e.g. Postgres UUIDs) would be hit the same way.

## 6. Lexical: refs point at the field, not the node

Every text node of a Lexical field carries the ref of the field itself (e.g. `body`). Encoding the node
position would be easy, but focusing a single node in the admin needs the Lexical editor API.
Adding an optional node key to the ref later is not a breaking protocol change.

## 7. Package setup

- All packages are `"private": true` until the first deliberate release. That blocks an accidental
  `pnpm publish`.
- `@vercel/stega` (MPL-2.0) is used as an unmodified npm dependency and never vendored or patched. MPL is
  copyleft per file: as long as we don't modify its files, our packages can stay MIT.
- No Node-only modules in package source (Cloudflare Workers). A test in each package enforces it.

## 8. Added while building the encoder

- **Opt-in scope.** The plugin encodes only the collections and globals listed in its options (default:
  none) and throws on unknown slugs. Collections that only hold images (e.g. media) can stay
  out, so `alt` texts stay clean.
- **REST only on GET.** The query parameter is honoured only for `GET` reads. A write (PATCH, POST)
  reads the document again on the same request, which would otherwise encode the response of the write.
- **Encoded text is never saved.** A `beforeValidate` hook strips stega characters from incoming data,
  e.g. when an editor copies text from the preview into the admin.
- **Sites encode only in Draft Mode.** A site passes `context.encodeSourceMaps` only for Draft Mode
  reads and must keep those reads out of its caches (`unstable_cache`, `"use cache"`). Next.js
  doesn't cache Draft Mode renders, and OpenNext's cache interceptor passes requests with the Draft
  Mode cookie straight to the server. The test app's e2e tests check that published HTML stays clean.
- **`stegaClean` in server code comes from the overlay's `./vanilla` entry.** The `./react` entry is a
  client module (`'use client'`); a function imported from it into a server component isn't callable.

## 9. Focusing fields in the admin, public API first

The admin component (`VisualEditingAdmin`, mounted by the plugin through the `beforeDocumentControls`
slot of every scoped collection and global) focuses a field from `?field=` or from a `pve:focus` sent
by the Live Preview. The rule: Payload's public API wherever it exists. DOM access only where
there is none, in one module (`src/client/dom-adapter.ts`), failing silently. No patching, no copied
internals, no fixed delays: waiting is always for a DOM change, with a timeout. Anything beyond that
needs a deliberate decision, weighing the clean options against the fragile ones.

- **Public API:** `useSearchParams`, `useDocumentInfo`, `useForm` (`getField`, `dispatchFields`
  with the typed `SET_ROW_COLLAPSED` action plus `setDocFieldPreferences`, exactly like Payload's array
  field), `useConfig().getEntityConfig` for the field tree, `useLivePreviewContext().iframeRef` and
  `popupRef`. `&locale=` is Payload's own locale switch.
- **DOM, in the adapter:** field ids `field-<path with . as __>` (Payload's label links), Lexical's
  `data-field-path`, the `field-type` wrapper for the highlight.
- **Tabs:** Payload keeps the active tab in component state and has no API to
  switch it after mount. The adapter clicks the tab button (`.tabs-field__tab-button`), as an editor
  would, so Payload's own handler switches the tab and saves the preference. Rejected: a hint only (one
  more click for every field outside the first tab) and waiting for an upstream API.
- **Guard:** `test/payload-markup.test.ts` reads the installed `@payloadcms/ui` and
  `@payloadcms/richtext-lexical` and fails when a class, id pattern or attribute the adapter relies on
  disappears, so a Payload update can't break focusing unnoticed.
- **Layout shifts after focusing:** lazy-loaded images push a just-focused field out of view.
  `keepInView` (ResizeObserver on the field and its ancestors; the admin fixes `<body>` to the viewport
  height, so watching it alone sees nothing) re-centres it vertically on every layout change (which also
  keeps it clear of the admin's fixed top bar), and the highlight starts only once it stopped. It
  stops at the first user input (wheel, touch, pointer, key; capture phase), after 1 s without layout
  changes, or after 5 s, so it never fights an editor.
- **Messages:** accepted only from the view's preview iframe (source and origin) or popup. The admin
  answers `pve:ready`, so the overlay focuses instead of opening a tab. A ref to another document or
  locale navigates to its edit view with `?field=`.
- **Not covered:** tabs inside array/block rows (rows have React-generated ids, so those tabs can't be
  located; the field is focused only if its tab is open) and collapsibles that start collapsed (their
  state is read from preferences once, on mount).

## 10. Test setup

- The plugin's integration tests use Payload's D1 adapter on an in-memory Miniflare D1, not
  `@payloadcms/db-sqlite`. Installing `@payloadcms/db-sqlite` next to a D1 app brings in
  `@libsql/client`; pnpm then resolves the app's `@payloadcms/drizzle` with it as well, and the app's
  D1 migration types stop compiling. Testing on D1 is also closer to production on Workers. Miniflare comes with
  wrangler as a beta (`convertV4MiniflareOptions` is needed for its options), so wrangler updates may
  require touching the fixture setup.
- Vitest 4 removed `vitest.workspace.ts`; every package has its own `vitest.config.ts`, and
  `pnpm test` runs them all.

## 11. Images, numbers and other values without stega text: source tags

Stega needs a string that is rendered as text. Images, numbers, selects, dates, relationships and text
left unencoded (excluded, or URL-like under "auto") have none, so they weren't clickable.

- **Decision:** the encoder tags them with their `SourceLocation` under `Symbol.for` keys (core
  `source.ts`). A populated upload or relationship becomes a shallow, tagged copy (`sourceOf(image)`),
  so the tag travels with the object through mapping code. Every other value is recorded on its parent
  (`fieldSourceOf(doc, 'year')`), because primitives can't carry properties. Symbol keys are invisible
  to JSON, REST and `Object.keys`, so the data is unchanged for everything else, and published reads
  (no encoding) get no tags at all.
- **Consequence:** tags don't survive serialization. The site reads them on the server, in its mapping
  code, and passes the plain `SourceLocation` on (e.g. an `Image.source` field in its image model);
  components spread `fieldAttrs(source)` onto the element. `fieldAttrs(null)` is empty, so outside Draft
  Mode nothing is rendered.
- **Rejected:** a parallel source map keyed by path (the site would have to keep paths in sync with
  every mapping) and encoding numbers as strings (changes types and breaks arithmetic and sorting).
- **Focusing such fields:** an upload field has no input. The adapter focuses, in this order, an input,
  a button (the upload's edit button), a link, also in the field's `field-type` wrapper. Uploads render
  their controls after loading the file details, so when none exists yet it waits for one (DOM change,
  with the usual timeout) and focuses it only if focus hasn't moved in the meantime.

## 12. Test app and e2e tests; two findings from them

- **Test app:** a separate private workspace package, `packages/visual-editing-dev`, with its own
  Next + Payload app, rather than e2e tests against a real site. Its schema covers every field shape
  the plugin supports (a real site uses only some of them), and no site's content changes can break
  it. Its database is the same in-memory Miniflare D1 as in the integration tests, seeded on every
  start, so no SQLite adapter is needed (see section 10). `pnpm test:e2e` runs it.
- **Deep link focused too early:** Payload renders the fields disabled until the form state has
  loaded, and `focus()` on a disabled input does nothing. On a fast server, `?field=` was focused in
  that window. The admin component now waits for `useFormInitializing()` (public hook). A slower
  dev server had hidden this.
- **Fields far down a long form aren't rendered (a known issue with a workaround):** Payload renders each list
  of fields only once it comes within 1000 px of the viewport (`RenderIfInViewport`), and has no
  public API to force it. `revealElement` in the adapter first scrolls the nearest rendered ancestor
  field (by field id) into view. If the field still isn't there, it scrolls down one screen at a time
  until it appears or the page ends. Each step waits for a DOM change (at most 300 ms), and the whole
  search ends after 3 s. It uses only field ids and normal scrolling. Rejected: scrolling to the
  ancestor only (misses fields under collapsibles, rows and unnamed tabs, and deep rows of long
  arrays), and forcing Payload to render (faked IntersectionObserver or patching; relies on
  internals).
  Listed under "Known issues" in the plugin README. Replace it if Payload ever offers a way to
  render a field on demand.

## 13. Build, release and repository

- **Build:** swc writes `dist/` and tsc writes the declarations, as in Payload's plugin template.
  In the workspace, `exports` keep pointing at `src/`, so the test app uses the TypeScript source
  with no build step. `publishConfig` points a published package at `dist/`.
- **Relative imports name the real file (`./stega.ts`):** the published ESM needs file
  extensions, so the build rewrites `.ts` to `.js` (`rewriteRelativeImportExtensions` in swc for
  the JavaScript). tsc keeps `.ts` in the declarations, which TypeScript accepts even for
  `nodenext` consumers with strict library checks (verified). An app that uses the source directly
  (workspace or `link:`) needs `allowImportingTsExtensions`, because it type-checks that source.
  - Changed from `.js` specifiers: those resolved only with webpack's `extensionAlias`. Turbopack
    (Next 16's default dev bundler) has no equivalent, and a host app's `next dev` broke. The test app now runs on Turbopack, so the e2e tests cover it.
  - Rejected: swc's `resolveFully` (it needs a `baseUrl`, and the declarations would stay without
    extensions, which breaks `nodenext` consumers).
- **Pack check:** `pnpm pack`, install into an empty project, import and type-check with
  `nodenext`. It tests the real published shape rather than the workspace.
- **Versioning:** Changesets, with the three packages `linked` and starting at 0.1.0. The test app
  is ignored. The packages stay `"private": true` until the first publish.
- **Licence:** MIT.
- **CI:** typecheck, tests, the pack check and the e2e tests on every pull request.
- **Own repository, no history:** the packages started in a client site's pnpm workspace and moved
  here as one initial commit. The history mixed package work with site work, so it was dropped
  rather than filtered; this record keeps the reasoning. A trial extraction beforehand found one
  missing devDependency (`@types/react-dom`, which had come from the site's root).
