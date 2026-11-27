import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

/**
 * On-demand revalidation: the published site is static, and any published change rebuilds it.
 * Revalidating the whole layout keeps this demo simple: header, footer, featured projects and
 * links between documents can all change with one edit.
 *
 * Draft saves (autosave in the Live Preview) don't revalidate; Draft Mode renders dynamically.
 * Scripts outside Next (seed, migrations) pass `context.disableRevalidate`.
 */
function revalidateSite(context: Record<string, unknown>) {
  if (context.disableRevalidate) return
  try {
    revalidatePath('/', 'layout')
  } catch {
    // Outside a Next request (e.g. `payload run`): nothing to revalidate
  }
}

const isPublished = (doc: unknown) => (doc as { _status?: string } | undefined)?._status !== 'draft'

export const revalidateAfterChange: CollectionAfterChangeHook = ({ doc, previousDoc, req }) => {
  // Publishing, updating a published doc, or unpublishing
  if (isPublished(doc) || isPublished(previousDoc)) revalidateSite(req.context)
  return doc
}

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, req }) => {
  revalidateSite(req.context)
  return doc
}

export const revalidateGlobal: GlobalAfterChangeHook = ({ doc, req }) => {
  revalidateSite(req.context)
  return doc
}
