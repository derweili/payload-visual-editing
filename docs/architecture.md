# Architecture

Sanity-style visual editing for Payload 3: an editor clicks an element in the site preview (in its
own tab or in Payload's Live Preview) and lands on the right document with the right field focused,
including fields inside tabs, groups, arrays and blocks.

Why build it: Payload's Content Link is enterprise-only and Vercel-only, payload-better-editor only
supports `blocks` fields, and the inline-editing plugins are text-only. The decisions behind each
part are in [docs/adr](./adr/); where this page and an ADR disagree, the ADR wins.

## Scope

**In scope (0.x):**

- Encoding of `text`, `textarea` and Lexical `richText` text in collections and globals, only for
  requests that ask for it (Draft Mode).
- Paths through arrays, groups, named and unnamed tabs, collapsibles, rows, blocks and localized
  fields.
- Source tags (`data-pve-*` attributes) for values stega can't carry: images, numbers,
  relationships, selects, dates.
- Frontend overlay: hover outline and "Edit" button. Standalone it opens the admin deep link; in
  the Live Preview iframe it sends a `postMessage`.
- Admin: a `?field=` deep link or a Live Preview message focuses the field (switch tab, expand row,
  scroll, focus), and navigates to another document or global when the ref points there.

**Not in scope (for now):** inline editing on the page; drag & drop or adding blocks/rows from the
preview; a custom presentation view; highlighting in the preview when a field is focused in the
admin; tested support for frontends other than Next.js (the vanilla overlay is framework-agnostic).

## Packages

| Package | Contents | Depends on |
| --- | --- | --- |
| `@derweili/payload-visual-editing-core` | Protocol types and version, path utils, stega wrapper (`encode`, `decode`, `split`, `clean`), source tags, admin URL builder, message type guards | `@vercel/stega` |
| `@derweili/payload-visual-editing` | `./server`: plugin, `afterRead` encoding, options. `./client`: deep-link handler, `postMessage` listener, field focus | core; peers: `payload`, `@payloadcms/ui`, `react`, `next` |
| `@derweili/payload-visual-editing-overlay` | `./vanilla`: DOM scan, outlines, click handling, `fieldAttrs`, `stegaClean`. `./react`: `<VisualEditing />` | core; peer: `react` (React entry only) |

The package names are fixed: Payload's import map stores them as strings.

## Data flow

1. The site reads drafts with `context: { encodeSourceMaps: true }` (Local API) or
   `?encodeSourceMaps=true` (REST). The plugin's `afterRead` hook walks the document with the
   schema and appends an invisible ref to every text value; other values get a source tag.
2. The overlay scans the rendered page for refs and `data-pve-*` attributes and shows an outline
   and an "Edit" button on hover.
3. Inside the Live Preview it sends `pve:focus` to the admin (after the `pve:ready` handshake);
   in its own tab it opens the deep link. Both end in the same focus logic in the admin.

## Protocol (core, versioned)

- **Source ref** (stega payload, short keys to keep strings small):
  `{ "o": "pve", "v": 1, "c": "pages", "id": "abc", "p": "team.2.name", "l": "de" }`. For globals,
  `"g": "header"` replaces `c` + `id`.
- **Path format:** the data path, with dots and numeric array indices (`team.2.name`). Named tabs
  and groups appear in the path; unnamed tabs, collapsibles and rows don't. The admin works those
  out from the schema.
- **Messages:** `{ type: "pve:focus", v: 1, ref }` (overlay → admin) and `pve:ready`
  (admin → overlay). Both sides validate with type guards and check `event.origin`.
- **Deep link:** `/admin/collections/{c}/{id}?field={p}` and `/admin/globals/{g}?field={p}`, plus
  `&locale=` when localized.

## Encoding trigger

- Who may switch encoding on is decided per request by the `canEncode` option (default: logged-in
  users).
- Sites encode only when `draftMode().isEnabled`, never during ISR or `generateStaticParams`, and
  keep those reads out of their caches.

## Cloudflare Workers

- No Node-only APIs in package code (`fs`, `path`, `child_process`); a test in each package
  enforces it.
- Encoded responses must never reach a cache (e.g. OpenNext's incremental cache). The e2e tests
  check published HTML for zero-width characters and `data-pve-` attributes.

## Testing

| Where | What | Environment |
| --- | --- | --- |
| core | Ref roundtrip, stega encode/decode/clean/split, path parsing, admin URLs, message guards, source tags | node |
| plugin `./server` | Schema walk against fixture configs (all field shapes, localized, Lexical), options, flag off → output identical, populated relationships keep their own ref | node |
| plugin integration | `getPayload` on an in-memory D1 (Miniflare) with fixture collections: Local API and REST, with and without encoding | node |
| plugin `./client` | Path → tab/row/field resolution, deep-link parsing, message listener (origin check, handshake), the DOM adapter; a guard test against the installed Payload markup | jsdom |
| overlay | DOM scan, innermost element, click → `postMessage` or deep link, `fieldAttrs()` | jsdom |
| test app (e2e) | Playwright against `packages/visual-editing-dev`: standalone and Live Preview clicks focus the field; published HTML stays clean | browser |

Admin DOM details (field ids, tab buttons) are only touched in one adapter module, so a Payload
update breaks exactly one place.

## Risks

| Risk | Effect | Mitigation |
| --- | --- | --- |
| Stega strings break logic (comparisons, slugs, meta, `alt`, JSON-LD) | Broken preview pages, wrong URLs | Default excludes, opt-in collections, `stegaClean()` at known places, Draft-Mode-only encoding |
| Encoded output reaches a cache or the live site | Invisible characters in production HTML, SEO | Encode only in Draft Mode; e2e check for zero-width characters |
| Payload admin internals change (field ids, tabs, row collapse) | Focus stops working after an update | One adapter module, public hooks first, a markup guard test, pinned Payload range |
| Worker bundle size | Deploy fails | Keep the overlay out of the server bundle |
