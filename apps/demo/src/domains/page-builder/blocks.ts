/** The page builder's blocks, in the order editors see them. Rendering: render-blocks.tsx. */
import { ContentBlock } from './blocks/content/content.block'
import { CtaBlock } from './blocks/cta/cta.block'
import { FaqBlock } from './blocks/faq/faq.block'
import { FeaturedProjectsBlock } from './blocks/featured-projects/featured-projects.block'
import { FeaturesBlock } from './blocks/features/features.block'
import { HeroBlock } from './blocks/hero/hero.block'
import { ProjectIndexBlock } from './blocks/project-index/project-index.block'
import { LogoCloudBlock } from './blocks/logo-cloud/logo-cloud.block'
import { StatsBlock } from './blocks/stats/stats.block'
import { TeamBlock } from './blocks/team/team.block'
import { TestimonialBlock } from './blocks/testimonial/testimonial.block'

export const pageBlocks = [
  HeroBlock,
  LogoCloudBlock,
  FeaturesBlock,
  StatsBlock,
  FeaturedProjectsBlock,
  ProjectIndexBlock,
  TestimonialBlock,
  ContentBlock,
  TeamBlock,
  FaqBlock,
  CtaBlock,
]
