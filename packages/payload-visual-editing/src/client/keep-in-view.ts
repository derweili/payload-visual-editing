/**
 * Keeps a just-focused field in the vertical centre of the window while the page is still
 * settling. Lazy-loaded images in the admin change the layout after the first scroll and push the
 * field away (out of view, or behind the admin's fixed top bar).
 *
 * Standard browser APIs only (ResizeObserver). Stops at the first user input, so it never fights
 * a human: wheel, touch, pointer or key. Otherwise it stops once the layout is quiet for
 * `settle` ms, and after `max` ms at the latest. `onDone` runs once when it stops, for whatever
 * reason. Returns a function that stops it early.
 */
const CENTER_TOLERANCE = 4

export function keepInView(
  element: Element,
  { settle = 1000, max = 5000, onDone }: { settle?: number; max?: number; onDone?: () => void } = {},
): () => void {
  const window = element.ownerDocument.defaultView
  if (!window || typeof window.ResizeObserver !== 'function') {
    onDone?.()
    return () => {}
  }
  const document = element.ownerDocument

  const USER_INPUT = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const
  let settleTimer: ReturnType<typeof setTimeout> | undefined
  let stopped = false

  const stop = () => {
    if (stopped) return
    stopped = true
    observer.disconnect()
    clearTimeout(settleTimer)
    clearTimeout(maxTimer)
    for (const type of USER_INPUT) window.removeEventListener(type, stop, true)
    onDone?.()
  }

  /** Off the window's vertical centre by more than a couple of pixels. */
  const isOffCenter = () => {
    const rect = element.getBoundingClientRect()
    return Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2) > CENTER_TOLERANCE
  }

  // ResizeObserver reports every target once when observing starts. Only real size changes count:
  // reacting to that first report would cut the initial smooth scroll short with an instant jump
  const sizes = new WeakMap<Element, string>()
  const onResize = (entries: ResizeObserverEntry[]) => {
    let changed = false
    for (const { target, contentRect } of entries) {
      const size = `${contentRect.width}x${contentRect.height}`
      if (sizes.has(target) && sizes.get(target) !== size) changed = true
      sizes.set(target, size)
    }
    if (changed) onLayoutChange()
  }

  const onLayoutChange = () => {
    if (stopped) return
    if (!element.isConnected) return stop()
    // Instant, not smooth: a smooth scroll would race the next layout change
    if (isOffCenter()) element.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior })
    clearTimeout(settleTimer)
    settleTimer = setTimeout(stop, settle)
  }

  // The field's ancestors, not just <body>: the Payload admin fixes <body> to the viewport height
  // and scrolls the document, so only the containers around the field grow when content loads
  const observer = new window.ResizeObserver(onResize)
  for (let node: Element | null = element; node && node !== document.documentElement; node = node.parentElement) {
    observer.observe(node)
  }
  const maxTimer = setTimeout(stop, max)
  settleTimer = setTimeout(stop, settle)
  // Capture phase: also when a field or Payload's UI stops the event
  for (const type of USER_INPUT) window.addEventListener(type, stop, { capture: true, passive: true })
  return stop
}
