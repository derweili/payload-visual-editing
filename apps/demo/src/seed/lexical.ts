/** Tiny builders for Lexical rich text in seed data. */
const text = (value: string, format = 0) => ({ type: 'text', version: 1, text: value, format, detail: 0, mode: 'normal', style: '' })
const base = { version: 1, direction: 'ltr' as const, format: '' as const, indent: 0 }

export const p = (...parts: (string | { bold: string })[]) => ({
  ...base,
  type: 'paragraph',
  textFormat: 0,
  children: parts.map((part) => (typeof part === 'string' ? text(part) : text(part.bold, 1))),
})
export const h = (tag: 'h2' | 'h3', value: string) => ({ ...base, type: 'heading', tag, children: [text(value)] })
export const ul = (...items: string[]) => ({
  ...base,
  type: 'list',
  listType: 'bullet',
  start: 1,
  tag: 'ul',
  children: items.map((item, i) => ({ ...base, type: 'listitem', value: i + 1, children: [text(item)] })),
})
export const doc = (...children: object[]) => ({ root: { ...base, type: 'root', children } }) as any
