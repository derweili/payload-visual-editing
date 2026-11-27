import { decodeRef, type SourceLocation } from './ref.ts'
import type { SourceRef } from './protocol.ts'

export interface BuildAdminUrlOptions {
  /** Payload's admin route (`config.routes.admin`). Default: "/admin". */
  adminRoute?: string
  /** Prefix for an absolute URL, e.g. "https://cms.example.com". Default: relative URL. */
  serverURL?: string
}

export const FIELD_PARAM = 'field'
export const LOCALE_PARAM = 'locale'

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '')

/**
 * Deep link into the admin edit view:
 * `/admin/collections/{c}/{id}?field={p}` or `/admin/globals/{g}?field={p}`, plus `&locale=`.
 */
export function buildAdminUrl(
  target: SourceLocation | SourceRef,
  options: BuildAdminUrlOptions = {},
): string {
  const location = 'o' in target ? decodeRef(target) : target
  if (!location) throw new TypeError('buildAdminUrl: invalid source ref')

  const adminRoute = trimSlashes(options.adminRoute ?? '/admin')
  const documentPath =
    'global' in location && location.global
      ? ['globals', location.global]
      : ['collections', location.collection as string, String(location.id)]

  const pathname =
    '/' + [adminRoute, ...documentPath.map(encodeURIComponent)].filter(Boolean).join('/')

  const params = new URLSearchParams()
  if (location.path) params.set(FIELD_PARAM, location.path)
  if (location.locale) params.set(LOCALE_PARAM, location.locale)
  const query = params.toString()

  const serverURL = options.serverURL ? options.serverURL.replace(/\/+$/, '') : ''
  return `${serverURL}${pathname}${query ? `?${query}` : ''}`
}
