import { CmsButton } from '@/components/cms-link'
import { Container } from '@/components/layout/container'
import { resolveLink, type ResolvedLink } from '@/lib/links'
import type { CtaBlock as Props } from '@/payload-types'

export function Cta({ heading, description, links }: Props) {
  const buttons = (links ?? []).map((item) => resolveLink(item.link)).filter((link): link is ResolvedLink => link !== null)
  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="dark relative isolate overflow-hidden rounded-3xl bg-background px-8 py-16 text-center text-foreground sm:px-16 sm:py-20">
          <div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(50%_80%_at_50%_100%,var(--color-brand),transparent)] opacity-40" />
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{heading}</h2>
          {description && <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">{description}</p>}
          {buttons.length > 0 && (
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {buttons.map((link, i) => (
                <CmsButton key={link.href} link={link} arrow={i === 0} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
