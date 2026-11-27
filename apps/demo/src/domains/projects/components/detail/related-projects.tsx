import { Section, SectionIntro } from '@/components/layout/section'
import type { Project } from '@/payload-types'

import { populatedProjects, toProjectCard } from '../../project-card.model'
import { ProjectGrid } from '../project-grid'

export function RelatedProjects({ projects }: { projects: Project['relatedProjects'] }) {
  const related = populatedProjects(projects)
  if (related.length === 0) return null
  return (
    <Section>
      <SectionIntro heading="More work" />
      <ProjectGrid projects={related.map(toProjectCard)} />
    </Section>
  )
}
