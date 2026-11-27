import Link from 'next/link'

import { Container } from '@/components/layout/container'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <Container className="flex flex-col items-start gap-6 py-32">
      <p className="text-sm font-semibold text-brand">404</p>
      <h1 className="text-4xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-lg text-muted-foreground">The page you’re looking for doesn’t exist or isn’t published yet.</p>
      <Button asChild size="lg">
        <Link href="/">Back to the homepage</Link>
      </Button>
    </Container>
  )
}
