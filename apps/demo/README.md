# Demo: Lumora (Payload visual editing)

A small corporate site for a fictional studio, built to show the visual editing packages in a
realistic setup: **Next.js 16**, **Payload 3**, **Tailwind CSS 4** and **shadcn/ui**, on
**Neon Postgres** and **Vercel** (with Vercel Blob for uploads).

Pages: home, projects (filterable), project detail, services, about, contact. All content,
including header and footer, comes from Payload.

## Try visual editing

1. Log in at `/admin`.
2. Open a page or project and toggle the **Live Preview** (eye icon).
3. Hover anything in the preview and click **Edit** (or Alt+click). The admin switches to the right
   tab, expands the array row and focuses the field. It works for text, rich text, images, numbers
   and selects, in blocks, arrays, groups and tabs.
4. Type: drafts autosave and the preview re-renders.

Outside the admin, the **Preview** button (or `/next/preview?path=/about`) shows drafts in a new
tab; clicking Edit there opens the field in the admin. The published site never contains source
maps.

## How it's built

```
src/
  app/(frontend)/        routes, thin: they compose domain components
  app/(payload)/         Payload admin and REST API (generated)
  domains/
    pages/               Pages collection, queries, page view
    projects/            Projects collection, queries, card model, index and detail components
    page-builder/        blocks: one folder per block, config (*.block.ts) + component
    site/                Header and Footer globals, site header/footer
    media/               Media collection, ImageData mapper, MediaImage
    users/
  fields/                reusable fields (link, SEO tab, section intro)
  components/            layout primitives (Section, Container), ui/ (shadcn), visual-editing/
  lib/payload/           draft-aware reads, access, revalidation, preview URLs
  seed/                  demo content and generated artwork
  migrations/            Postgres migrations (run in the Vercel build)
```

Where visual editing plugs in:

| | File |
| --- | --- |
| Plugin config (`pages`, `projects`, `header`, `footer`) | `src/payload.config.ts` |
| One place for draft reads: drafts + `encodeSourceMaps` in Draft Mode only | `src/lib/payload/client.ts` |
| Overlay, Live Preview refresh and draft banner, mounted in Draft Mode only | `src/components/visual-editing/draft-tools.tsx` |
| Images: `sourceOf()` read on the server, passed as data | `src/domains/media/image.ts`, `media-image.tsx` |
| Numbers and selects: `fieldSourceOf()` | `src/components/stat.tsx`, `project-card.model.ts` |
| Source as props into a client component | `project-card.model.ts` → `project-explorer.tsx` |
| `stegaClean` for hrefs and metadata | `src/lib/links.ts`, `src/lib/metadata.ts` |
| Preview entry (Draft Mode for logged-in users) | `src/app/(frontend)/next/preview/route.ts` |

Rendering: pages are static and revalidated when something is published
(`src/lib/payload/revalidate.ts`). Draft Mode renders dynamically and is never cached.

## Local development

```sh
cd apps/demo
cp .env.example .env            # set PAYLOAD_SECRET (openssl rand -hex 32) and the seed user
docker compose up -d            # Postgres on localhost:54329
pnpm dev                        # http://localhost:3000 (the schema is pushed automatically)
pnpm seed                       # demo content + the admin from SEED_ADMIN_EMAIL/PASSWORD
```

Or, from the repo root: `pnpm dev:demo`.

**Schema changes:** change a collection, then `pnpm payload migrate:create <name>` and commit the
migration. `pnpm generate:types` and `pnpm generate:importmap` after config changes.

> `pnpm dev` pushes schema changes straight into the database. Never point it at the production
> database: `payload migrate` refuses to run on a pushed database. Use Docker or a separate Neon
> branch locally.

## Deploy to Vercel with Neon

1. **Create the Vercel project** from this repository. Set **Root Directory** to `apps/demo`
   (Framework: Next.js; install and build settings come from `vercel.json`: the build runs
   `payload migrate`, then `next build`). Node.js 24.
2. **Add Neon**: Vercel → Storage → Neon (Marketplace) → connect it to the project. It sets
   `DATABASE_URL` (pooled). Optionally enable a database branch per preview deployment.
3. **Add Vercel Blob**: Storage → Blob → connect. It sets `BLOB_READ_WRITE_TOKEN`.
4. **Environment variables** (Production and Preview):
   - `PAYLOAD_SECRET`: a random string (`openssl rand -hex 32`)
   - `ENABLE_EXPERIMENTAL_COREPACK=1`: so Vercel uses the repo's pnpm version (`packageManager`)
   - optional `NEXT_PUBLIC_SERVER_URL`, e.g. `https://demo.example.com` (defaults to the Vercel
     production domain)
5. **Deploy.** The first build migrates the empty database.
6. Open `/admin`, **create the first user**, and click **Seed demo content** on the dashboard. It
   runs on the deployment (images go to Blob) and revalidates the site. The same button resets the
   demo later.
