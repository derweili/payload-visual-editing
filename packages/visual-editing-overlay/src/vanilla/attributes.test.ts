import { decodeRef } from '@derweili/payload-visual-editing-core'
import { describe, expect, it } from 'vitest'

import { fieldAttrs, readFieldAttrs } from './attributes.ts'

const element = (attrs: Record<string, string>) => {
  const el = document.createElement('img')
  for (const [name, value] of Object.entries(attrs)) el.setAttribute(name, value)
  return el
}

describe('fieldAttrs', () => {
  it('is empty without a source (outside Draft Mode)', () => {
    expect(fieldAttrs(null)).toEqual({})
    expect(fieldAttrs(undefined)).toEqual({})
  })

  it('marks a collection document field', () => {
    expect(fieldAttrs({ collection: 'projects', id: 7, path: 'gallery.0.image' })).toEqual({
      'data-pve-doc': 'collections/projects/7',
      'data-pve-path': 'gallery.0.image',
    })
  })

  it('marks a global field, with a locale', () => {
    expect(fieldAttrs({ global: 'homepage', path: 'hero.image', locale: 'en' })).toEqual({
      'data-pve-doc': 'globals/homepage',
      'data-pve-path': 'hero.image',
      'data-pve-locale': 'en',
    })
  })
})

describe('readFieldAttrs', () => {
  it('round-trips fieldAttrs', () => {
    const source = { collection: 'projects', id: 7, path: 'cover', locale: 'de' }
    expect(decodeRef(readFieldAttrs(element(fieldAttrs(source) as Record<string, string>))!)).toEqual({
      ...source,
      id: '7',
    })
    const global = { global: 'homepage', path: 'hero.image' }
    expect(decodeRef(readFieldAttrs(element(fieldAttrs(global) as Record<string, string>))!)).toEqual(global)
  })

  it('ignores missing or malformed attributes', () => {
    expect(readFieldAttrs(element({}))).toBeNull()
    expect(readFieldAttrs(element({ 'data-pve-doc': 'globals/homepage' }))).toBeNull()
    expect(readFieldAttrs(element({ 'data-pve-doc': 'collections/projects', 'data-pve-path': 'x' }))).toBeNull()
    expect(readFieldAttrs(element({ 'data-pve-doc': 'pages/1', 'data-pve-path': 'x' }))).toBeNull()
  })
})
