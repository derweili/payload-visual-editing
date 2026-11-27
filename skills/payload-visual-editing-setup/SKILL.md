---
name: payload-visual-editing-setup
description: Set up Payload visual editing (@derweili/payload-visual-editing) in a Payload 3 + Next.js project, so editors can click content in the Draft Mode preview or Live Preview and land on the field in the admin. Use when asked to add, install or configure visual editing, click-to-edit, stega source maps or the edit overlay for Payload CMS.
---

# Set up Payload visual editing

Adds click-to-edit to a Payload 3 + Next.js (App Router) site. Work through the steps in order,
check each one against the project, and don't skip the verification at the end. For the rules that
apply after setup (stegaClean, source tags, caching), load the `payload-visual-editing` skill.

## 0. Check the project first

Read these before changing anything:

- `package.json`: needs `payload` >= 3.94, `next` 15.4+ or 16, `react` 19. The package manager
  follows the lockfile (`pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`, `bun.lock`).
- The Payload config (usually `src/payload.config.ts`): which collections and globals the site
  renders, which have `versions: { drafts: true }`, `routes.admin` if not `/admin`, and existing
  `admin.livePreview` settings.
- The frontend: where content is fetched (Local API `payload.find*` or REST), whether a Draft Mode
  route already exists (`draftMode().enable()`), and which data reads are cached
  (`unstable_cache`, `"use cache"`, `fetch` cache).

If the project is not Payload 3 + Next.js App Router, stop and tell the user: only that
combination is tested.

## 1. Install

```sh
pnpm add @derweili/payload-visual-editing @derweili/payload-visual-editing-overlay
```

(Use the project's package manager.)

## 2. Add the plugin

```ts
import { visualEditingPlugin } from '@derweili/payload-visual-editing/server'

plugins: [
  visualEditingPlugin({
    collections: ['pages', 'posts'], // the collections the site renders
    globals: ['header', 'footer'],   // the globals the site renders
  }),
],
```

- Only list collections/globals the frontend renders. Don't add `users` or `media` unless media
  documents are rendered with their own editable text fields.
- Look for text fields that feed logic rather than display (anchors, CSS classes, enum-like text,
  link targets, anything compared or parsed) and add them to `sourceMaps.exclude`, keeping the
  defaults: `exclude: [...DEFAULT_EXCLUDE, 'anchor']`. Patterns match the path without array
  indices; a pattern without a dot matches the field name at any depth.

Then regenerate the import map (the admin component won't load without it):

```sh
pnpm payload generate:importmap
```

## 3. Draft Mode route

Skip if one exists. Otherwise add an enable and an exit route. The enable route must check that
the request comes from a logged-in Payload user and must only redirect to relative paths:

```ts
// app/(frontend)/next/preview/route.ts
import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { getPayload } from 'payload'

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') ?? '/'
  if (!path.startsWith('/') || path.startsWith('//')) return new Response('Invalid path', { status: 400 })
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Log in to the admin to preview drafts', { status: 403 })
  ;(await draftMode()).enable()
  redirect(path)
}
```

```ts
// app/(frontend)/next/exit-preview/route.ts
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET() {
  ;(await draftMode()).disable()
  redirect('/')
}
```

For Live Preview, set `admin.livePreview.url` on each draft-enabled collection/global to this route
with the document's path (e.g. `${origin}/next/preview?path=${encodeURIComponent('/' + data.slug)}`).
Keep an existing `livePreview` config if the project has one.

## 4. Encode draft reads

At every place the frontend reads content from the in-scope collections/globals:

```ts
const { isEnabled: draft } = await draftMode()
const page = await payload.findByID({
  collection: 'pages',
  id,
  draft,
  context: draft ? { encodeSourceMaps: true } : {},
})
```

REST: add `encodeSourceMaps=true` (with `draft=true`) to GET requests only in Draft Mode; they must
carry the user's auth cookie.

**Caching:** make sure encoded reads never enter a cache. If a read is wrapped in
`unstable_cache`, `"use cache"` or a cached `fetch`, bypass the cache in Draft Mode (or include the
draft flag in the cache key). Never encode in `generateStaticParams`, ISR or build-time code.

## 5. Mount the overlay

In the frontend root layout (a server component):

```tsx
import { draftMode } from 'next/headers'
import { VisualEditing } from '@derweili/payload-visual-editing-overlay/react'

const { isEnabled: draft } = await draftMode()
// inside <body>, after {children}:
{draft && <VisualEditing />}
```

Pass `adminRoute` if `routes.admin` isn't `/admin`, and `serverURL` if the admin runs on another
origin.

## 6. Clean strings that feed logic

Search the frontend for uses of in-scope text fields that are not plain display, and wrap them in
`stegaClean` (from `@derweili/payload-visual-editing-overlay/vanilla`):

- `generateMetadata`, `<title>`, Open Graph, JSON-LD
- comparisons, `switch`, `includes`, map keys, sorting
- `href`, `id`, `className`, React `key`
- form values, `Number()`, `new Date()`, `JSON.parse`, `.length`, truncation
- `split` / `trim` → use `stegaSplitParts(text, separator, map)` instead

Prefer excluding a field in the plugin over cleaning it in many places.

## 7. Images and other non-text values (optional, recommended)

Make images clickable with `fieldAttrs(sourceOf(doc.image))` in server components. In client
components the tag is lost: read `sourceOf(media)` in server-side mapping code and pass it as a
prop. Details in the `payload-visual-editing` skill.

## 8. Verify

1. Run the type check and the build (`tsc --noEmit`, `next build`).
2. Start the dev server, log in to the admin, open the preview route
   (`/next/preview?path=/`).
3. Hovering a heading shows an outline and an "Edit" button; clicking it opens the admin with the
   field focused.
4. Outside Draft Mode the HTML contains no zero-width characters and no `data-pve-` attributes:
   `curl -s http://localhost:3000/ | grep -cP '[\x{200B}-\x{200F}\x{FEFF}]|data-pve-'` prints `0`.

Report what you changed, which fields you excluded and why, and anything you could not verify.

Docs: https://github.com/derweili/payload-visual-editing/tree/main/docs
