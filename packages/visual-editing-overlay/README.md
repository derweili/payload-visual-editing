# @derweili/payload-visual-editing-overlay

The frontend part of Payload visual editing. Everything in a page that comes from Payload gets a
hover outline and an "Edit" button. The button opens the field in the admin, or focuses it next to
the page in the Live Preview.

Needs [`@derweili/payload-visual-editing`](../payload-visual-editing) in the Payload config.
Overview: [README](../../README.md).

| Entry | For |
| --- | --- |
| `/react` | `<VisualEditing />` (a client component), plus `fieldAttrs` and `stegaClean` |
| `/vanilla` | Framework-agnostic: `createOverlay()`, `fieldAttrs`, `stegaClean`, `stegaSplitParts`, `sourceOf`, `fieldSourceOf`. Safe in server components (no `'use client'`) |

## Setup (Next.js)

1. Read drafts with source maps (see the plugin README), only in Draft Mode:

   ```ts
   const { isEnabled: draft } = await draftMode()
   const page = await payload.findByID({
     collection: 'pages',
     id,
     draft,
     context: draft ? { encodeSourceMaps: true } : {},
   })
   ```

2. Mount the overlay in Draft Mode, e.g. in the root layout:

   ```tsx
   import { VisualEditing } from '@derweili/payload-visual-editing-overlay/react'

   {draft && <VisualEditing label="Edit" />}
   ```

3. Render text as usual. The encoded characters are invisible and the overlay finds them. Clean
   every string that feeds logic rather than display (see "stegaClean pitfalls" below).

The admin's Live Preview needs nothing extra: inside its iframe the overlay talks to the admin
through `postMessage`.

### `<VisualEditing />` / `createOverlay()` options

| Option | Default | |
| --- | --- | --- |
| `label` | `"Edit"` | Text of the button |
| `color` | a blue | Outline and button colour |
| `adminRoute` | `"/admin"` | Payload's `routes.admin` |
| `serverURL` | the page's origin | Origin of the admin, when it runs on another domain |
| `openIn` | `"new-tab"` | Outside the Live Preview: `"same-tab"` navigates instead |
| `handshakeTimeout` | `500` | In the Live Preview: ms to wait for the admin before opening a new tab |
| `root` (vanilla only) | `document.body` | Where to look for editable content |

`createOverlay()` returns `{ rescan(), edit(ref), destroy() }`. A MutationObserver rescans on its
own when the page changes.

Holding Alt while clicking editable content also opens it, without the button.

## stegaClean pitfalls

Encoded strings look normal but aren't equal to their visible text: `"Home" !== "Home\u200b…"`. Use
`stegaClean(value)` (works on strings, arrays and objects) wherever a string is used for more than
display:

- **Comparisons and lookups:** `===`, `switch`, `includes`, map keys, sorting, `localeCompare`.
- **URLs and identifiers:** slugs, `href`, `id`/`className`, `key`. Better: exclude these fields in
  the plugin (`slug` and `url` are excluded by default).
- **Metadata:** `<title>`, `generateMetadata`, Open Graph, JSON-LD. Hidden characters there end up
  in search results and shares.
- **Form values:** `<option value>`, hidden inputs, anything submitted back.
- **Parsing and measuring:** `JSON.parse`, `Number()`, `new Date()`, `length`, truncation.
- **`split` and `trim`:** the hidden ref sits at the end of the string, so after `split('\n')` only
  the last part keeps it, and `trim()` can damage it (U+FEFF counts as whitespace). Use
  `stegaSplitParts(text, /\n{2,}/, (part) => part.trim())`: it splits the visible text and gives
  every part the ref.

Text fields that only feed logic belong in the plugin's `exclude`, so they arrive clean.

## Images, numbers and other values without text

Text needs nothing from the frontend: the source travels inside the string as invisible characters.
Images, numbers, selects, dates, relationships and URL-like text can't carry those characters. For
them the plugin attaches a **source tag** when it encodes a document, and the frontend renders it as
`data-` attributes with `fieldAttrs()`.

### 1. Fetch with encoding on (Draft Mode only)

```ts
const doc = await payload.findByID({
  collection: 'pages',
  id,
  depth: 1,
  draft: true,
  context: { encodeSourceMaps: true },
})
```

### 2. Render the attributes

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

### 3. Client components: pass the source as a prop

Tags are stored under symbol keys and don't survive React's serialization to client components. Read
them on the server, in your mapping code, and pass the plain `SourceLocation`
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

### 4. Mount the overlay

`<VisualEditing />` (from `/react`) in Draft Mode, as for text.

### Where tags survive, and where not

| Survives | Lost |
| --- | --- |
| object spread (`{ ...doc }`), `Object.assign` | `JSON.stringify`, `structuredClone` |
| passing objects around on the server | props sent to client components |
| | caches that serialize (e.g. `unstable_cache`): don't cache Draft Mode reads |
| | copying fields one by one (`{ url: media.url }`): read `sourceOf(media)` there |
