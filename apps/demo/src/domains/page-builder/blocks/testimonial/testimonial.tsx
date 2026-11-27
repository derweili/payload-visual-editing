import { Section } from '@/components/layout/section'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toImage } from '@/domains/media/image'
import { fieldAttrs, stegaClean } from '@derweili/payload-visual-editing-overlay/vanilla'
import type { TestimonialBlock as Props } from '@/payload-types'

const initials = (name: string) =>
  stegaClean(name)
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')

export function Testimonial({ quote, author, role, avatar }: Props) {
  const img = toImage(avatar)
  return (
    <Section tone="muted">
      <figure className="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
        <svg aria-hidden viewBox="0 0 32 32" className="size-10 text-brand" fill="currentColor">
          <path d="M10 8C5.6 8 2 11.6 2 16v8h8v-8H6c0-2.2 1.8-4 4-4V8Zm16 0c-4.4 0-8 3.6-8 8v8h8v-8h-4c0-2.2 1.8-4 4-4V8Z" />
        </svg>
        <blockquote className="text-2xl font-medium tracking-tight text-balance sm:text-3xl">“{quote}”</blockquote>
        <figcaption className="flex items-center gap-4 text-left">
          <Avatar className="size-12">
            {img && <AvatarImage {...fieldAttrs(img.source)} src={img.url} alt={img.alt} className="object-cover" />}
            <AvatarFallback>{initials(author)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{author}</div>
            {role && <div className="text-sm text-muted-foreground">{role}</div>}
          </div>
        </figcaption>
      </figure>
    </Section>
  )
}
