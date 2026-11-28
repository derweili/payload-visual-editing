# stegaClean pitfalls

In Draft Mode, every encoded string from Payload carries invisible characters after its visible
text. `page.title` renders as "Home", but it isn't equal to `'Home'`:

```ts
// In Draft Mode
page.title === 'Home' // false: invisible characters follow "Home"
stegaClean(page.title) === 'Home' // true
```

Use `stegaClean(value)` wherever a string is used for more than display. It works on strings,
arrays and plain objects (it returns a cleaned copy), and is harmless on values without encoding,
so the same code works outside Draft Mode.

```ts
import { stegaClean } from '@derweili/payload-visual-editing-overlay/vanilla'
```

::: tip Fix it at the source first
Text fields that only feed logic belong in the plugin's
[`exclude`](/reference/plugin#options), so they arrive clean. `slug` and `url` are excluded by
default. Excluded fields still get a source tag, so they stay clickable through `fieldAttrs`.
:::

## Where to clean

- **Comparisons and lookups:** `===`, `switch`, `includes`, map keys, sorting, `localeCompare`.
- **URLs and identifiers:** slugs, `href`, `id` / `className`, `key`. Better: exclude these fields
  in the plugin.
- **Metadata:** `<title>`, `generateMetadata`, Open Graph, JSON-LD. Hidden characters there end up
  in search results and shares.
- **Form values:** `<option value>`, hidden inputs, anything submitted back.
- **Parsing and measuring:** `JSON.parse`, `Number()`, `new Date()`, `length`, truncation.
- **`split` and `trim`:** see below.

```ts {5-6}
// ✅ metadata
export async function generateMetadata() {
  const page = await getPage()
  return {
    title: stegaClean(page.meta.title),
    description: stegaClean(page.meta.description),
  }
}
```

## `split` and `trim`

The hidden ref sits at the end of the string, so after `split('\n')` only the last part keeps it,
and `trim()` can damage it (U+FEFF counts as whitespace). Use `stegaSplitParts`: it splits the
visible text and gives every part the ref.

```ts
import { stegaSplitParts } from '@derweili/payload-visual-editing-overlay/vanilla'

const paragraphs = stegaSplitParts(text, /\n{2,}/, (part) => part.trim())
```

## Writes are safe

The plugin strips encoded characters before validation, so text copied from the preview back into
the admin is saved clean.
