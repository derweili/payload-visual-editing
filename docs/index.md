---
layout: home
markdownStyles: false
title: Visual editing for Payload
titleTemplate: No more hunting for fields in the CMS

hero:
  name: Visual editing for Payload
  text: No more hunting for fields in the CMS.
  tagline: Which tab was it? Which block, which row? Your editors stop guessing. They click any text, image or number on the page, and Payload opens the exact field. For Payload 3 and Next.js.
  image:
    src: /logo.svg
    alt: Visual editing for Payload
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: Set up with AI
      link: /ai/setup
    - theme: alt
      text: GitHub
      link: https://github.com/derweili/payload-visual-editing

# Demo video below the hero (rendered by .vitepress/theme/components/HomeVideo.vue).
# Set `src` to a hosted .mp4/.webm, or `embed` to an iframe URL (YouTube, Vimeo, …).
# Without either, a placeholder frame is shown.
video:
  src: https://static-video.derweili.de/payload-visual-editing.mp4
  poster:
  title: 'Visual editing for Payload: demo'

features:
  - icon: { src: /icons/pointer.svg }
    title: Click to edit
    details: Hover any content in the preview, click "Edit", and the admin opens the document with the field focused. Tabs open and rows expand on the way.
  - icon: { src: /icons/split.svg }
    title: Works in the Live Preview
    details: Inside Payload's Live Preview the click focuses the field right next to the page, in the same tab, through a versioned postMessage handshake.
  - icon: { src: /icons/image.svg }
    title: Text, images, numbers
    details: Text carries an invisible source map. Images, numbers, selects, dates and relationships carry data attributes via fieldAttrs().
  - icon: { src: /icons/lock.svg }
    title: Draft Mode only
    details: Encoding is opt-in per request and only for logged-in drafts. Published pages stay byte-for-byte clean.
  - icon: { src: /icons/cloud.svg }
    title: Runs on Cloudflare Workers
    details: No Node-only APIs in package code. Deploy wherever your Payload and Next.js app already runs.
  - icon: { src: /icons/spark.svg }
    title: Agent-ready
    details: Ships agent skills, so Claude Code, Cursor or Codex can set it up and keep following the rules afterwards.
---

<HomeSteps />

<HomeUnderTheHood />

<div class="pve-section">
<div class="vp-doc pve-md pve-setup">
<div>

<p class="pve-eyebrow">For developers: get started</p>

## Set up in <span class="grad">minutes</span> {#setup}

<p class="pve-lead">Install two packages, add the plugin, mount the overlay in Draft Mode. The <a href="./guide/getting-started">getting started guide</a> walks through every step, including the preview route and <code>stegaClean</code>.</p>

### Or let your agent do it

```sh
npx skills add derweili/payload-visual-editing
```

Then ask: *"Set up Payload visual editing in this project."* More in [AI-assisted setup](./ai/setup).

</div>
<div>

::: code-group

```sh [1. Install]
pnpm add @derweili/payload-visual-editing \
         @derweili/payload-visual-editing-overlay
```

```ts [2. payload.config.ts]
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

```ts [3. Read drafts]
const { isEnabled: draft } = await draftMode()

const page = await payload.findByID({
  collection: 'pages',
  id,
  draft,
  context: draft ? { encodeSourceMaps: true } : {},
})
```

```tsx [4. layout.tsx]
import { draftMode } from 'next/headers'
import { VisualEditing } from '@derweili/payload-visual-editing-overlay/react'

export default async function Layout({ children }) {
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

:::

</div>
</div>
</div>

<HomeScope />

<HomeCta />
