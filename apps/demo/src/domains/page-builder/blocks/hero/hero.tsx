import { CmsButton } from '@/components/cms-link'
import { Container } from '@/components/layout/container'
import { MediaImage } from '@/domains/media/components/media-image'
import { toImage } from '@/domains/media/image'
import { resolveLink, type ResolvedLink } from '@/lib/links'
import { cn } from '@/lib/utils'
import type { HeroBlock as Props } from '@/payload-types'

export function Hero({ eyebrow, heading, description, links, image, layout }: Props) {
  const buttons = (links ?? []).map((item) => resolveLink(item.link)).filter((link): link is ResolvedLink => link !== null)
  const centered = layout === 'centered'
  const img = toImage(image)

  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,var(--color-brand-soft),transparent)]" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <Container className={cn('grid items-center gap-12 py-20 sm:py-28', !centered && img && 'lg:grid-cols-2 lg:gap-16')}>
        <div className={cn('flex flex-col gap-6', centered && 'mx-auto max-w-3xl items-center text-center')}>
          {eyebrow && (
            <p className="inline-flex w-fit items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-sm font-medium text-muted-foreground backdrop-blur">
              <span className="size-1.5 rounded-full bg-brand" />
              {eyebrow}
            </p>
          )}
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">{heading}</h1>
          {description && <p className="max-w-2xl text-lg text-pretty text-muted-foreground sm:text-xl">{description}</p>}
          {buttons.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-3">
              {buttons.map((link, i) => (
                <CmsButton key={link.href} link={link} arrow={i === 0} />
              ))}
            </div>
          )}
        </div>
        {img && (
          <div className={cn('relative overflow-hidden rounded-3xl border bg-muted shadow-2xl shadow-brand/10', centered ? 'aspect-[21/9]' : 'aspect-[4/3]')}>
            <MediaImage image={img} fill preload sizes={centered ? '100vw' : '(min-width: 1024px) 50vw, 100vw'} />
          </div>
        )}
      </Container>
    </section>
  )
}
