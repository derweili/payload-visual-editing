import { hasStega, stegaDecode, type SourceRef } from '@derweili/payload-visual-editing-core'

import { DOC_ATTR, readFieldAttrs } from './attributes.ts'

export type Targets = Map<Element, SourceRef>

/**
 * Finds every editable element below `root`:
 * - the parent element of each text node that carries a ref (the first ref wins per element)
 * - every element marked with `fieldAttrs()` (these win over text refs on the same element)
 * Elements inside `ignore` (the overlay's own UI) are skipped.
 */
export function scanTargets(root: Element, ignore?: Element | null): Targets {
  const targets: Targets = new Map()
  const document = root.ownerDocument

  const walker = document.createTreeWalker(root, 0x4 /* NodeFilter.SHOW_TEXT */)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.nodeValue
    const element = node.parentElement
    if (!text || !element || targets.has(element) || !hasStega(text)) continue
    if (ignore?.contains(element)) continue
    if (element.closest('script, style, noscript, template')) continue
    const ref = stegaDecode(text)
    if (ref) targets.set(element, ref)
  }

  const marked = [...(root.matches(`[${DOC_ATTR}]`) ? [root] : []), ...root.querySelectorAll(`[${DOC_ATTR}]`)]
  for (const element of marked) {
    if (ignore?.contains(element)) continue
    const ref = readFieldAttrs(element)
    if (ref) targets.set(element, ref)
  }
  return targets
}

/** The innermost editable element at or above `node`, or null. */
export function findTarget(node: Node | null, targets: Targets): { element: Element; ref: SourceRef } | null {
  for (let current: Node | null = node; current; current = current.parentNode) {
    if (current.nodeType !== 1) continue
    const ref = targets.get(current as Element)
    if (ref) return { element: current as Element, ref }
  }
  return null
}
