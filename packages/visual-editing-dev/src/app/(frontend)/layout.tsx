import type { ReactNode } from 'react'

export const metadata = { title: 'Visual editing test app' }

export default function FrontendLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: '2rem', lineHeight: 1.5 }}>
        {children}
      </body>
    </html>
  )
}
