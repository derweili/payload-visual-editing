# Plugin: `@derweili/payload-visual-editing`

The Payload 3 plugin.

| Entry | Contents |
| --- | --- |
| `/server` | `visualEditingPlugin`, `DEFAULT_EXCLUDE`, `ENCODE_CONTEXT_KEY`, `ENCODE_QUERY_PARAM`, `encodeDocument`, `createPathMatcher`, `stegaClean` |
| `/client` | The admin component that focuses a field from a `?field=` link or a Live Preview click. Added to edit views by the plugin; you don't import it yourself |

## Setup

```ts [payload.config.ts]
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

### Path patterns

Patterns match the data path without array indices (`team.links.label`).

- `*` is one segment, `**` any number of segments.
- A pattern without a dot matches a field name at any depth (`'url'` matches `links.url`).
- Setting `exclude` replaces the defaults, so add `...DEFAULT_EXCLUDE` if you still want them.
- Fields named `id` are never encoded.

```ts
import { DEFAULT_EXCLUDE, visualEditingPlugin } from '@derweili/payload-visual-editing/server'

visualEditingPlugin({
  collections: ['pages'],
  sourceMaps: {
    exclude: [...DEFAULT_EXCLUDE, 'anchor', 'theme', 'variant'],
  },
})
```

Exclude every text field that feeds logic rather than display: slugs, URLs, link targets, CSS
values, enum-like text, anything compared or parsed. Excluded and skipped fields still get a source
tag, so they stay clickable through `fieldAttrs`.

## Reading with source maps

Encoding is off unless a request asks for it, and only draft/preview reads should ask.

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

::: danger
Never cache encoded reads. See [Caching and production safety](/guide/caching).
:::

Writes are safe: the plugin strips encoded characters before validation.

## What gets encoded

See the [table per field type](/guide/source-tags#what-gets-encoded-per-field-type).

## Admin: focusing fields

- **Deep link:** `/admin/collections/pages/1?field=team.1.links.0.label&locale=en`.
- **Live Preview:** `pve:ready` handshake, then `pve:focus` messages. See
  [Live Preview](/guide/live-preview).

## Cloudflare Workers

The server entry uses no Node-only APIs (`fs`, `path`, `child_process`). The test suite runs on
Payload's D1 adapter with an in-memory Miniflare D1.
