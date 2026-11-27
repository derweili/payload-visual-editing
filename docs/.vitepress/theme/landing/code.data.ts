/**
 * VitePress data loader: highlights the landing page snippets with Shiki at build time,
 * so the page ships coloured tokens and no highlighter.
 */
import { codeToTokens } from 'shiki'
import { defineLoader } from 'vitepress'
import { hoodSnippets, setupTabs, type Snippet } from './snippets'

/** One line = a list of [text, colour]. */
export type Line = Array<[string, string | undefined]>
export interface Highlighted {
  setup: Line[][]
  hood: Line[][]
}

declare const data: Highlighted
export { data }

// Vesper: warm, low-contrast theme with peach/orange accents, close to the landing palette.
const THEME = 'vesper'

const highlight = async ({ code, lang }: Snippet): Promise<Line[]> => {
  const { tokens } = await codeToTokens(code, { lang, theme: THEME })
  return tokens.map((line) => line.map((t) => [t.content, t.color] as [string, string | undefined]))
}

export default defineLoader({
  async load(): Promise<Highlighted> {
    return {
      setup: await Promise.all(setupTabs.map(highlight)),
      hood: await Promise.all(hoodSnippets.map(highlight)),
    }
  },
})
