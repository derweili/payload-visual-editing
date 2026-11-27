/**
 * Renders a page's blocks: one component per block type. Adding a block means adding its config
 * to blocks.ts and its component here; TypeScript checks that every block type has one.
 */
import type { ComponentType } from 'react'

import type { Page } from '@/payload-types'

import { Content } from './blocks/content/content'
import { Cta } from './blocks/cta/cta'
import { Faq } from './blocks/faq/faq'
import { FeaturedProjects } from './blocks/featured-projects/featured-projects'
import { Features } from './blocks/features/features'
import { Hero } from './blocks/hero/hero'
import { LogoCloud } from './blocks/logo-cloud/logo-cloud'
import { ProjectIndex } from './blocks/project-index/project-index'
import { Stats } from './blocks/stats/stats'
import { Team } from './blocks/team/team'
import { Testimonial } from './blocks/testimonial/testimonial'

type LayoutBlock = Page['layout'][number]
type BlockComponents = { [T in LayoutBlock['blockType']]: ComponentType<Extract<LayoutBlock, { blockType: T }>> }

const components: BlockComponents = {
  hero: Hero,
  logoCloud: LogoCloud,
  features: Features,
  stats: Stats,
  featuredProjects: FeaturedProjects,
  projectIndex: ProjectIndex,
  testimonial: Testimonial,
  content: Content,
  team: Team,
  faq: Faq,
  cta: Cta,
}

export function RenderBlocks({ blocks }: { blocks: LayoutBlock[] }) {
  return blocks.map((block) => {
    const Component = components[block.blockType] as ComponentType<LayoutBlock>
    return <Component key={block.id} {...block} />
  })
}
