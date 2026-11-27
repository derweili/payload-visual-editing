import { Section, SectionIntro } from '@/components/layout/section'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type { FaqBlock as Props } from '@/payload-types'

export function Faq({ eyebrow, heading, description, items }: Props) {
  return (
    <Section>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
        <SectionIntro eyebrow={eyebrow} heading={heading} description={description} />
        <Accordion type="single" collapsible defaultValue={items?.[0]?.id ?? undefined}>
          {(items ?? []).map((item) => (
            <AccordionItem key={item.id} value={item.id ?? item.question}>
              <AccordionTrigger className="text-base">{item.question}</AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  )
}
