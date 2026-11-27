import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Container } from '@/components/layout/container'
import { MediaImage } from '@/domains/media/components/media-image'
import { toImage } from '@/domains/media/image'
import { ProjectGallery } from '@/domains/projects/components/detail/project-gallery'
import { ProjectHeader } from '@/domains/projects/components/detail/project-header'
import { ProjectStory } from '@/domains/projects/components/detail/project-story'
import { ProjectTestimonial } from '@/domains/projects/components/detail/project-testimonial'
import { RelatedProjects } from '@/domains/projects/components/detail/related-projects'
import { projectPath } from '@/domains/projects/projects.paths'
import { getProjectBySlug, getProjectSlugs } from '@/domains/projects/projects.queries'
import { toMetadata } from '@/lib/metadata'

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getProjectSlugs()).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) return {}
  return toMetadata(
    { ...project.meta, image: project.meta?.image || project.coverImage },
    { title: project.title, description: project.excerpt, path: projectPath(slug) },
  )
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)
  if (!project) notFound()

  return (
    <article>
      <ProjectHeader project={project} />
      <Container>
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border bg-muted">
          <MediaImage image={toImage(project.coverImage)} fill preload sizes="(min-width: 1280px) 1216px, 100vw" />
        </div>
      </Container>
      <ProjectStory project={project} />
      <ProjectGallery gallery={project.gallery} />
      <ProjectTestimonial testimonial={project.testimonial} />
      <RelatedProjects projects={project.relatedProjects} />
    </article>
  )
}
