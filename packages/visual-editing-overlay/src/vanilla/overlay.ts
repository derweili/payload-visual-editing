import {
  buildAdminUrl,
  createFocusMessage,
  createReadyMessage,
  isReadyMessage,
  type SourceRef,
} from '@derweili/payload-visual-editing-core'

import { findTarget, scanTargets, type Targets } from './scan.ts'

export const OVERLAY_ATTR = 'data-pve-overlay'

export interface OverlayOptions {
  /** Where to look for editable content. Default: `document.body`. */
  root?: Element
  /** Payload's admin route (`config.routes.admin`). Default: "/admin". */
  adminRoute?: string
  /** Origin of the Payload admin, e.g. "https://cms.example.com". Default: the page's own origin. */
  serverURL?: string
  /** Outside the Live Preview iframe: open the admin in a new tab (default) or in this tab. */
  openIn?: 'new-tab' | 'same-tab'
  /** Inside the iframe: how long to wait for the admin's `pve:ready` before opening the link. */
  handshakeTimeout?: number
  /** Text of the edit button. Default: "Edit". */
  label?: string
  /** Outline and button colour. Default: a blue that reads on light and dark pages. */
  color?: string
}

export interface Overlay {
  /** Scans the page again; normally the MutationObserver does this. */
  rescan(): void
  /** Opens the editor for a ref, like a click on the edit button. */
  edit(ref: SourceRef): Promise<void>
  destroy(): void
}

const RESCAN_DELAY = 100
/** Time to move the pointer from the content to the edit button before the button hides. */
const HIDE_DELAY = 400
/** Gap between the outline and the content, and between the button and the viewport edge. */
const PAD = 4
const RADIUS = '3px'

/**
 * Outlines editable content on hover and shows an edit button.
 * - Standalone: the button opens the admin's deep link.
 * - Inside the admin's Live Preview iframe: it sends `pve:focus` to the parent. Without a
 *   `pve:ready` from the admin within `handshakeTimeout`, it falls back to the deep link.
 * Alt/Option-click on editable content does the same as the button.
 */
export function createOverlay(options: OverlayOptions = {}): Overlay {
  const document = options.root?.ownerDocument ?? globalThis.document
  const window = document.defaultView!
  const root = options.root ?? document.body
  const adminOrigin = new URL(options.serverURL ?? window.location.origin).origin
  const handshakeTimeout = options.handshakeTimeout ?? 500
  const inIframe = window.parent !== window

  // --- UI: one fixed layer that never takes pointer events except on the button
  const layer = document.createElement('div')
  layer.setAttribute(OVERLAY_ATTR, '')
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;'
  const color = options.color ?? '#2563eb'
  const outline = document.createElement('div')
  outline.style.cssText = `position:fixed;display:none;box-sizing:border-box;border:2px solid ${color};border-radius:${RADIUS};`
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = options.label ?? 'Edit'
  button.style.cssText =
    `position:fixed;display:none;pointer-events:auto;margin:0;padding:2px 8px;border:0;` +
    `background:${color};color:#fff;font:600 12px/1.5 system-ui,sans-serif;cursor:pointer;`
  // appendChild, not append: in apps with Cloudflare's worker types, `Element.append` is HTMLRewriter's
  layer.appendChild(outline)
  layer.appendChild(button)
  document.body.appendChild(layer)

  // --- State
  let targets: Targets = new Map()
  let current: { element: Element; ref: SourceRef } | null = null
  let rescanTimer: ReturnType<typeof setTimeout> | undefined
  let hideTimer: ReturnType<typeof setTimeout> | undefined
  let frame = 0

  const place = () => {
    frame = 0
    if (!current) return
    const rect = current.element.getBoundingClientRect()
    const box = {
      top: rect.top - PAD,
      left: rect.left - PAD,
      right: rect.right + PAD,
      bottom: rect.bottom + PAD,
    }
    Object.assign(outline.style, {
      display: 'block',
      top: `${box.top}px`,
      left: `${box.left}px`,
      width: `${box.right - box.left}px`,
      height: `${box.bottom - box.top}px`,
    })
    // Visible before measuring: a hidden button measures 0 × 0
    button.style.display = 'block'
    const { offsetWidth: width, offsetHeight: height } = button
    const viewportWidth = document.documentElement.clientWidth || window.innerWidth
    // Flush on the outline's top-right corner, so the pointer reaches it without leaving the
    // outline; inside the outline's top edge when there is no room above. Always in the viewport.
    const top = box.top >= height ? box.top - height : box.top
    const left = Math.min(Math.max(PAD, box.right - width), Math.max(PAD, viewportWidth - width - PAD))
    // Seamless joint: no rounding where the button meets the outline
    const above = top < box.top
    const onCorner = left === box.right - width
    Object.assign(button.style, {
      top: `${top}px`,
      left: `${left}px`,
      borderRadius: above ? `${RADIUS} ${RADIUS} 0 0` : `0 0 0 ${RADIUS}`,
    })
    outline.style.borderTopRightRadius = onCorner ? '0' : RADIUS
  }
  const schedulePlace = () => {
    if (current && !frame) frame = window.requestAnimationFrame(place)
  }

  const show = (target: { element: Element; ref: SourceRef } | null) => {
    clearTimeout(hideTimer)
    hideTimer = undefined
    current = target
    if (!target) {
      outline.style.display = 'none'
      button.style.display = 'none'
      return
    }
    place()
  }

  const rescan = () => {
    rescanTimer = undefined
    targets = scanTargets(root, layer)
    if (current && !targets.has(current.element)) show(null)
  }

  // --- Opening the editor
  let ready = false
  const readyWaiters = new Set<(ready: boolean) => void>()

  const onMessage = (event: MessageEvent) => {
    if (event.source !== window.parent || event.origin !== adminOrigin) return
    if (!isReadyMessage(event.data)) return
    ready = true
    for (const resolve of readyWaiters) resolve(true)
    readyWaiters.clear()
  }

  const ping = () => window.parent.postMessage(createReadyMessage(), adminOrigin)

  const waitForReady = () =>
    new Promise<boolean>((resolve) => {
      if (ready) return resolve(true)
      readyWaiters.add(resolve)
      setTimeout(() => {
        readyWaiters.delete(resolve)
        resolve(ready)
      }, handshakeTimeout)
      ping()
    })

  const openLink = (ref: SourceRef) => {
    const url = buildAdminUrl(ref, { adminRoute: options.adminRoute, serverURL: adminOrigin })
    // In the iframe the fallback always opens a tab: navigating the iframe would show the admin in it
    if (inIframe || options.openIn !== 'same-tab') window.open(url, '_blank', 'noopener')
    else window.location.assign(url)
  }

  const edit = async (ref: SourceRef) => {
    if (inIframe && (await waitForReady())) {
      window.parent.postMessage(createFocusMessage(ref), adminOrigin)
      return
    }
    openLink(ref)
  }

  // --- Events
  const onPointerOver = (event: Event) => {
    const node = event.target as Node | null
    if (node && layer.contains(node)) {
      // On the edit button: keep the current target
      clearTimeout(hideTimer)
      hideTimer = undefined
      return
    }
    const target = findTarget(node, targets)
    if (target) {
      if (target.element !== current?.element) show(target)
      else clearTimeout(hideTimer)
      return
    }
    // Off editable content: hide a moment later, so the pointer can still reach the button
    if (current) {
      clearTimeout(hideTimer)
      hideTimer = setTimeout(() => show(null), HIDE_DELAY)
    }
  }

  const onButtonClick = (event: Event) => {
    event.preventDefault()
    event.stopPropagation()
    if (current) void edit(current.ref)
  }

  const onClick = (event: MouseEvent) => {
    if (!event.altKey) return
    const target = findTarget(event.target as Node | null, targets)
    if (!target) return
    // Alt-click on a link would otherwise download it
    event.preventDefault()
    event.stopPropagation()
    void edit(target.ref)
  }

  const observer = new window.MutationObserver((mutations) => {
    if (mutations.every((mutation) => layer.contains(mutation.target))) return
    rescanTimer ??= setTimeout(rescan, RESCAN_DELAY)
  })

  document.addEventListener('pointerover', onPointerOver)
  document.addEventListener('click', onClick, true)
  button.addEventListener('click', onButtonClick)
  window.addEventListener('scroll', schedulePlace, { capture: true, passive: true })
  window.addEventListener('resize', schedulePlace)
  window.addEventListener('message', onMessage)
  observer.observe(root, { subtree: true, childList: true, characterData: true, attributes: true })
  rescan()
  if (inIframe) ping()

  return {
    rescan,
    edit,
    destroy() {
      observer.disconnect()
      clearTimeout(rescanTimer)
      clearTimeout(hideTimer)
      if (frame) window.cancelAnimationFrame(frame)
      document.removeEventListener('pointerover', onPointerOver)
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('scroll', schedulePlace, { capture: true })
      window.removeEventListener('resize', schedulePlace)
      window.removeEventListener('message', onMessage)
      for (const resolve of readyWaiters) resolve(false)
      readyWaiters.clear()
      layer.remove()
    },
  }
}
