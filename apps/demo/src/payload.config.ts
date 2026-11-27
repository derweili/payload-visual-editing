import path from 'path'
import { fileURLToPath } from 'url'

import { visualEditingPlugin } from '@derweili/payload-visual-editing/server'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Media } from '@/domains/media/media.collection'
import { Pages } from '@/domains/pages/pages.collection'
import { Projects } from '@/domains/projects/projects.collection'
import { Footer } from '@/domains/site/footer.global'
import { Header } from '@/domains/site/header.global'
import { Users } from '@/domains/users/users.collection'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? '',
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || undefined,
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
    migrationDir: path.resolve(dirname, 'migrations'),
    // Production schema changes go through migrations (`pnpm payload migrate` runs in the build)
    push: process.env.NODE_ENV !== 'production',
  }),
  editor: lexicalEditor(),
  sharp,
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname },
    meta: { titleSuffix: ' · Lumora admin' },
    components: { beforeDashboard: ['/components/admin/seed-button#SeedButton'] },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 820, height: 1180 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections: [Pages, Projects, Media, Users],
  globals: [Header, Footer],
  plugins: [
    visualEditingPlugin({
      collections: [Pages.slug, Projects.slug],
      globals: [Header.slug, Footer.slug],
    }),
    vercelBlobStorage({
      // Without a token (local development) files are stored in ./media
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      token: process.env.BLOB_READ_WRITE_TOKEN,
      // Same schema with and without the token, so one set of migrations fits both
      alwaysInsertFields: true,
      // Serve files straight from the Blob CDN instead of through Payload
      collections: { media: { disablePayloadAccessControl: true } },
      // Uploads go from the browser to Blob, past the 4.5 MB request limit of Vercel Functions
      clientUploads: true,
    }),
  ],
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  telemetry: false,
})
