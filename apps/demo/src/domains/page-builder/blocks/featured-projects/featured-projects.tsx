import { CmsButton } from '@/components/cms-link'
import { Section, SectionIntro } from '@/components/layout/section'
import { ProjectGrid } from '@/domains/projects/components/project-grid'
import { populatedProjects, toProjectCard } from '@/domains/projects/project-card.model'
import { getProjects } from '@/domains/projects/projects.queries'
import { resolveLink } from '@/lib/links'
import type { FeaturedProjectsBlock as Props } from '@/payload-types'

export async function FeaturedProjects({ eyebrow, heading, description, source, projects, limit, showLink, link }: Props) {
  const docs = source === 'manual' ? populatedProjects(projects) : await getProjects({ featured: true, limit: limit ?? 3 })
  const cta = showLink ? resolveLink(link) : null

  return (
    <Section>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionIntro eyebrow={eyebrow} heading={heading} description={description} />
        {cta && (
          <div className="mb-12">
            <CmsButton link={{ ...cta, appearance: 'outline' }} arrow />
          </div>
        )}
      </div>
      <ProjectGrid projects={docs.map(toProjectCard)} />
    </Section>
  )
}
