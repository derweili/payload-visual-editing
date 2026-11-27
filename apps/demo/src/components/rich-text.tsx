import { stegaClean } from '@derweili/payload-visual-editing-overlay/vanilla'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  type JSXConvertersFunction,
  LinkJSXConverter,
  RichText as LexicalRichText,
} from '@payloadcms/richtext-lexical/react'

import { pagePath } from '@/domains/pages/pages.paths'
import { projectPath } from '@/domains/projects/projects.paths'
import { cn } from '@/lib/utils'

/** Internal links in rich text point at documents; turn them into site paths. */
const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({
    internalDocToHref: ({ linkNode }) => {
      const { relationTo, value } = linkNode.fields.doc ?? {}
      const slug = typeof value === 'object' ? stegaClean(String(value?.slug ?? '')) : ''
      return relationTo === 'projects' ? projectPath(slug) : pagePath(slug)
    },
  }),
})

/** Lexical rich text. In Draft Mode each text node carries the field's source map. */
export function RichText({ data, className }: { data: SerializedEditorState | null | undefined; className?: string }) {
  if (!data) return null
  return (
    <LexicalRichText
      data={data}
      converters={converters}
      className={cn('prose prose-neutral max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:text-brand', className)}
    />
  )
}
