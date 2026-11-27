# @derweili/payload-visual-editing

Payload 3 plugin for visual editing:

- **`/server`:** encodes an invisible source map into every text value of draft reads (text,
  textarea, Lexical), and tags images, numbers and other values that can't hold hidden text.
- **`/client`:** an admin component that focuses a field from a `?field=` link or from a click in
  the Live Preview. It opens the tab, expands the row, scrolls the field to the centre, focuses it
  and highlights it.

Use it with [`@derweili/payload-visual-editing-overlay`](../visual-editing-overlay) on the
frontend. Overview: [README](../../README.md).

## Setup

```ts
// payload.config.ts
import { visualEditingPlugin } from '@derweili/payload-visual-editing/server'

export default buildConfig({
  // …
  plugins: [
    visualEditingPlugin({
      collections: ['pages', 'posts'],
      globals: ['header'],
    }),
  ],
})
```

Then run `payload generate:importmap`, so the admin can load the component.

### Reading with source maps

Encoding is off unless a request asks for it, and only draft/preview reads should ask:

```ts
// Local API (server code: always allowed)
const page = await payload.findByID({
  collection: 'pages',
  id,
  draft: true,
  context: { encodeSourceMaps: true },
})
```

```http
GET /api/pages/1?draft=true&encodeSourceMaps=true
```

The REST parameter only works for GET requests, and by default only for logged-in users (see
`canEncode`).

**Never cache encoded reads.** A cache entry with hidden characters could later be served on the
live site. Skip `unstable_cache`/`"use cache"` in Draft Mode, or include the draft state in the
cache key.

Writes are safe: the plugin strips encoded characters before validation, so text copied from the
preview back into the admin is saved clean.

## Options

```ts
visualEditingPlugin({
  enabled?: boolean            // default true; false leaves the config untouched
  collections?: string[]       // collections with source maps and field focusing (default: none)
  globals?: string[]           // globals with source maps and field focusing (default: none)
  focusFields?: boolean        // default true; adds the admin component to their edit views
  sourceMaps?: {
    enabled?: boolean          // default true; false removes the encoding hooks
    canEncode?: ({ req }) => boolean | Promise<boolean>
                               // who may use ?encodeSourceMaps=true (default: logged-in users);
                               // the Local API context flag is always trusted
    skip?: 'auto' | boolean    // default 'auto': leaves URL- and date-like strings unencoded;
                               // false encodes every string, true none
    include?: string[]         // only encode these paths (default: all)
    exclude?: string[]         // never encode these paths (default: ['slug', 'url'])
  },
})
```

Path patterns match the data path without array indices (`team.links.label`). `*` is one segment
and `**` any number of segments; a pattern without a dot matches a field name at any depth
(`'url'` matches `links.url`). Setting `exclude` replaces the defaults, so add `...DEFAULT_EXCLUDE`
if you still want them. Fields named `id` are never encoded.

Exclude every text field that feeds logic rather than display: slugs, URLs, link targets, CSS
values, enum-like text, anything compared or parsed. Excluded and skipped fields still get a source
tag, so they stay clickable through `fieldAttrs`.

## What gets encoded

| Field | In the data |
| --- | --- |
| text, textarea | hidden ref appended to the string |
| richText (Lexical) | every text node; the ref points at the field (`body`), not the node |
| upload, relationship (populated) | the related document is tagged (`sourceOf(doc.image)`). Its own fields are encoded with its own ref if its collection is in scope |
| number, date, select, radio, checkbox, point, excluded/skipped text | tagged on the parent (`fieldSourceOf(doc, 'year')`) |
| arrays, blocks, groups, named tabs | walked; paths include indices (`team.1.links.0.label`) |
| ids, `blockType`, virtual fields | untouched |

With `locale: 'all'`, each locale's value gets a ref with its own locale.

Source tags use symbol keys. They are invisible to JSON and REST, and lost on serialization, so
read them on the server; see the overlay README.

## Admin: focusing fields

- **Deep link:** `/admin/collections/pages/1?field=team.1.links.0.label&locale=en`. The overlay
  builds these links. `locale` is Payload's own locale switch.
- **Live Preview:** the overlay inside the preview iframe asks the admin (`pve:ready`). If the admin
  answers, a click sends `pve:focus` and the admin focuses the field in the same tab. A field of
  another document or locale navigates there. Without an answer within 500 ms, the overlay opens
  the link in a new tab. Messages are accepted only from the view's own preview iframe or popup.
- Focus waits until Payload has loaded the form. It opens tabs by clicking the tab button and
  expands collapsed array/block rows through Payload's form state, the same way an editor would.
  It keeps the field centred while lazy content above it still loads, and stops at the first
  scroll, click or key press.

All access to Payload's admin markup sits in one module (`src/client/dom-adapter.ts`).
`test/payload-markup.test.ts` fails when an installed Payload version no longer renders what it
relies on. When markup does change, focusing stops working silently; it never throws.

## Known issues

- **Long forms: fields far down are reached by scrolling (workaround).** Payload renders each list
  of fields only once it comes within 1000 px of the viewport, and has no API to force it. When the
  target field doesn't exist yet, the admin first scrolls the nearest rendered parent field into
  view. If that isn't enough, it scrolls down one screen at a time until the field appears (each
  step waits for the DOM to change; it gives up after 3 s or at the end of the page). On very
  long forms this shows as a short jump before the smooth scroll to the field. It relies on
  Payload's current rendering behaviour; if Payload adds an API to render a field on demand,
  replace it. See [ADR 0001](../../docs/adr/0001-payload-visual-editing.md), section 12.
- **Tabs inside array/block rows** can't be located (rows have React-generated ids). The field is
  focused only if its tab is already open.
- **Collapsibles that start collapsed** (`admin.initCollapsed`) aren't opened. Payload reads their
  state once, on mount.
- **Uploads** have no input; the field's edit button gets the focus.

## Cloudflare Workers

The server entry uses no Node-only APIs (fs, path, child_process). The test suite runs on Payload's
D1 adapter with an in-memory Miniflare D1.
