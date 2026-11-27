import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'
import { getPayload } from 'payload'

/** Live Preview entry: turns on Draft Mode for a logged-in user, then shows `?path=`. */
export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path') ?? '/'
  if (!path.startsWith('/') || path.startsWith('//')) return new Response('Invalid path', { status: 400 })
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response('Log in to the admin to preview drafts', { status: 403 })
  ;(await draftMode()).enable()
  redirect(path)
}
