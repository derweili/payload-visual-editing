/**
 * Section primitives, composed rather than configured:
 *
 *   <Section>
 *     <SectionHeader>
 *       <SectionEyebrow>…</SectionEyebrow>
 *       <SectionTitle>…</SectionTitle>
 *       <SectionDescription>…</SectionDescription>
 *     </SectionHeader>
 *     …content
 *   </Section>
 *
 * `SectionIntro` composes the header from the eyebrow/heading/description most blocks share.
 */
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { Container } from './container'

type SectionProps = ComponentProps<'section'> & { tone?: 'default' | 'muted' | 'inverted'; containerClassName?: string }

export function Section({ tone = 'default', className, containerClassName, children, ...props }: SectionProps) {
  return (
    <section
      data-tone={tone}
      className={cn(
        'py-20 sm:py-24',
        tone === 'muted' && 'bg-muted/50',
        tone === 'inverted' && 'dark bg-background text-foreground',
        className,
      )}
      {...props}
    >
      <Container className={containerClassName}>{children}</Container>
    </section>
  )
}

export function SectionHeader({ align = 'left', className, ...props }: ComponentProps<'div'> & { align?: 'left' | 'center' }) {
  return (
    <div
      className={cn('mb-12 flex max-w-2xl flex-col gap-4', align === 'center' && 'mx-auto items-center text-center', className)}
      {...props}
    />
  )
}

export function SectionEyebrow({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-sm font-semibold tracking-wide text-brand uppercase', className)} {...props} />
}

export function SectionTitle({ as: Tag = 'h2', className, ...props }: ComponentProps<'h2'> & { as?: 'h1' | 'h2' | 'h3' }) {
  return <Tag className={cn('text-3xl font-semibold tracking-tight text-balance sm:text-4xl', className)} {...props} />
}

export function SectionDescription({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-lg text-pretty text-muted-foreground', className)} {...props} />
}

type IntroProps = {
  eyebrow?: string | null
  heading?: string | null
  description?: string | null
  align?: 'left' | 'center'
  children?: ReactNode
}

export function SectionIntro({ eyebrow, heading, description, align, children }: IntroProps) {
  if (!eyebrow && !heading && !description && !children) return null
  return (
    <SectionHeader align={align}>
      {eyebrow && <SectionEyebrow>{eyebrow}</SectionEyebrow>}
      {heading && <SectionTitle>{heading}</SectionTitle>}
      {description && <SectionDescription>{description}</SectionDescription>}
      {children}
    </SectionHeader>
  )
}
