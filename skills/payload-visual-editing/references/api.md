# API reference

## Plugin options (`@derweili/payload-visual-editing/server`)

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
    skip?: 'auto' | boolean    // default 'auto': leaves URL- and date-like strings unencoded
    include?: string[]         // only encode these paths (default: all)
    exclude?: string[]         // never encode these paths (default: ['slug', 'url'])
  },
})
```

Path patterns match the data path without array indices (`team.links.label`). `*` is one segment,
`**` any number. A pattern without a dot matches a field name at any depth. Setting `exclude`
replaces the defaults: use `[...DEFAULT_EXCLUDE, …]`. Fields named `id` are never encoded.

Also exported: `DEFAULT_EXCLUDE`, `ENCODE_CONTEXT_KEY` (`'encodeSourceMaps'`),
`ENCODE_QUERY_PARAM`, `encodeDocument`, `createPathMatcher`, `stegaClean`.

## What gets encoded

| Field | In the data |
| --- | --- |
| text, textarea | hidden ref appended to the string |
| richText (Lexical) | every text node; the ref points at the field, not the node |
| upload, relationship (populated) | related document tagged: `sourceOf(doc.image)` |
| number, date, select, radio, checkbox, point, excluded/skipped text | tagged on the parent: `fieldSourceOf(doc, 'year')` |
| arrays, blocks, groups, named tabs | walked; paths include indices (`team.1.links.0.label`) |
| ids, `blockType`, virtual fields | untouched |

## Overlay (`@derweili/payload-visual-editing-overlay`)

`/react`: `<VisualEditing />`, `fieldAttrs`, `stegaClean`.
`/vanilla`: `createOverlay()` → `{ rescan(), edit(ref), destroy() }`, `fieldAttrs`, `readFieldAttrs`,
`stegaClean`, `stegaSplitParts`, `sourceOf`, `fieldSourceOf`, `SourceLocation`.

| Option | Default | |
| --- | --- | --- |
| `label` | `"Edit"` | Button text |
| `color` | `"#168b49"` (green) | Outline and button background |
| `textColor` | `"#fff"` | Button text |
| `adminRoute` | `"/admin"` | Payload's `routes.admin` |
| `serverURL` | page origin | Admin origin when on another domain |
| `openIn` | `"new-tab"` | `"same-tab"` navigates instead (outside Live Preview) |
| `handshakeTimeout` | `500` | ms to wait for the admin in Live Preview |
| `root` (vanilla) | `document.body` | Where to scan |

Alt+click on editable content opens it without the button.

## Deep links

`/admin/collections/<slug>/<id>?field=<path>&locale=<code>` and
`/admin/globals/<slug>?field=<path>`. Build them with `buildAdminUrl(ref, { adminRoute, serverURL })`
from `@derweili/payload-visual-editing-core`.

## SourceLocation

`{ collection, id, path, locale? }` or `{ global, path, locale? }`.
