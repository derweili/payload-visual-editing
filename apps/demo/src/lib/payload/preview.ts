import type { PayloadRequest } from 'payload'

import { getServerURL } from '@/lib/server-url'

/** Origin of the admin request, so previews work on every deployment (preview URLs included). */
function originOf(req: PayloadRequest): string {
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  if (!host) return getServerURL()
  const proto = req.headers.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

/**
 * URL that enables Draft Mode and shows `path`. Used by Live Preview (inside the admin's iframe:
 * clicks focus the field next to it) and by the Preview button (new tab: clicks open the field).
 */
export function previewURL(path: string, req: PayloadRequest): string {
  return `${originOf(req)}/next/preview?path=${encodeURIComponent(path)}`
}
