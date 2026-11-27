import { Container } from '@/components/layout/container'
import type { LogoCloudBlock as Props } from '@/payload-types'

/** Client names set as wordmarks: no logo files needed for the demo. */
export function LogoCloud({ heading, clients }: Props) {
  return (
    <section className="border-y bg-muted/30 py-12">
      <Container className="flex flex-col items-center gap-8">
        {heading && <p className="text-sm font-medium text-muted-foreground">{heading}</p>}
        <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {(clients ?? []).map((client) => (
            <li key={client.id} className="text-xl font-semibold tracking-tight text-foreground/50 transition-colors hover:text-foreground">
              {client.name}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
