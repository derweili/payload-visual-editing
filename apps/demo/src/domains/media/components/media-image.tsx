import { fieldAttrs } from '@derweili/payload-visual-editing-overlay/vanilla'
import Image from 'next/image'

import { cn } from '@/lib/utils'

import type { ImageData } from '../image'

type Props = {
  image: ImageData | null
  sizes?: string
  preload?: boolean
  className?: string
  /** Fill the parent (which sets the aspect ratio) instead of using the image's own size */
  fill?: boolean
}

/**
 * Every image on the site goes through here, so every image is clickable in Draft Mode:
 * `fieldAttrs` renders the upload field's source as data attributes (nothing outside Draft Mode).
 */
export function MediaImage({ image, sizes = '100vw', preload, className, fill = false }: Props) {
  if (!image) return <div className={cn('bg-muted', className)} />

  const objectPosition =
    image.focalX != null && image.focalY != null ? `${image.focalX}% ${image.focalY}%` : undefined

  const common = {
    ...fieldAttrs(image.source),
    src: image.url,
    alt: image.alt,
    sizes,
    preload,
    style: objectPosition ? { objectPosition } : undefined,
  }

  return fill ? (
    <Image {...common} fill className={cn('object-cover', className)} />
  ) : (
    <Image {...common} width={image.width ?? 1600} height={image.height ?? 900} className={className} />
  )
}
