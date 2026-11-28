import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'

import { OVERLAY_ATTR } from '../vanilla/index.ts'
import { VisualEditing } from '.'

// React only checks act() usage when this is set
;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const layers = () => document.querySelectorAll(`[${OVERLAY_ATTR}]`)

afterEach(() => {
  document.body.innerHTML = ''
})

describe('<VisualEditing />', () => {
  it('mounts one overlay, recreates it on new options and removes it on unmount', async () => {
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () => root.render(<VisualEditing label="Bearbeiten" serverURL="http://localhost:3000" />))
    expect(layers()).toHaveLength(1)
    expect(layers()[0]!.querySelector('button')!.textContent).toBe('Bearbeiten')

    await act(async () => root.render(<VisualEditing label="Edit" serverURL="http://localhost:3000" />))
    expect(layers()).toHaveLength(1)
    expect(layers()[0]!.querySelector('button')!.textContent).toBe('Edit')

    await act(async () => root.unmount())
    expect(layers()).toHaveLength(0)
  })

  it('passes color and textColor to the overlay', async () => {
    const container = document.createElement('div')
    document.body.append(container)
    const root = createRoot(container)

    await act(async () =>
      root.render(<VisualEditing color="#7c3aed" textColor="#111827" serverURL="http://localhost:3000" />),
    )
    const button = layers()[0]!.querySelector('button')!
    expect(button.style.backgroundColor).toBe('rgb(124, 58, 237)')
    expect(button.style.color).toBe('rgb(17, 24, 39)')

    await act(async () => root.unmount())
  })
})
