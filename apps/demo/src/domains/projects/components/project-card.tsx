import { fieldAttrs } from '@derweili/payload-visual-editing-overlay/vanilla'
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { MediaImage } from '@/domains/media/components/media-image'

import type { ProjectCardData } from '../project-card.model'

/** Works in server and client components: takes plain data only. */
export function ProjectCard({ project }: { project: ProjectCardData }) {
  return (
    <article className="group relative flex flex-col gap-5">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted">
        <MediaImage
          image={project.image}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <Badge variant="secondary" className="absolute top-4 left-4 bg-background/90 backdrop-blur" {...fieldAttrs(project.sources.category)}>
          {project.categoryLabel}
        </Badge>
      </div>
      <div className="flex flex-col gap-2">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{project.client}</span>
          <span aria-hidden>·</span>
          <span {...fieldAttrs(project.sources.year)}>{project.year}</span>
        </p>
        <h3 className="flex items-start justify-between gap-4 text-xl font-semibold tracking-tight">
          <Link href={project.href} className="after:absolute after:inset-0">
            {project.title}
          </Link>
          <ArrowUpRight className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
        </h3>
        <p className="line-clamp-2 text-muted-foreground">{project.excerpt}</p>
      </div>
    </article>
  )
}
