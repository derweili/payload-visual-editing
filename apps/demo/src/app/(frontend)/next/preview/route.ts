import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { getPayloadClient } from '@/lib/payload/client'

/**
 * Entry point for Live Preview and the admin's Preview button: turns on Draft Mode for a
 * logged-in editor, then shows `?path=`. Draft Mode makes the site read drafts with source maps.
 */
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') ?? '/'
  // Only same-site paths: no open redirect
  if (!path.startsWith('/') || path.startsWith('//')) return new Response('Invalid path', { status: 400 })

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Log in to the admin to preview drafts.', { status: 403 })

  ;(await draftMode()).enable()
  redirect(path)
}
