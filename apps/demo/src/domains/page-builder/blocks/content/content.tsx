import { Section, SectionEyebrow, SectionTitle } from '@/components/layout/section'
import { RichText } from '@/components/rich-text'
import type { ContentBlock as Props } from '@/payload-types'

export function Content({ eyebrow, heading, body }: Props) {
  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <div className="flex flex-col gap-4">
          {eyebrow && <SectionEyebrow>{eyebrow}</SectionEyebrow>}
          {heading && <SectionTitle>{heading}</SectionTitle>}
        </div>
        <RichText data={body} className="prose-lg" />
      </div>
    </Section>
  )
}
