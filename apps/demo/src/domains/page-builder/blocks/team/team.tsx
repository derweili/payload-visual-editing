import { Section, SectionIntro } from '@/components/layout/section'
import { MediaImage } from '@/domains/media/components/media-image'
import { toImage } from '@/domains/media/image'
import type { TeamBlock as Props } from '@/payload-types'

export function Team({ eyebrow, heading, description, members }: Props) {
  return (
    <Section>
      <SectionIntro eyebrow={eyebrow} heading={heading} description={description} />
      <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {(members ?? []).map((member) => (
          <li key={member.id} className="flex flex-col gap-4">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border bg-muted">
              <MediaImage image={toImage(member.photo)} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" />
            </div>
            <div>
              <h3 className="font-semibold tracking-tight">{member.name}</h3>
              {member.role && <p className="text-sm text-muted-foreground">{member.role}</p>}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}
