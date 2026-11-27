# What is Payload Visual Editing?

Payload Visual Editing lets editors click content in a Next.js preview and land on the exact field
in the Payload admin, including fields inside tabs, groups, arrays and blocks. It works both in a
preview in its own tab and inside Payload's Live Preview.

Text carries an invisible source map ("stega"). Images, numbers and other values that can't hold
hidden characters carry `data-` attributes instead.

## Packages

| Package | What it does |
| --- | --- |
| `@derweili/payload-visual-editing` | Payload plugin: encodes source maps into draft reads (`/server`), and adds an admin component that focuses a field from a link or a Live Preview click (`/client`) |
| `@derweili/payload-visual-editing-overlay` | Frontend: the hover outline and edit button (`/vanilla`, `/react`), `stegaClean`, `fieldAttrs` |
| `@derweili/payload-visual-editing-core` | Shared protocol, stega, path and source helpers; used by the two above. Sites rarely need it directly |

## How it fits together

1. The site reads drafts with `context: { encodeSourceMaps: true }`. The plugin appends an invisible
   ref (collection or global, id, field path, locale) to every text value. Values that can't hold
   hidden text get a source tag instead.
2. The overlay finds the refs in the rendered page and shows an "Edit" button on hover.
3. Standalone, the button opens `/admin/collections/<slug>/<id>?field=<path>`. In the Live
   Preview, it sends a `postMessage` to the admin. Either way, the admin component opens the tab,
   expands the row, scrolls to the field and focuses it.

```
 Next.js page (Draft Mode)               Payload admin
 ┌──────────────────────────┐            ┌──────────────────────────┐
 │ "Our team…"    [Edit] ───┼── link ───▶│ /admin/collections/pages │
 │  ▲ invisible ref         │  or        │   ?field=team.1.name     │
 │  │                       │ postMessage│ → open tab, expand row,  │
 │ payload.find(…, context: │            │   scroll, focus field    │
 │   { encodeSourceMaps })  │            └──────────────────────────┘
 └──────────────────────────┘
```

## Requirements

- Payload 3.94+
- Next.js 15.4+ or 16
- React 19

Package code uses no Node-only APIs, so it runs on Cloudflare Workers.

## Scope

**Supported:** `text`, `textarea` and Lexical `richText` in collections and globals; paths through
arrays, groups, named and unnamed tabs, collapsibles, rows, blocks and localized fields; source
tags for images, numbers, relationships, selects and dates.

**Not supported (for now):** inline editing on the page, drag & drop or adding blocks from the
preview, highlighting in the preview when a field is focused in the admin, and tested support for
frontends other than Next.js (the vanilla overlay is framework-agnostic).

Next: [Getting started](./getting-started).
