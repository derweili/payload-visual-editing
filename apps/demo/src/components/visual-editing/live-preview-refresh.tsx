'use client'

import { RefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Server-side Live Preview: when the editor (auto)saves, re-render the route on the server.
 * The admin runs on the same origin as the site.
 */
export function LivePreviewRefresh() {
  const router = useRouter()
  const [origin, setOrigin] = useState<string | null>(null)
  useEffect(() => setOrigin(window.location.origin), [])
  if (!origin) return null
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={origin} />
}
