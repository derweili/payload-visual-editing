'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'

import type { ProjectCardData } from '../project-card.model'
import { projectCategories, type ProjectCategory } from '../projects.model'
import { ProjectGrid } from './project-grid'

/**
 * The filterable project index. Filtering happens in the browser, so the page stays static.
 * A client component: the cards arrive as plain data, with their image and field sources as props.
 */
export function ProjectExplorer({ projects }: { projects: ProjectCardData[] }) {
  const [category, setCategory] = useState<ProjectCategory | 'all'>('all')
  const available = projectCategories.filter((c) => projects.some((p) => p.category === c.value))
  const visible = category === 'all' ? projects : projects.filter((p) => p.category === category)

  return (
    <div className="flex flex-col gap-10">
      {available.length > 1 && (
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {[{ value: 'all' as const, label: 'All' }, ...available].map((option) => (
            <Button
              key={option.value}
              size="lg"
              variant={category === option.value ? 'default' : 'outline'}
              aria-pressed={category === option.value}
              onClick={() => setCategory(option.value)}
              className="rounded-full px-4"
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}
      <ProjectGrid projects={visible} />
    </div>
  )
}
