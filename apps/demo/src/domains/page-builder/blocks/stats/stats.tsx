import { Section, SectionIntro } from '@/components/layout/section'
import { Stat } from '@/components/stat'
import type { StatsBlock as Props } from '@/payload-types'

export function Stats({ eyebrow, heading, description, items }: Props) {
  return (
    <Section tone="inverted">
      <SectionIntro eyebrow={eyebrow} heading={heading} description={description} />
      <dl className="grid gap-10 border-t pt-10 sm:grid-cols-2 lg:grid-cols-4">
        {(items ?? []).map((item) => (
          <Stat key={item.id} item={item} />
        ))}
      </dl>
    </Section>
  )
}
