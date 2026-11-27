# Overlay: `@derweili/payload-visual-editing-overlay`

The frontend part. Everything in a page that comes from Payload gets a hover outline and an "Edit"
button. The button opens the field in the admin, or focuses it next to the page in the Live
Preview.

| Entry | For |
| --- | --- |
| `/react` | `<VisualEditing />` (a client component), plus `fieldAttrs` and `stegaClean` |
| `/vanilla` | Framework-agnostic: `createOverlay()`, `fieldAttrs`, `stegaClean`, `stegaSplitParts`, `sourceOf`, `fieldSourceOf`. Safe in server components (no `'use client'`) |

## `<VisualEditing />`

```tsx
import { VisualEditing } from '@derweili/payload-visual-editing-overlay/react'

{draft && <VisualEditing label="Edit" />}
```

## `createOverlay()`

For frameworks other than React:

```ts
import { createOverlay } from '@derweili/payload-visual-editing-overlay/vanilla'

const overlay = createOverlay({ label: 'Edit', adminRoute: '/admin' })
// overlay.rescan(), overlay.edit(ref), overlay.destroy()
```

A MutationObserver rescans on its own when the page changes.

## Options

Shared by `<VisualEditing />` and `createOverlay()`:

| Option | Default | |
| --- | --- | --- |
| `label` | `"Edit"` | Text of the button |
| `color` | a blue | Outline and button colour |
| `adminRoute` | `"/admin"` | Payload's `routes.admin` |
| `serverURL` | the page's origin | Origin of the admin, when it runs on another domain |
| `openIn` | `"new-tab"` | Outside the Live Preview: `"same-tab"` navigates instead |
| `handshakeTimeout` | `500` | In the Live Preview: ms to wait for the admin before opening a new tab |
| `root` (vanilla only) | `document.body` | Where to look for editable content |

Holding <kbd>Alt</kbd> while clicking editable content also opens it, without the button.

## Helpers

| Function | |
| --- | --- |
| `stegaClean(value)` | Removes the encoding from a string, array or object. See [stegaClean pitfalls](/guide/stega-clean) |
| `stegaSplitParts(text, separator, map?)` | Splits the visible text and gives every part the ref |
| `sourceOf(value)` | Source of a populated upload or relationship |
| `fieldSourceOf(parent, name)` | Source of a primitive field (number, select, date, …) |
| `fieldAttrs(source)` | `data-pve-*` attributes for an element; `{}` for `null` |

`fieldAttrs` renders `data-pve-doc`, `data-pve-path` and `data-pve-locale`. See
[Images, numbers and other values](/guide/source-tags).
