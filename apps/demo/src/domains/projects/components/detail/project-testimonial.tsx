import { Section } from '@/components/layout/section'
import type { Project } from '@/payload-types'

export function ProjectTestimonial({ testimonial }: { testimonial: Project['testimonial'] }) {
  if (!testimonial?.quote) return null
  return (
    <Section tone="muted">
      <figure className="mx-auto flex max-w-3xl flex-col gap-6">
        <blockquote className="text-2xl font-medium tracking-tight text-balance sm:text-3xl">“{testimonial.quote}”</blockquote>
        {testimonial.author && (
          <figcaption>
            <span className="font-semibold">{testimonial.author}</span>
            {testimonial.role && <span className="text-muted-foreground"> · {testimonial.role}</span>}
          </figcaption>
        )}
      </figure>
    </Section>
  )
}
