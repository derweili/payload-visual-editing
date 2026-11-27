/** Code shown on the landing page. Highlighted at build time by code.data.ts. */
export interface Snippet {
  label: string
  lang: 'bash' | 'ts' | 'tsx' | 'txt'
  code: string
}

export const setupTabs: Snippet[] = [
  {
    label: 'Install',
    lang: 'bash',
    code: `pnpm add @derweili/payload-visual-editing \\
  @derweili/payload-visual-editing-overlay`,
  },
  {
    label: 'payload.config.ts',
    lang: 'ts',
    code: `import { buildConfig } from 'payload'
import { visualEditingPlugin } from '@derweili/payload-visual-editing/server'

export default buildConfig({
  // …
  plugins: [
    visualEditingPlugin({
      collections: ['pages', 'posts'],
      globals: ['header'],
    }),
  ],
})`,
  },
  {
    label: 'Read drafts',
    lang: 'ts',
    code: `const { isEnabled: draft } = await draftMode()

const page = await payload.findByID({
  collection: 'pages',
  id,
  draft,
  context: draft ? { encodeSourceMaps: true } : {},
})`,
  },
  {
    label: 'layout.tsx',
    lang: 'tsx',
    code: `import { draftMode } from 'next/headers'
import { VisualEditing } from '@derweili/payload-visual-editing-overlay/react'

export default async function Layout({ children }) {
  const { isEnabled: draft } = await draftMode()
  return (
    <html lang="en">
      <body>
        {children}
        {draft && <VisualEditing label="Edit" />}
      </body>
    </html>
  )
}`,
  },
]

export const hoodSnippets: Snippet[] = [
  {
    label: 'Encode',
    lang: 'ts',
    code: `payload.findByID({
  collection: 'pages', id, draft,
  context: { encodeSourceMaps: draft },
})`,
  },
  { label: 'Detect', lang: 'tsx', code: `{draft && <VisualEditing />}` },
  {
    label: 'Focus',
    lang: 'txt',
    code: `/admin/collections/pages/1
  ?field=team.1.name`,
  },
]
