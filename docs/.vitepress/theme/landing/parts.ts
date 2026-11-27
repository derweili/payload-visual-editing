import { withBase } from 'vitepress'

export const GITHUB = 'https://github.com/derweili/payload-visual-editing'

/** Internal docs link, respecting VitePress `base`. */
export const docs = (path: string) => withBase(path)
