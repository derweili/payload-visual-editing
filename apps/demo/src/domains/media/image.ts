import { sourceOf, type SourceLocation } from '@derweili/payload-visual-editing-overlay/vanilla'

import type { Media } from '@/payload-types'

/**
 * A plain, serializable image. `source` is the upload field the image came from (Draft Mode only),
 * read here on the server: the plugin's tag sits under a symbol key, which doesn't survive the
 * trip to client components. Passing `source` as data does.
 */
export type ImageData = {
  url: string
  alt: string
  width?: number
  height?: number
  focalX?: number
  focalY?: number
  source?: SourceLocation | null
}

export function toImage(media: number | Media | null | undefined): ImageData | null {
  if (!media || typeof media !== 'object' || !media.url) return null
  return {
    url: media.url,
    alt: media.alt ?? '',
    width: media.width ?? undefined,
    height: media.height ?? undefined,
    focalX: media.focalX ?? undefined,
    focalY: media.focalY ?? undefined,
    source: sourceOf(media),
  }
}
