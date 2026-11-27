import { cn } from '@/lib/utils'

import type { ProjectCardData } from '../project-card.model'
import { ProjectCard } from './project-card'

export function ProjectGrid({ projects, className }: { projects: ProjectCardData[]; className?: string }) {
  if (projects.length === 0) return <p className="text-muted-foreground">No projects yet.</p>
  return (
    <div className={cn('grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}
