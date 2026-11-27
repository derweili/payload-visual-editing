import { describe, expect, it } from 'vitest'

describe('entry points', () => {
  it('vanilla: overlay, attributes and stegaClean', async () => {
    const vanilla = await import('./vanilla/index.ts')
    expect(vanilla.stegaClean('plain')).toBe('plain')
    expect(typeof vanilla.createOverlay).toBe('function')
    expect(vanilla.fieldAttrs(null)).toEqual({})
  })

  it('react: the component plus the helpers for client components', async () => {
    const react = await import('./react/index.ts')
    expect(typeof react.VisualEditing).toBe('function')
    expect(react.stegaClean('plain')).toBe('plain')
    expect(react.fieldAttrs(null)).toEqual({})
  })
})
