import { ChartNoAxesCombined, Code, Compass, Layers, Rocket, Shield, Sparkles, Users, type LucideIcon } from 'lucide-react'

import { Section, SectionIntro } from '@/components/layout/section'
import type { FeaturesBlock as Props } from '@/payload-types'

const icons: Record<NonNullable<NonNullable<Props['items']>[number]['icon']>, LucideIcon> = {
  compass: Compass,
  layers: Layers,
  code: Code,
  chart: ChartNoAxesCombined,
  shield: Shield,
  sparkles: Sparkles,
  users: Users,
  rocket: Rocket,
}

export function Features({ eyebrow, heading, description, items }: Props) {
  return (
    <Section>
      <SectionIntro eyebrow={eyebrow} heading={heading} description={description} />
      <div className="grid gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-2 lg:grid-cols-3">
        {(items ?? []).map((item) => {
          const Icon = icons[item.icon ?? 'sparkles']
          return (
            <div key={item.id} className="flex flex-col gap-4 bg-background p-8">
              <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
                <Icon className="size-5" />
              </span>
              <h3 className="text-lg font-semibold tracking-tight">{item.title}</h3>
              {item.description && <p className="text-muted-foreground">{item.description}</p>}
            </div>
          )
        })}
      </div>
    </Section>
  )
}
