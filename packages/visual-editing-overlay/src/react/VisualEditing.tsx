'use client'

import { useEffect } from 'react'

import { createOverlay, type OverlayOptions } from '../vanilla/overlay.ts'

export type VisualEditingProps = Omit<OverlayOptions, 'root'>

/**
 * Mount in Draft Mode only, e.g. in the root layout:
 * `{draft && <VisualEditing label="Bearbeiten" />}`. Renders nothing itself.
 */
export function VisualEditing({ adminRoute, serverURL, openIn, handshakeTimeout, label, color }: VisualEditingProps): null {
  useEffect(() => {
    const overlay = createOverlay({ adminRoute, serverURL, openIn, handshakeTimeout, label, color })
    return () => overlay.destroy()
  }, [adminRoute, serverURL, openIn, handshakeTimeout, label, color])
  return null
}
