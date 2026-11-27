import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'

import { getPayloadClient } from '@/lib/payload/client'
import { seed } from '@/seed/seed'

// Seconds. Generating and uploading the demo images takes a while; 300 is the Hobby plan's limit
// with Fluid Compute (the default for new projects)
export const maxDuration = 300

/**
 * Seeds the demo content from the admin dashboard (see components/admin/seed-button.tsx).
 * Runs on the deployment itself, so images go to its storage (Vercel Blob), and the static site
 * is revalidated afterwards. Logged-in users only; replaces all pages, projects and media.
 */
export async function POST(request: NextRequest) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Vercel's file system is read-only: without Blob storage the first upload would fail, after the
  // seed has already cleared the content. Stop before touching anything.
  if (process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: 'BLOB_READ_WRITE_TOKEN is not set. Connect a Vercel Blob store and redeploy.' },
      { status: 500 },
    )
  }

  try {
    await seed(payload)
    revalidatePath('/', 'layout')
    return Response.json({ ok: true })
  } catch (error) {
    payload.logger.error({ err: error, msg: '[seed] failed' })
    return Response.json({ error: 'Seeding failed, see the server logs' }, { status: 500 })
  }
}
