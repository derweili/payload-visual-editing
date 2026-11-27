import { stegaClean } from '@derweili/payload-visual-editing-overlay/vanilla'
import type { Metadata } from 'next'

import type { Media } from '@/payload-types'

type Meta = { title?: string | null; description?: string | null; image?: number | Media | null } | undefined

/**
 * Metadata from a document's SEO tab. Cleaned of source maps: in Draft Mode the strings carry
 * hidden characters, which must never end up in <title> or Open Graph tags.
 */
export function toMetadata(meta: Meta, fallback: { title: string; description?: string | null; path: string }): Metadata {
  const title = stegaClean(meta?.title || fallback.title)
  const description = stegaClean(meta?.description || fallback.description || undefined)
  const image = meta?.image && typeof meta.image === 'object' && meta.image.url ? meta.image.url : undefined
  return {
    title,
    description,
    alternates: { canonical: fallback.path },
    openGraph: { title, description, url: fallback.path, images: image ? [{ url: image }] : undefined },
  }
}
