# Images, numbers and other values

Text needs nothing from the frontend: the source travels inside the string as invisible
characters. Images, numbers, selects, dates, relationships and URL-like text can't carry those
characters. For them the plugin attaches a **source tag** when it encodes a document, and the
frontend renders it as `data-` attributes with `fieldAttrs()`.

## 1. Fetch with encoding on (Draft Mode only)

```ts
const doc = await payload.findByID({
  collection: 'pages',
  id,
  depth: 1,
  draft: true,
  context: { encodeSourceMaps: true },
})
```

## 2. Render the attributes

In a **server component** that receives the Payload document:

```tsx
import { fieldAttrs, fieldSourceOf, sourceOf } from '@derweili/payload-visual-editing-overlay/vanilla'

<img {...fieldAttrs(sourceOf(doc.image))} src={doc.image.url} alt={doc.image.alt} />
<span {...fieldAttrs(fieldSourceOf(doc, 'year'))}>{doc.year}</span>
```

- `sourceOf(value)`: populated uploads and relationships. They are objects, so the tag sits on the
  value itself (each item of a `hasMany` field is tagged).
- `fieldSourceOf(parent, 'name')`: numbers, selects, dates, … Primitives can't hold a tag, so it
  sits on the object that contains them.
- `fieldAttrs(null)` returns `{}`: outside Draft Mode the same code renders nothing extra.

::: tip Import from `/vanilla` in server components
`/react` is a `'use client'` module, so its functions aren't callable in server components. Import
`fieldAttrs`, `sourceOf`, `fieldSourceOf` and `stegaClean` from
`@derweili/payload-visual-editing-overlay/vanilla` there.
:::

## 3. Client components: pass the source as a prop

Tags are stored under symbol keys and don't survive React's serialization to client components.
Read them on the server, in your mapping code, and pass the plain `SourceLocation`
(`{ collection | global, id?, path, locale? }`) on:

```ts
// server: mapping code
const toImage = (media: Media) => ({ url: media.url, alt: media.alt, source: sourceOf(media) })
```

```tsx
// any component, client or server
<img {...fieldAttrs(image.source)} src={image.url} alt={image.alt} />
```

Doing it once in a shared mapper and image component covers every image of a site.

## 4. Mount the overlay

`<VisualEditing />` (from `/react`) in Draft Mode, as for text. See
[Getting started](./getting-started#_5-mount-the-overlay).

## Where tags survive, and where not

| Survives | Lost |
| --- | --- |
| object spread (`{ ...doc }`), `Object.assign` | `JSON.stringify`, `structuredClone` |
| passing objects around on the server | props sent to client components |
| | caches that serialize (e.g. `unstable_cache`): don't cache Draft Mode reads |
| | copying fields one by one (`{ url: media.url }`): read `sourceOf(media)` there |

## What gets encoded, per field type

| Field | In the data |
| --- | --- |
| text, textarea | hidden ref appended to the string |
| richText (Lexical) | every text node; the ref points at the field (`body`), not the node |
| upload, relationship (populated) | the related document is tagged (`sourceOf(doc.image)`). Its own fields are encoded with its own ref if its collection is in scope |
| number, date, select, radio, checkbox, point, excluded/skipped text | tagged on the parent (`fieldSourceOf(doc, 'year')`) |
| arrays, blocks, groups, named tabs | walked; paths include indices (`team.1.links.0.label`) |
| ids, `blockType`, virtual fields | untouched |

With `locale: 'all'`, each locale's value gets a ref with its own locale.
