import { encodeRef, type SourceLocation, type SourceRef } from '@derweili/payload-visual-editing-core'

/**
 * Marks an element that can't carry stega text (image, number, link target) as editable.
 * Namespaced so they can't clash with other libraries' `data-*` attributes.
 */
export const DOC_ATTR = 'data-pve-doc'
export const PATH_ATTR = 'data-pve-path'
export const LOCALE_ATTR = 'data-pve-locale'

export type FieldAttrs = Partial<Record<typeof DOC_ATTR | typeof PATH_ATTR | typeof LOCALE_ATTR, string>>

/**
 * Attributes to spread onto an element: `<img {...fieldAttrs(source)} />`.
 * Returns `{}` without a source, so callers pass one only in Draft Mode:
 * `fieldAttrs(draft ? { collection: 'projects', id, path: 'cover' } : null)`.
 *
 * `data-pve-doc` is `collections/<slug>/<id>` or `globals/<slug>`, as in the admin URL.
 */
export function fieldAttrs(source: SourceLocation | null | undefined): FieldAttrs {
  if (!source) return {}
  const doc =
    'global' in source && source.global
      ? `globals/${source.global}`
      : `collections/${source.collection}/${source.id}`
  return {
    [DOC_ATTR]: doc,
    [PATH_ATTR]: source.path,
    ...(source.locale ? { [LOCALE_ATTR]: source.locale } : {}),
  }
}

/** Reads the attributes back into a ref; null when the element isn't (validly) marked. */
export function readFieldAttrs(element: Element): SourceRef | null {
  const doc = element.getAttribute(DOC_ATTR)
  const path = element.getAttribute(PATH_ATTR)
  if (!doc || path === null) return null
  const locale = element.getAttribute(LOCALE_ATTR) || undefined

  const [kind, slug, ...rest] = doc.split('/')
  if (kind === 'globals' && slug && rest.length === 0) {
    return encodeRef({ global: slug, path, ...(locale ? { locale } : {}) })
  }
  if (kind === 'collections' && slug && rest.length === 1 && rest[0]) {
    // Ids come back as strings; numeric ids are fine in admin URLs either way
    return encodeRef({ collection: slug, id: rest[0], path, ...(locale ? { locale } : {}) })
  }
  return null
}
