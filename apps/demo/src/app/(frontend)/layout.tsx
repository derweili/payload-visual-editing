import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import type { ReactNode } from 'react'

import { DraftTools } from '@/components/visual-editing/draft-tools'
import { SiteFooter } from '@/domains/site/components/site-footer'
import { SiteHeader } from '@/domains/site/components/site-header'
import { getServerURL } from '@/lib/server-url'
import { cn } from '@/lib/utils'

import './globals.css'

const sans = Geist({ subsets: ['latin'], variable: '--font-sans' })
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  metadataBase: new URL(getServerURL()),
  title: { default: 'Lumora', template: '%s · Lumora' },
  description: 'A demo site for Payload visual editing.',
}

export default function FrontendLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={cn(sans.variable, mono.variable)}>
      <body className="flex min-h-dvh flex-col antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <DraftTools />
      </body>
    </html>
  )
}
