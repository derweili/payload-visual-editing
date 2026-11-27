/**
 * The site's public origin, for absolute URLs (metadata, sitemap, preview links).
 * Explicit config wins; on Vercel the production domain; locally localhost.
 */
export function getServerURL(): string {
  if (process.env.NEXT_PUBLIC_SERVER_URL) return process.env.NEXT_PUBLIC_SERVER_URL.replace(/\/$/, '')
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  return `http://localhost:${process.env.PORT ?? 3000}`
}
