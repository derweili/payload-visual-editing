import type { Directive } from 'vue'

type RevealEl = HTMLElement & { _reveal?: IntersectionObserver }

/**
 * `v-reveal` / `v-reveal="delayMs"`: fades an element up the first time it scrolls into view.
 * Elements already on screen when the page loads are left alone, so pre-rendered content never
 * blinks out and back in. After the reveal the helper classes are removed again, so the element's
 * own hover transitions work as before.
 */
export const vReveal: Directive<RevealEl, number | undefined> = {
  mounted(el, { value }) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // Measure on the next frame: at mount time the element may not be laid out yet.
    requestAnimationFrame(() => arm(el, value))
  },
  unmounted(el) {
    el._reveal?.disconnect()
  },
}

function arm(el: RevealEl, delay: number | undefined) {
  if (!el.isConnected) return
  const rect = el.getBoundingClientRect()
  if (rect.height === 0 || (rect.top < window.innerHeight && rect.bottom > 0)) return

  // Hide instantly (no fade-out), then let the reveal transition play when it scrolls in.
  el.style.transition = 'none'
  el.classList.add('reveal')
  void el.offsetHeight
  el.style.removeProperty('transition')
  el.style.setProperty('--reveal-delay', `${delay ?? 0}ms`)
  const done = (event: TransitionEvent) => {
    if (event.target !== el || event.propertyName !== 'opacity' || !el.classList.contains('is-revealed')) return
    el.removeEventListener('transitionend', done)
    el.classList.remove('reveal', 'is-revealed')
    el.style.removeProperty('--reveal-delay')
  }
  el.addEventListener('transitionend', done)

  el._reveal = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      el.classList.add('is-revealed')
      el._reveal?.disconnect()
    },
    { rootMargin: '0px 0px -12% 0px' },
  )
  el._reveal.observe(el)
}
