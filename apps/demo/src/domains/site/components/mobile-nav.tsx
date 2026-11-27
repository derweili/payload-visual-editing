'use client'

import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { CmsButton } from '@/components/cms-link'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { ResolvedLink } from '@/lib/links'

import { NavLink } from './nav-link'

export function MobileNav({ items, cta }: { items: ResolvedLink[]; cta: ResolvedLink | null }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  useEffect(() => setOpen(false), [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon-lg" className="md:hidden" aria-label="Open menu">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-xs">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {items.map((item) => (
            <NavLink key={item.href} link={item} className="rounded-md px-2 py-3 text-lg" />
          ))}
        </nav>
        {cta && (
          <div className="mt-auto p-4">
            <CmsButton link={cta} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
