import { fieldAttrs, fieldSourceOf } from '@derweili/payload-visual-editing-overlay/vanilla'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Container } from '@/components/layout/container'
import { Badge } from '@/components/ui/badge'
import type { Project } from '@/payload-types'

import { categoryLabel } from '../../projects.model'
import { PROJECTS_PATH } from '../../projects.paths'

export function ProjectHeader({ project }: { project: Project }) {
  const facts = [
    { label: 'Client', value: <span>{project.client}</span> },
    { label: 'Year', value: <span {...fieldAttrs(fieldSourceOf(project, 'year'))}>{project.year}</span> },
    {
      label: 'Services',
      value: (project.services ?? []).length ? (
        <ul className="flex flex-wrap gap-x-2">
          {project.services!.map((service, i) => (
            <li key={service.id}>
              {service.name}
              {i < project.services!.length - 1 && ','}
            </li>
          ))}
        </ul>
      ) : null,
    },
  ].filter((fact) => fact.value)

  return (
    <Container className="flex flex-col gap-10 pt-12 pb-12 sm:pt-16">
      <Link href={PROJECTS_PATH} className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" /> All projects
      </Link>
      <div className="grid gap-10 lg:grid-cols-[2fr_1fr] lg:items-end">
        <div className="flex flex-col gap-6">
          <Badge variant="outline" className="w-fit" {...fieldAttrs(fieldSourceOf(project, 'category'))}>
            {categoryLabel(project.category)}
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">{project.title}</h1>
          <p className="max-w-2xl text-xl text-pretty text-muted-foreground">{project.excerpt}</p>
        </div>
        <dl className="grid grid-cols-2 gap-6 border-t pt-6 lg:grid-cols-1 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-1">
              <dt className="text-sm text-muted-foreground">{fact.label}</dt>
              <dd className="font-medium">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Container>
  )
}
