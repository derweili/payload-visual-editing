import { Container } from '@/components/layout/container'
import { MediaImage } from '@/domains/media/components/media-image'
import { toImage } from '@/domains/media/image'
import { cn } from '@/lib/utils'
import type { Project } from '@/payload-types'

/** Image grid: every third image spans the full width. */
export function ProjectGallery({ gallery }: { gallery: Project['gallery'] }) {
  if (!gallery?.length) return null
  return (
    <Container className="grid gap-6 pb-20 sm:grid-cols-2">
      {gallery.map((item, i) => {
        const wide = i % 3 === 0
        return (
          <figure key={item.id} className={cn('flex flex-col gap-3', wide && 'sm:col-span-2')}>
            <div className={cn('relative overflow-hidden rounded-2xl border bg-muted', wide ? 'aspect-[16/8]' : 'aspect-[4/3]')}>
              <MediaImage image={toImage(item.image)} fill sizes={wide ? '100vw' : '(min-width: 640px) 50vw, 100vw'} />
            </div>
            {item.caption && <figcaption className="text-sm text-muted-foreground">{item.caption}</figcaption>}
          </figure>
        )
      })}
    </Container>
  )
}
