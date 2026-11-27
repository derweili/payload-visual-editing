# Getting started

This guide adds visual editing to an existing Payload 3 + Next.js (App Router) project. At the end,
editors can hover content in a Draft Mode preview, click "Edit", and land on the field in the admin.

::: tip Prefer to let your coding agent do it?
Install the agent skills and ask your agent to set it up:

```sh
npx skills add derweili/payload-visual-editing
```

Or paste a ready-made prompt into Claude Code, Cursor, Codex and others: see
[AI-assisted setup](/ai/setup).
:::

::: warning Pre-release
The packages are at 0.x and not yet published to npm. Until then, minor versions may contain
breaking changes.
:::

## Prerequisites

- Payload 3.94+ with the Next.js admin (`@payloadcms/next`)
- Next.js 15.4+ or 16, React 19
- At least one collection or global with drafts (`versions: { drafts: true }`) that your site renders
- For clicks inside the Live Preview: Payload's own [Live Preview](https://payloadcms.com/docs/live-preview/overview),
  configured and working

::: info Builds on Payload's preview
Visual editing doesn't replace Payload's preview, it adds click-to-edit on top of it. For the
Live Preview, first set up Payload's
[Live Preview](https://payloadcms.com/docs/live-preview/overview): `admin.livePreview.url` on
your collections and globals, and a frontend that re-renders drafts, for example with
[server-side Live Preview](https://payloadcms.com/docs/live-preview/server). For a preview in its
own tab, a Draft Mode route is enough (step 3); Payload's
[Preview button](https://payloadcms.com/docs/admin/preview) can link to it.
:::

## 1. Install the packages

::: code-group

```sh [pnpm]
pnpm add @derweili/payload-visual-editing @derweili/payload-visual-editing-overlay
```

```sh [npm]
npm install @derweili/payload-visual-editing @derweili/payload-visual-editing-overlay
```

```sh [yarn]
yarn add @derweili/payload-visual-editing @derweili/payload-visual-editing-overlay
```

:::

## 2. Add the plugin to your Payload config

List the collections and globals that should be clickable:

```ts {7-10} [payload.config.ts]
import { buildConfig } from 'payload'
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

Then regenerate the import map, so the admin can load the plugin's component:

```sh
pnpm payload generate:importmap
```

::: info
Without the import map step, the deep links open the document but don't focus the field.
:::

All options are listed in the [plugin reference](/reference/plugin#options).

## 3. Enable Draft Mode

Visual editing is only active in [Next.js Draft Mode](https://nextjs.org/docs/app/guides/draft-mode).
If your site already has a preview route, skip this step.

```ts [app/(frontend)/next/preview/route.ts]
import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { getPayload } from 'payload'

/** Turns on Draft Mode for a logged-in admin user, then shows `?path=`. */
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') ?? '/'
  if (!path.startsWith('/') || path.startsWith('//')) {
    return new Response('Invalid path', { status: 400 })
  }
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Log in to the admin to preview drafts', { status: 403 })
  ;(await draftMode()).enable()
  redirect(path)
}
```

```ts [app/(frontend)/next/exit-preview/route.ts]
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

export async function GET() {
  ;(await draftMode()).disable()
  redirect('/')
}
```

## 4. Read drafts with source maps

Wherever the site fetches content, ask for source maps **only in Draft Mode**:

```ts {9}
import { draftMode } from 'next/headers'

const { isEnabled: draft } = await draftMode()

const page = await payload.findByID({
  collection: 'pages',
  id,
  draft,
  context: draft ? { encodeSourceMaps: true } : {},
})
```

Using REST instead of the Local API? Add `?draft=true&encodeSourceMaps=true` to a GET request made
by a logged-in user. See [Reading with source maps](/reference/plugin#reading-with-source-maps).

::: danger Never cache encoded reads
A cache entry with hidden characters could later be served on the live site. Skip
`unstable_cache` / `"use cache"` in Draft Mode, or put the draft state in the cache key.
More in [Caching and production safety](./caching).
:::

## 5. Mount the overlay

Render `<VisualEditing />` in Draft Mode, for example in the frontend's root layout:

```tsx {10} [app/(frontend)/layout.tsx]
import { draftMode } from 'next/headers'
import { VisualEditing } from '@derweili/payload-visual-editing-overlay/react'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { isEnabled: draft } = await draftMode()
  return (
    <html lang="en">
      <body>
        {children}
        {draft && <VisualEditing label="Edit" />}
      </body>
    </html>
  )
}
```

Render text as usual: the encoded characters are invisible and the overlay finds them.

If the admin runs on a different origin or route, pass `serverURL` / `adminRoute`. See the
[overlay options](/reference/overlay#options).

## 6. Clean strings that feed logic

Encoded strings look normal but aren't equal to their visible text. Wrap every string that is used
for more than display (comparisons, URLs, `<title>`, metadata, form values) in `stegaClean`:

```ts {5}
import { stegaClean } from '@derweili/payload-visual-editing-overlay/vanilla'

export async function generateMetadata() {
  const page = await getPage()
  return { title: stegaClean(page.title) }
}
```

Fields like `slug` and `url` are excluded from encoding by default. Read
[stegaClean pitfalls](./stega-clean) before going further. It is the most common source of bugs.

## 7. Try it

1. Log in to the admin.
2. Open `/next/preview?path=/` (or your own preview route).
3. Hover a heading: an outline and an "Edit" button appear.
4. Click "Edit": the admin opens the document with the field focused.

Holding <kbd>Alt</kbd> while clicking editable content opens it without the button.

## Next steps

- [Images, numbers and other values](./source-tags): make non-text content clickable with
  `fieldAttrs`.
- [Live Preview](./live-preview): focus fields next to the page, without leaving the admin.
- [Agent skills](/ai/skills): teach your coding agent the rules of this package.
