import { VisualEditing } from '@derweili/payload-visual-editing-overlay/react'
import { draftMode } from 'next/headers'

import { DraftModeBanner } from './draft-mode-banner'
import { LivePreviewRefresh } from './live-preview-refresh'

/**
 * Everything visual editing needs on the frontend, mounted only in Draft Mode:
 * the overlay (hover outline + "Edit" button), Live Preview refreshes and the draft banner.
 */
export async function DraftTools() {
  const { isEnabled } = await draftMode()
  if (!isEnabled) return null
  return (
    <>
      <VisualEditing label="Edit" color="#4f46e5" />
      <LivePreviewRefresh />
      <DraftModeBanner />
    </>
  )
}
