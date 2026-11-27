'use client'

import {
  buildAdminUrl,
  createReadyMessage,
  decodeRef,
  FIELD_PARAM,
  isFocusMessage,
  isReadyMessage,
} from '@derweili/payload-visual-editing-core'
import {
  useConfig,
  useDocumentInfo,
  useForm,
  useFormInitializing,
  useLivePreviewContext,
  useLocale,
} from '@payloadcms/ui'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'

import { blockTypeOf, runFocusPlan, type FocusApi } from './focus.ts'
import { resolveFocus, type FieldLike } from './resolve-focus.ts'

/** Origin of a window's URL, or null when it can't be read. */
const originOf = (url: string | undefined) => {
  try {
    return url ? new URL(url, window.location.href).origin : null
  } catch {
    return null
  }
}

/**
 * Mounted in every edit view of the plugin's collections and globals (`beforeDocumentControls`).
 * - Deep link: `?field=<path>` focuses that field (`&locale=` is Payload's own locale switch).
 * - Live Preview: answers the overlay's `pve:ready`, and on `pve:focus` focuses the field, or
 *   opens the other document. Only messages from this view's preview iframe/popup are accepted.
 * Renders nothing.
 */
export function VisualEditingAdmin(): null {
  const { config, getEntityConfig } = useConfig()
  const { collectionSlug, globalSlug, id, setDocFieldPreferences } = useDocumentInfo()
  const { getField, dispatchFields } = useForm()
  // Payload renders the fields disabled until the form state has loaded; focus() is ignored then
  const initializing = useFormInitializing()
  const { iframeRef, popupRef } = useLivePreviewContext()
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const adminRoute = config.routes.admin

  const focus = useCallback(
    async (path: string) => {
      const entity = collectionSlug ? getEntityConfig({ collectionSlug }) : getEntityConfig({ globalSlug })
      if (!entity) return false
      const api: FocusApi = { getField, dispatchFields, setDocFieldPreferences } as unknown as FocusApi
      const plan = resolveFocus(entity.fields as unknown as FieldLike[], path, {
        blocksMap: config.blocksMap as unknown as Record<string, { slug: string; fields: FieldLike[] }>,
        getBlockType: (rowPath) => blockTypeOf(api, rowPath),
      })
      return plan ? runFocusPlan(plan, api) : false
    },
    [collectionSlug, globalSlug, getEntityConfig, getField, dispatchFields, setDocFieldPreferences, config.blocksMap],
  )

  // Deep link: once per `?field=` value (not again on every re-render), once the form is ready
  const field = searchParams?.get(FIELD_PARAM)
  const focusedFor = useRef<string | null>(null)
  useEffect(() => {
    if (!field || initializing || focusedFor.current === field) return
    focusedFor.current = field
    void focus(field)
  }, [field, initializing, focus])

  // Live Preview
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const iframe = iframeRef?.current
      const preview = iframe?.contentWindow ?? null
      const popup = popupRef?.current ?? null
      if (!event.source || (event.source !== preview && event.source !== popup)) return
      if (event.source === preview && event.origin !== originOf(iframe?.src)) return

      const source = event.source as Window
      if (isReadyMessage(event.data)) {
        source.postMessage(createReadyMessage(), event.origin)
        return
      }
      if (!isFocusMessage(event.data)) return
      const target = decodeRef(event.data.ref)
      if (!target) return

      const sameDocument =
        'global' in target && target.global
          ? target.global === globalSlug
          : target.collection === collectionSlug && String(target.id) === String(id)
      const sameLocale = !target.locale || target.locale === locale?.code
      if (sameDocument && sameLocale) void focus(target.path)
      else router.push(buildAdminUrl(target, { adminRoute }))
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [iframeRef, popupRef, collectionSlug, globalSlug, id, locale?.code, focus, router, adminRoute])

  return null
}
