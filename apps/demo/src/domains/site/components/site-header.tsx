import { CmsButton } from '@/components/cms-link'
import { Container } from '@/components/layout/container'
import { resolveLink, type ResolvedLink } from '@/lib/links'

import { getHeader } from '../site.queries'
import { Logo } from './logo'
import { MobileNav } from './mobile-nav'
import { NavLink } from './nav-link'

export async function SiteHeader() {
  const header = await getHeader()
  const items = (header.navItems ?? []).map((item) => resolveLink(item.link)).filter((link): link is ResolvedLink => link !== null)
  const cta = resolveLink(header.cta)

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Logo brand={header.brand} />
        <nav aria-label="Main" className="hidden items-center gap-8 text-sm font-medium md:flex">
          {items.map((item) => (
            <NavLink key={item.href} link={item} />
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {cta && (
            <div className="hidden md:block">
              <CmsButton link={cta} size="default" />
            </div>
          )}
          <MobileNav items={items} cta={cta} />
        </div>
      </Container>
    </header>
  )
}
