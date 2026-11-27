import { decodeRef, encodeRef, stegaEncode } from '@derweili/payload-visual-editing-core'
import { beforeEach, describe, expect, it } from 'vitest'

import { fieldAttrs } from './attributes.ts'
import { findTarget, scanTargets } from './scan.ts'

const title = stegaEncode('Wohnhaus', encodeRef({ collection: 'projects', id: 1, path: 'title' }), { skip: false })
const claim = stegaEncode('Planung', encodeRef({ global: 'homepage', path: 'hero.claim' }), { skip: false })

const html = (markup: string) => {
  document.body.innerHTML = markup
  return document.body
}
const at = (selector: string) => document.querySelector(selector)!
const path = (ref: unknown) => decodeRef(ref as never)?.path

beforeEach(() => {
  document.body.innerHTML = ''
})

describe('scanTargets', () => {
  it('finds the parent element of each encoded text node', () => {
    const root = html(`<h1>${title}</h1><p>plain</p><a href="/x"><span>${claim}</span></a>`)
    const targets = scanTargets(root)
    expect([...targets.keys()]).toEqual([at('h1'), at('span')])
    expect(path(targets.get(at('h1')))).toBe('title')
    expect(path(targets.get(at('span')))).toBe('hero.claim')
  })

  it('keeps the first ref when one element holds several encoded strings', () => {
    const root = html(`<p>${title} · ${claim}</p>`)
    root.querySelector('p')!.append(document.createTextNode(claim))
    expect(path(scanTargets(root).get(at('p')))).toBe('title')
  })

  it('finds marked elements; marks win over text on the same element', () => {
    const attrs = (source: Parameters<typeof fieldAttrs>[0]) =>
      Object.entries(fieldAttrs(source))
        .map(([name, value]) => `${name}="${value}"`)
        .join(' ')
    const root = html(
      `<img ${attrs({ collection: 'projects', id: 1, path: 'cover' })}>` +
        `<p ${attrs({ global: 'homepage', path: 'figures.0.value' })}>${claim}</p>`,
    )
    const targets = scanTargets(root)
    expect(path(targets.get(at('img')))).toBe('cover')
    expect(path(targets.get(at('p')))).toBe('figures.0.value')
  })

  it('skips the ignored subtree, scripts and styles', () => {
    const root = html(
      `<div id="ui"><b>${title}</b></div><script>"${title}"</script><style>/*${title}*/</style><i>${title}</i>`,
    )
    expect([...scanTargets(root, at('#ui')).keys()]).toEqual([at('i')])
  })
})

describe('findTarget', () => {
  it('returns the innermost editable element at or above the node', () => {
    const root = html(`<article ${'data-pve-doc="collections/projects/1" data-pve-path="cover"'}><h2>${title}</h2><p>x</p></article>`)
    const targets = scanTargets(root)
    expect(findTarget(at('h2').firstChild, targets)?.element).toBe(at('h2'))
    expect(findTarget(at('p'), targets)?.element).toBe(at('article'))
    expect(findTarget(document.body, targets)).toBeNull()
    expect(findTarget(null, targets)).toBeNull()
  })
})
