import { stegaClean } from '@derweili/payload-visual-editing-core'
import type {
  CollectionAfterReadHook,
  CollectionBeforeOperationHook,
  CollectionBeforeValidateHook,
  FlattenedBlock,
  FlattenedField,
  GlobalAfterReadHook,
  GlobalBeforeOperationHook,
  GlobalBeforeValidateHook,
  PayloadRequest,
} from 'payload'

import { encodeDocument, type EncodeTarget } from './encode-document.ts'
import { ENCODE_CONTEXT_KEY, ENCODE_QUERY_PARAM, type ResolvedSourceMapOptions } from './options.ts'
import { createPathMatcher } from './path-matcher.ts'

/** True when this request asked for source maps (Local API context or an allowed REST request). */
export const shouldEncode = (req: PayloadRequest): boolean => req.context?.[ENCODE_CONTEXT_KEY] === true

/**
 * REST: moves `?encodeSourceMaps=true` into `req.context` for GET reads, if `canEncode`
 * allows it. Populated relationships share the request, so they see the flag too.
 */
async function applyQueryFlag(req: PayloadRequest, operation: string, options: ResolvedSourceMapOptions) {
  // Only plain REST reads. A write (PATCH, POST, …) reads the document again on the same request,
  // which would otherwise encode the response of the write.
  if (operation !== 'read' || req.method !== 'GET') return
  if (req.query?.[ENCODE_QUERY_PARAM] !== 'true') return
  if (!(await options.canEncode({ req }))) return
  req.context[ENCODE_CONTEXT_KEY] = true
}

export function createHooks(options: ResolvedSourceMapOptions) {
  const isIncluded = options.include ? createPathMatcher(options.include) : () => true
  const isExcluded = createPathMatcher(options.exclude)
  const shouldEncodePath = (path: string) => isIncluded(path) && !isExcluded(path)

  const encode = (req: PayloadRequest, fields: FlattenedField[], data: Record<string, unknown>, target: EncodeTarget) => {
    const localization = req.payload.config.localization
    encodeDocument({
      fields,
      data,
      target,
      locale: req.locale ?? undefined,
      locales: localization ? localization.localeCodes : null,
      skip: options.skip,
      shouldEncodePath,
      // Generic lookup: an app's generated types narrow `blocks` to its own block slugs
      resolveBlock: (slug) => (req.payload.blocks as Record<string, FlattenedBlock | undefined>)[slug],
    })
  }

  const collectionBeforeOperation: CollectionBeforeOperationHook = async ({ args, operation, req }) => {
    await applyQueryFlag(req, operation, options)
    return args
  }

  const globalBeforeOperation: GlobalBeforeOperationHook = async ({ args, operation, req }) => {
    await applyQueryFlag(req, operation, options)
    return args
  }

  const collectionAfterRead: CollectionAfterReadHook = ({ collection, doc, req }) => {
    if (!shouldEncode(req) || !doc) return doc
    encode(req, collection.flattenedFields, doc, { collection: collection.slug, id: doc.id })
    return doc
  }

  const globalAfterRead: GlobalAfterReadHook = ({ doc, global, req }) => {
    if (!shouldEncode(req) || !doc) return doc
    encode(req, global.flattenedFields, doc, { global: global.slug })
    return doc
  }

  /**
   * Encoded text must never be saved: e.g. an editor copies text from the preview into the admin,
   * or a hook writes back a document it read with the flag on.
   */
  const collectionBeforeValidate: CollectionBeforeValidateHook = ({ data }) => (data ? stegaClean(data) : data)
  const globalBeforeValidate: GlobalBeforeValidateHook = ({ data }) => (data ? stegaClean(data) : data)

  return {
    collection: {
      beforeOperation: collectionBeforeOperation,
      beforeValidate: collectionBeforeValidate,
      afterRead: collectionAfterRead,
    },
    global: {
      beforeOperation: globalBeforeOperation,
      beforeValidate: globalBeforeValidate,
      afterRead: globalAfterRead,
    },
  }
}
