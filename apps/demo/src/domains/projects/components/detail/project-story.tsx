import { Section } from '@/components/layout/section'
import { RichText } from '@/components/rich-text'
import { Stat } from '@/components/stat'
import type { Project } from '@/payload-types'

/** Challenge, solution, results and the long-form write-up. */
export function ProjectStory({ project }: { project: Project }) {
  const { challenge, solution, results, body } = project
  return (
    <Section>
      <div className="grid gap-16">
        {(challenge || solution) && (
          <div className="grid gap-10 md:grid-cols-2">
            {challenge && <StoryPart title="The challenge">{challenge}</StoryPart>}
            {solution && <StoryPart title="Our approach">{solution}</StoryPart>}
          </div>
        )}
        {results && results.length > 0 && (
          <dl className="grid gap-10 rounded-3xl border bg-muted/40 p-8 sm:grid-cols-2 sm:p-12 lg:grid-cols-4">
            {results.map((item) => (
              <Stat key={item.id} item={item} />
            ))}
          </dl>
        )}
        {body && <RichText data={body} className="prose-lg mx-auto w-full max-w-3xl" />}
      </div>
    </Section>
  )
}

function StoryPart({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold tracking-wide text-brand uppercase">{title}</h2>
      <p className="text-xl leading-relaxed text-pretty">{children}</p>
    </div>
  )
}
