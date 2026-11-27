import { stegaClean } from '@derweili/payload-visual-editing-overlay/vanilla'

import { pagePath } from '@/domains/pages/pages.paths'
import { projectPath } from '@/domains/projects/projects.paths'
import type { ButtonLink, Link } from '@/payload-types'

export type ResolvedLink = {
  href: string
  /** Display text: in Draft Mode it carries the label field's source map */
  label: string
  newTab: boolean
  appearance: 'default' | 'outline'
}

/** Turns a link field into an href. Everything that becomes a URL is cleaned of source maps. */
export function resolveLink(link: Link | ButtonLink | null | undefined): ResolvedLink | null {
  if (!link?.label) return null
  const appearance = 'appearance' in link && link.appearance === 'outline' ? 'outline' : 'default'

  let href: string | null = null
  if (link.type === 'custom') {
    href = link.url ? stegaClean(link.url) : null
  } else if (link.reference && typeof link.reference.value === 'object') {
    const slug = stegaClean(link.reference.value.slug)
    href = link.reference.relationTo === 'projects' ? projectPath(slug) : pagePath(slug)
  }
  if (!href) return null

  return { href, label: link.label, newTab: Boolean(link.newTab), appearance }
}
