import { ArrowRight } from 'lucide-react'
import NextLink from 'next/link'
import type { ComponentProps } from 'react'

import { Button } from '@/components/ui/button'
import type { ResolvedLink } from '@/lib/links'

type Props = Omit<ComponentProps<typeof NextLink>, 'href'> & { link: ResolvedLink }

/** A plain link to a CMS target. */
export function CmsLink({ link, children, ...props }: Props) {
  return (
    <NextLink
      href={link.href}
      {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    >
      {children ?? link.label}
    </NextLink>
  )
}

/** A CMS link styled as a button, in the appearance the editor picked. */
export function CmsButton({ link, size = 'lg', arrow }: { link: ResolvedLink; size?: 'default' | 'lg'; arrow?: boolean }) {
  return (
    <Button asChild size={size} variant={link.appearance === 'outline' ? 'outline' : 'default'}>
      <CmsLink link={link}>
        {link.label}
        {arrow && <ArrowRight data-icon="inline-end" />}
      </CmsLink>
    </Button>
  )
}
