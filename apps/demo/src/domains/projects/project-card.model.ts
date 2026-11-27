import {
  fieldSourceOf,
  stegaClean,
  type SourceLocation,
} from '@derweili/payload-visual-editing-overlay/vanilla'

import { toImage, type ImageData } from '@/domains/media/image'
import type { Project } from '@/payload-types'

import { categoryLabel, type ProjectCategory } from './projects.model'
import { projectPath } from './projects.paths'

/**
 * What a project card shows, as plain data: it renders in server components (featured projects)
 * and in a client component (the filterable index). Values that aren't text carry their source
 * explicitly, because source tags don't cross into client components.
 */
export type ProjectCardData = {
  id: number
  href: string
  title: string
  excerpt: string
  client: string
  category: ProjectCategory
  categoryLabel: string
  year: number
  image: ImageData | null
  sources: { category: SourceLocation | null; year: SourceLocation | null }
}

export function toProjectCard(project: Project): ProjectCardData {
  return {
    id: project.id,
    href: projectPath(stegaClean(project.slug)),
    title: project.title,
    excerpt: project.excerpt,
    client: project.client,
    category: project.category,
    categoryLabel: categoryLabel(project.category),
    year: project.year,
    image: toImage(project.coverImage),
    sources: { category: fieldSourceOf(project, 'category'), year: fieldSourceOf(project, 'year') },
  }
}

/** Relationship values: drop the ones that aren't populated (unpublished or missing). */
export const populatedProjects = (values: (number | Project)[] | null | undefined): Project[] =>
  (values ?? []).filter((value): value is Project => typeof value === 'object' && value !== null)
