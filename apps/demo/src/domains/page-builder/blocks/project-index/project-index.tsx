import { Section, SectionIntro } from '@/components/layout/section'
import { ProjectExplorer } from '@/domains/projects/components/project-explorer'
import { ProjectGrid } from '@/domains/projects/components/project-grid'
import { toProjectCard } from '@/domains/projects/project-card.model'
import { getProjects } from '@/domains/projects/projects.queries'
import type { ProjectIndexBlock as Props } from '@/payload-types'

export async function ProjectIndex({ eyebrow, heading, description, showFilters }: Props) {
  const projects = (await getProjects()).map(toProjectCard)
  return (
    <Section className="pt-12 sm:pt-16">
      <SectionIntro eyebrow={eyebrow} heading={heading} description={description} />
      {showFilters ? <ProjectExplorer projects={projects} /> : <ProjectGrid projects={projects} />}
    </Section>
  )
}
