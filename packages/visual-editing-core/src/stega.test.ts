import { vercelStegaCombine } from '@vercel/stega'
import { describe, expect, it } from 'vitest'

import { decodeRef, encodeRef } from './ref.ts'
import {
  hasStega,
  stegaClean,
  stegaDecode,
  stegaDecodeAll,
  stegaEncode,
  stegaSplit,
  stegaSplitParts,
} from './stega.ts'

const ref = encodeRef({ collection: 'pages', id: 'abc', path: 'team.2.name', locale: 'de' })
const globalRef = encodeRef({ global: 'header', path: 'nav.0.label' })

describe('stegaEncode', () => {
  it('appends invisible data and keeps the visible text', () => {
    const encoded = stegaEncode('Jane Doe', ref)
    expect(encoded).not.toBe('Jane Doe')
    expect(encoded.startsWith('Jane Doe')).toBe(true)
    expect(hasStega(encoded)).toBe(true)
  })

  it('handles non-ASCII text and refs', () => {
    const umlautRef = encodeRef({ global: 'über-uns', path: 'größe', locale: 'de' })
    const encoded = stegaEncode('Größe ändern 🚀', umlautRef)
    expect(stegaDecode(encoded)).toEqual(umlautRef)
    expect(stegaClean(encoded)).toBe('Größe ändern 🚀')
  })

  it('returns empty strings unchanged', () => {
    expect(stegaEncode('', ref)).toBe('')
  })

  it('does not encode twice; the first (innermost) ref wins', () => {
    const inner = stegaEncode('Title', globalRef)
    const outer = stegaEncode(inner, ref)
    expect(outer).toBe(inner)
    expect(stegaDecodeAll(outer)).toEqual([globalRef])
  })

  describe('skip', () => {
    it.each([
      'https://example.com',
      'https://example.com/a?b=c#d',
      '/about-us',
      'mailto:info@example.com',
      'tel:+497211234',
      '2026-11-27',
      '2026-11-27T10:00:00Z',
    ])('auto (default) skips URL/date-like "%s"', (value) => {
      expect(stegaEncode(value, ref)).toBe(value)
    })

    it.each([
      'Hinweis: Text',
      'Platzhaltertext: Umbau und Erweiterung eines Bestandsgebäudes.',
      'Leistungen: LPH 1–8',
      'Mehr unter https://example.com',
      '12 Wohnungen',
      'März 2024',
    ])('auto encodes prose "%s", even with a colon, a URL inside or a number', (value) => {
      // @vercel/stega's own "auto" skips "Word: text", because new URL() accepts it
      expect(stegaDecode(stegaEncode(value, ref))).toEqual(ref)
    })

    it('auto encodes plain prose', () => {
      expect(stegaDecode(stegaEncode('Unser Team', ref))).toEqual(ref)
    })

    it('false always encodes', () => {
      expect(stegaDecode(stegaEncode('https://example.com', ref, { skip: false }))).toEqual(ref)
    })

    it('true never encodes', () => {
      expect(stegaEncode('Unser Team', ref, { skip: true })).toBe('Unser Team')
    })
  })
})

describe('stegaDecode / stegaDecodeAll', () => {
  it('decodes the ref', () => {
    expect(stegaDecode(stegaEncode('Jane', ref))).toEqual(ref)
    expect(stegaDecode(stegaEncode('Home', globalRef))).toEqual(globalRef)
  })

  it('returns undefined / [] for plain text', () => {
    expect(stegaDecode('plain')).toBeUndefined()
    expect(stegaDecodeAll('plain')).toEqual([])
  })

  it('finds every ref in concatenated text', () => {
    const text = `${stegaEncode('Jane', ref)} and ${stegaEncode('Home', globalRef)}`
    expect(stegaDecodeAll(text)).toEqual([ref, globalRef])
    expect(stegaDecode(text)).toEqual(ref)
  })

  it('ignores foreign stega payloads', () => {
    const foreign = vercelStegaCombine('Jane', { origin: 'sanity.io', href: '/studio' }, false)
    expect(hasStega(foreign)).toBe(true)
    expect(stegaDecode(foreign)).toBeUndefined()
    expect(stegaDecodeAll(foreign)).toEqual([])
  })

  it('ignores refs of another protocol version', () => {
    const future = vercelStegaCombine('Jane', { ...ref, v: 2 }, false)
    expect(stegaDecode(future)).toBeUndefined()
  })

  it('returns [] for corrupted hidden data instead of throwing', () => {
    const corrupted = '​‌‍​‌‍​‌'
    expect(() => stegaDecodeAll(`x${corrupted}`)).not.toThrow()
    expect(stegaDecodeAll(`x${corrupted}`)).toEqual([])
  })
})

describe('stegaSplit', () => {
  it('splits visible text, hidden data and ref', () => {
    const encoded = stegaEncode('Jane', ref)
    const result = stegaSplit(encoded)
    expect(result.cleaned).toBe('Jane')
    expect(result.encoded).toBe(encoded.slice('Jane'.length))
    expect(result.ref).toEqual(ref)
  })

  it('returns the text unchanged when nothing is hidden', () => {
    expect(stegaSplit('plain')).toEqual({ cleaned: 'plain', encoded: '' })
  })

  it('cleans every hidden run in mixed strings but reports the first', () => {
    const text = `${stegaEncode('Jane', ref)} & ${stegaEncode('Home', globalRef)}`
    const result = stegaSplit(text)
    expect(result.cleaned).toBe('Jane & Home')
    expect(result.ref).toEqual(ref)
  })

  it('returns no ref for foreign data', () => {
    const foreign = vercelStegaCombine('Jane', { origin: 'other' }, false)
    const result = stegaSplit(foreign)
    expect(result.cleaned).toBe('Jane')
    expect(result.encoded).not.toBe('')
    expect(result).not.toHaveProperty('ref')
  })
})

describe('stegaClean', () => {
  it('cleans strings', () => {
    expect(stegaClean(stegaEncode('Jane', ref))).toBe('Jane')
    expect(stegaClean('plain')).toBe('plain')
  })

  it('cleans arrays and plain objects deeply into a copy', () => {
    const input = {
      title: stegaEncode('Home', globalRef),
      team: [{ name: stegaEncode('Jane', ref), age: 30 }],
      nested: { deep: { value: stegaEncode('x y', ref) } },
      nothing: null,
      missing: undefined,
    }
    const result = stegaClean(input)
    expect(result).toEqual({
      title: 'Home',
      team: [{ name: 'Jane', age: 30 }],
      nested: { deep: { value: 'x y' } },
      nothing: null,
      missing: undefined,
    })
    expect(result).not.toBe(input)
    expect(hasStega(input.title)).toBe(true)
  })

  it('leaves non-plain values untouched', () => {
    const date = new Date('2026-01-01')
    const map = new Map([['a', stegaEncode('x y', ref)]])
    expect(stegaClean(date)).toBe(date)
    expect(stegaClean(map)).toBe(map)
    expect(stegaClean(42)).toBe(42)
    expect(stegaClean(undefined)).toBeUndefined()
  })
})

describe('hasStega', () => {
  it('detects hidden data', () => {
    expect(hasStega(stegaEncode('Jane', ref))).toBe(true)
    expect(hasStega('plain')).toBe(false)
  })

  it('is stable across repeated calls (no regex lastIndex state)', () => {
    const encoded = stegaEncode('Jane', ref)
    expect([hasStega(encoded), hasStega(encoded), hasStega(encoded)]).toEqual([true, true, true])
  })

  it('does not treat a single zero-width joiner (emoji sequences) as stega', () => {
    expect(hasStega('👩‍💻')).toBe(false)
  })
})

describe('stegaSplitParts', () => {
  const ref = encodeRef({ global: 'about-us', path: 'partners.0.cv' })
  const text = stegaEncode('2001 Diplom\n  2005 Gründung  \n\n2010 Partner', ref, { skip: false })

  it('gives every part the ref', () => {
    const parts = stegaSplitParts(text, '\n', (line) => line.trim())
    expect(parts.map(stegaClean)).toEqual(['2001 Diplom', '2005 Gründung', '2010 Partner'])
    for (const part of parts) expect(decodeRef(stegaDecode(part)!)).toEqual(decodeRef(ref))
  })

  it('works on plain text and splits by pattern', () => {
    expect(stegaSplitParts('a\n\n\nb\n\nc', /\n{2,}/)).toEqual(['a', 'b', 'c'])
    expect(stegaSplitParts('', '\n')).toEqual([])
  })
})
