'use client'

import { Eye, X } from 'lucide-react'
import { useEffect, useState } from 'react'

/** A small hint while browsing drafts. Hidden inside the admin's Live Preview iframe. */
export function DraftModeBanner() {
  const [inIframe, setInIframe] = useState(true)
  useEffect(() => setInIframe(window.self !== window.top), [])
  if (inIframe) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border bg-background/95 py-1.5 pr-1.5 pl-4 text-sm shadow-lg backdrop-blur">
      <Eye className="size-4 text-brand" />
      <span>
        <strong className="font-semibold">Draft preview.</strong>{' '}
        <span className="text-muted-foreground">Hover any content and click “Edit”.</span>
      </span>
      {/* A plain link: route handlers aren't prefetched */}
      <a
        href="/next/exit-preview"
        className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 font-medium transition-colors hover:bg-accent"
      >
        <X className="size-3.5" /> Exit
      </a>
    </div>
  )
}
