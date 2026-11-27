---
name: payload-visual-editing
description: Rules for working in a codebase that uses Payload visual editing (@derweili/payload-visual-editing, @derweili/payload-visual-editing-overlay). Use when writing or changing frontend code that renders Payload content in Draft Mode, when adding collections, fields or blocks, when strings from Payload are compared, parsed or used in URLs/metadata, when making images or numbers clickable, or when debugging invisible characters, stegaClean, fieldAttrs, sourceOf or the edit overlay.
---

# Working with Payload visual editing

In Draft Mode, the Payload plugin appends **invisible characters** (stega) to every text value it
encodes, and attaches **source tags** (symbol keys) to values that can't hold hidden text. The
overlay (`<VisualEditing />`) reads both and links each element to its field in the admin.

Everything below follows from that: strings in Draft Mode are not what they look like.

## Rule 1: clean strings that feed logic

An encoded string looks like `"Home"` but is `"Home​…"`. Wrap a value in `stegaClean` when it
is used for anything but display:

```ts
import { stegaClean } from '@derweili/payload-visual-editing-overlay/vanilla'
```

- comparisons, `switch`, `includes`, map/object keys, sorting, `localeCompare`
- `href`, slugs, `id`, `className`, React `key`
- `generateMetadata`, `<title>`, Open Graph, JSON-LD, `alt` used for SEO
- form values (`<option value>`, hidden inputs)
- `Number()`, `new Date()`, `JSON.parse`, `.length`, truncation
- `split` and `trim`: use `stegaSplitParts(text, separator, map?)` instead; it keeps the ref on
  every part

**Prefer fixing it at the source:** a text field that only feeds logic belongs in the plugin's
`sourceMaps.exclude` (keep `...DEFAULT_EXCLUDE`; `slug` and `url` are excluded by default).
Select, radio, number, date and checkbox fields are never encoded, so they need no cleaning.

Don't strip encoding from text that is only displayed. That removes the click target.

## Rule 2: encode only in Draft Mode, never cache it

```ts
const { isEnabled: draft } = await draftMode()
const data = await payload.find({
  collection: 'posts',
  draft,
  context: draft ? { encodeSourceMaps: true } : {},
})
```

- Never pass `encodeSourceMaps` outside Draft Mode, in `generateStaticParams`, ISR or build code.
- Never let an encoded read enter `unstable_cache`, `"use cache"`, a cached `fetch` or a platform
  cache. Bypass the cache in Draft Mode or key it on the draft flag.
- Every new data-fetching function for an in-scope collection follows this pattern.

## Rule 3: non-text values need `fieldAttrs`

Images, numbers, selects, dates and relationships are clickable only if the element gets
`data-pve-*` attributes:

```tsx
import { fieldAttrs, fieldSourceOf, sourceOf } from '@derweili/payload-visual-editing-overlay/vanilla'

<img {...fieldAttrs(sourceOf(doc.image))} src={doc.image.url} alt={doc.image.alt} />
<span {...fieldAttrs(fieldSourceOf(doc, 'year'))}>{doc.year}</span>
```

- `sourceOf(value)` for populated uploads/relationships (objects); `fieldSourceOf(parent, 'name')`
  for primitives.
- `fieldAttrs(null)` returns `{}`, so the code needs no Draft Mode check.
- Source tags use symbol keys: **lost** on `JSON.stringify`, `structuredClone`, serializing caches,
  props passed to client components, and copying fields one by one. **Kept** on object spread and
  `Object.assign`.
- For client components, read `sourceOf(...)` in server-side mapping code and pass the plain
  `SourceLocation` as a prop: `{ url, alt, source: sourceOf(media) }` → `fieldAttrs(image.source)`.

## Rule 4: imports

| Where | Import from |
| --- | --- |
| Payload config | `@derweili/payload-visual-editing/server` |
| Server components, utilities | `@derweili/payload-visual-editing-overlay/vanilla` (`stegaClean`, `fieldAttrs`, `sourceOf`, `fieldSourceOf`, `stegaSplitParts`) |
| The `<VisualEditing />` mount | `@derweili/payload-visual-editing-overlay/react` (a `'use client'` module: don't call its helper functions from server components) |

Package code must stay free of Node-only APIs (it runs on Cloudflare Workers).

## When adding collections, globals or fields

- A new collection/global the site renders: add its slug to the plugin's `collections`/`globals`,
  run `payload generate:importmap`, and follow Rule 2 in its data fetching.
- A new text field that feeds logic: add it to `sourceMaps.exclude`.
- A new image/number/select rendered on the page: add `fieldAttrs` (Rule 3).

## Debugging

See [references/troubleshooting.md](references/troubleshooting.md) for symptoms and causes, and
[references/api.md](references/api.md) for options and the full API.

Docs: https://github.com/derweili/payload-visual-editing/tree/main/docs
