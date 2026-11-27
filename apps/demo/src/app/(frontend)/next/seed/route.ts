import { revalidatePath } from 'next/cache'
import type { NextRequest } from 'next/server'

import { getPayloadClient } from '@/lib/payload/client'
import { seed } from '@/seed/seed'

// Generating and uploading the demo images takes a few seconds
export const maxDuration = 60

/**
 * Seeds the demo content from the admin dashboard (see components/admin/seed-button.tsx).
 * Runs on the deployment itself, so images go to its storage (Vercel Blob), and the static site
 * is revalidated afterwards. Logged-in users only; replaces all pages, projects and media.
 */
export async function POST(request: NextRequest) {
  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    await seed(payload)
    revalidatePath('/', 'layout')
    return Response.json({ ok: true })
  } catch (error) {
    payload.logger.error({ err: error, msg: '[seed] failed' })
    return Response.json({ error: 'Seeding failed, see the server logs' }, { status: 500 })
  }
}
