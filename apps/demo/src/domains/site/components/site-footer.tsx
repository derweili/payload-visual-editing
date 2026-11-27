import { CmsLink } from '@/components/cms-link'
import { Container } from '@/components/layout/container'
import { Separator } from '@/components/ui/separator'
import { resolveLink } from '@/lib/links'

import { getFooter, getHeader } from '../site.queries'
import { Logo } from './logo'

export async function SiteFooter() {
  const [footer, header] = await Promise.all([getFooter(), getHeader()])

  return (
    <footer className="border-t bg-muted/30">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2fr]">
          <div className="flex max-w-sm flex-col gap-4">
            <Logo brand={header.brand} />
            {footer.tagline && <p className="text-muted-foreground">{footer.tagline}</p>}
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {(footer.columns ?? []).map((column) => (
              <div key={column.id} className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold">{column.title}</h3>
                <ul className="flex flex-col gap-3 text-sm">
                  {(column.links ?? []).map((item) => {
                    const link = resolveLink(item.link)
                    return link ? (
                      <li key={item.id}>
                        <CmsLink link={link} className="text-muted-foreground transition-colors hover:text-foreground" />
                      </li>
                    ) : null
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <Separator className="my-10" />
        <p className="text-sm text-muted-foreground">{footer.legal}</p>
      </Container>
    </footer>
  )
}
