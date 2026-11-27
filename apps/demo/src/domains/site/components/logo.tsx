import Link from 'next/link'

/** Wordmark: a simple geometric mark plus the brand name from the Header global. */
export function Logo({ brand }: { brand: string }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
      <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-foreground text-background">
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor">
          <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.3 6.6 3.7L12 11.7 5.4 8 12 4.3Z" />
        </svg>
      </span>
      <span className="text-lg">{brand}</span>
    </Link>
  )
}
