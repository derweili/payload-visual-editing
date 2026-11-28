/**
 * The ONLY module that knows Payload's admin markup (ADR 0001, M3). Everything else goes through
 * Payload's public API. Every function fails silently: when Payload's markup changes, focusing
 * stops working, but nothing throws and the document still opens.
 *
 * test/payload-markup.test.ts checks that the installed @payloadcms/ui still renders these.
 */

import { keepInView } from './keep-in-view.ts'

/** Field inputs/wrappers: `id="field-<path with . replaced by __>"` (Payload uses it for label links). */
export const fieldElementId = (path: string) => `field-${path.replace(/\./g, '__')}`
/** The Lexical rich text field marks its wrapper with the path instead. */
export const FIELD_PATH_ATTR = 'data-field-path'
/** Wrapper of every field (label, input, description): what gets highlighted. */
export const FIELD_CLASS = 'field-type'

/** The rendered element of the field at `path`, or null. */
export function findFieldElement(path: string, root: Element = document.body): Element | null {
  const byId = root.ownerDocument.getElementById(fieldElementId(path))
  if (byId && root.contains(byId)) return byId
  // Compare the attribute instead of building a selector from the path
  for (const element of root.querySelectorAll(`[${FIELD_PATH_ATTR}]`)) {
    if (element.getAttribute(FIELD_PATH_ATTR) === path) return element
  }
  return null
}

/** Tabs field container and its tab buttons. No public API switches a tab after mount. */
export const TABS_CLASS = 'tabs-field'
export const TAB_BUTTON_CLASS = 'tabs-field__tab-button'
export const TAB_BUTTON_ACTIVE_CLASS = 'tabs-field__tab-button--active'
/** Array and blocks fields: tabs inside their rows are out of scope. */
export const ROW_CONTAINER_CLASSES = ['array-field', 'blocks-field']

/** How long to wait for Payload to render a tab or row before giving up. */
const RENDER_TIMEOUT = 3000

/**
 * Tabs fields directly in `scope`, in render order: not inside another tabs field or an
 * array/blocks row within the scope.
 */
export function tabsInScope(scope: Element): Element[] {
  const nested = [TABS_CLASS, ...ROW_CONTAINER_CLASSES].map((name) => `.${name}`).join(',')
  return [...scope.querySelectorAll(`.${TABS_CLASS}`)].filter((tabs) => {
    const outer = tabs.parentElement?.closest(nested)
    return !outer || outer === scope || !scope.contains(outer)
  })
}

/**
 * Opens tab `index` of the `ordinal`-th tabs field in `scope` by clicking its button, as an editor
 * would: Payload's own handler switches the tab and saves the preference.
 * Returns the tabs field (the scope for nested tabs), or null when it can't be found.
 */
export function selectTab(scope: Element, ordinal: number, index: number): Element | null {
  const tabs = tabsInScope(scope)[ordinal]
  if (!tabs) return null
  const buttons = [...tabs.querySelectorAll(`.${TAB_BUTTON_CLASS}`)].filter(
    (button) => button.closest(`.${TABS_CLASS}`) === tabs,
  )
  const button = buttons[index]
  if (!(button instanceof HTMLElement)) return null
  if (!button.classList.contains(TAB_BUTTON_ACTIVE_CLASS)) button.click()
  return tabs
}

/**
 * Resolves once `find()` returns an element: right away, or when Payload has rendered it.
 * Waits for a DOM change, not for a fixed time; null after `timeout`.
 */
export function waitForElement(
  find: () => Element | null,
  root: Node = document.body,
  timeout = RENDER_TIMEOUT,
): Promise<Element | null> {
  const found = find()
  if (found) return Promise.resolve(found)
  return new Promise((resolve) => {
    const done = (element: Element | null) => {
      observer.disconnect()
      clearTimeout(timer)
      resolve(element)
    }
    const observer = new MutationObserver(() => {
      const element = find()
      if (element) done(element)
    })
    const timer = setTimeout(() => done(null), timeout)
    observer.observe(root, { childList: true, subtree: true, attributes: true })
  })
}

/** How long one reveal step waits for Payload to render (a ceiling: it resolves on the DOM change). */
const STEP_WAIT = 300

export interface RevealOptions {
  root?: Element
  /** Field paths that contain the element, deepest first: scrolled to before searching. */
  ancestors?: string[]
  timeout?: number
}

/**
 * Like `waitForElement`, for elements Payload hasn't rendered because they are far below the
 * viewport (it renders each list of fields only within 1000 px of it). Decided with the user:
 * 1. scroll the nearest rendered ancestor field into view and look again (deeper ancestors may
 *    appear on the way); 2. then scroll down one screen at a time until it appears or the page ends.
 * Each step waits for a DOM change, up to STEP_WAIT; the whole search ends after `timeout`.
 * Fields above the viewport are always rendered, so the search only goes down.
 */
export async function revealElement(
  find: () => Element | null,
  { root = document.body, ancestors = [], timeout = RENDER_TIMEOUT }: RevealOptions = {},
): Promise<Element | null> {
  const deadline = Date.now() + timeout
  const step = () => waitForElement(find, root, Math.max(0, Math.min(STEP_WAIT, deadline - Date.now())))
  // Rendering may simply be in progress (a tab just opened, a row just expanded)
  let found = await step()
  if (found) return found

  let scrolledTo: Element | null = null
  while (Date.now() < deadline) {
    const ancestor = ancestors.map((path) => findFieldElement(path, root)).find(Boolean) ?? null
    if (!ancestor || ancestor === scrolledTo) break
    scrolledTo = ancestor
    ancestor.scrollIntoView?.({ block: 'start' })
    if ((found = await step())) return found
  }

  const view = root.ownerDocument.defaultView
  const scroller = root.ownerDocument.scrollingElement
  while (view && scroller && Date.now() < deadline) {
    const before = scroller.scrollTop
    view.scrollBy(0, view.innerHeight)
    if (scroller.scrollTop === before) break // end of the page
    if ((found = await step())) return found
  }
  return waitForElement(find, root, Math.max(0, deadline - Date.now()))
}

/** `a.b.c` → `['a.b', 'a']` */
export const ancestorPaths = (path: string) =>
  path
    .split('.')
    .slice(0, -1)
    .map((_, i, parts) => parts.slice(0, parts.length - i).join('.'))

/** What to focus in a field: where the editor types first, else a control (e.g. an upload's edit button). */
const INPUTS = 'input:not([type=hidden]), textarea, select, [contenteditable=true]'

/** The element to focus for a field: the field itself if it is an input, else an input or control
 * inside it, else in its wrapper (upload fields render their buttons next to the id element). */
/**
 * False while the element or an ancestor is `display: none`. A row collapsed during the session
 * keeps its fields in the DOM, hidden, and a hidden input can't take focus.
 */
export function isRendered(element: Element): boolean {
  const view = element.ownerDocument.defaultView
  for (let node: Element | null = element; node; node = node.parentElement) {
    if (view?.getComputedStyle(node).display === 'none') return false
  }
  return true
}

function focusTarget(element: Element, wrapper: Element): HTMLElement | null {
  // In this order: an input, a button (e.g. an upload's edit button), a link
  for (const selector of [INPUTS, 'button:not([disabled])', 'a[href]']) {
    if (element.matches(selector)) return element as HTMLElement
    const found = element.querySelector(selector) ?? wrapper.querySelector(selector)
    if (found instanceof HTMLElement) return found
  }
  return null
}

/**
 * Scrolls the field to the window's centre, focuses its input, keeps it centred while lazy-loaded
 * content still changes the layout (see keep-in-view.ts), then highlights it briefly. The
 * highlight waits until the page stopped moving, so it doesn't slide across the screen.
 */
export function focusFieldElement(element: Element, highlightColor = '#168b49'): void {
  element.scrollIntoView?.({ block: 'center', behavior: 'smooth' })
  const wrapper = element.closest(`.${FIELD_CLASS}`) ?? element
  const target = focusTarget(element, wrapper)
  if (target) target.focus({ preventScroll: true })
  else {
    // Some fields render their controls later (an upload loads its file details first). Focus them
    // when they appear, unless the editor has moved the focus in the meantime (focus is still where
    // it was now: the page, or the Live Preview iframe that was clicked).
    const before = element.ownerDocument.activeElement
    void waitForElement(() => focusTarget(element, wrapper), wrapper).then((late) => {
      if (late instanceof HTMLElement && element.ownerDocument.activeElement === before) {
        late.focus({ preventScroll: true })
      }
    })
  }
  keepInView(element, {
    onDone: () =>
      wrapper.animate?.(
        [{ boxShadow: `0 0 0 3px ${highlightColor}` }, { boxShadow: `0 0 0 3px ${highlightColor}` }, { boxShadow: 'none' }],
        { duration: 1600, easing: 'ease-out' },
      ),
  })
}
