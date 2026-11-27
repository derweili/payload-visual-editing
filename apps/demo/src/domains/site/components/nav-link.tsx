'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import type { ResolvedLink } from '@/lib/links'
import { cn } from '@/lib/utils'

/** A header link that knows whether it points at the current section. */
export function NavLink({ link, className }: { link: ResolvedLink; className?: string }) {
  const pathname = usePathname()
  const active = link.href === '/' ? pathname === '/' : pathname === link.href || pathname.startsWith(`${link.href}/`)
  return (
    <Link
      href={link.href}
      aria-current={active ? 'page' : undefined}
      className={cn('text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:text-foreground', className)}
      {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {link.label}
    </Link>
  )
}
