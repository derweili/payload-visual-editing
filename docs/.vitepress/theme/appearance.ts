import { useData } from 'vitepress'
import { nextTick } from 'vue'

/**
 * Dark/light toggle with a circle that grows from the click (View Transitions API).
 * Falls back to an instant switch without the API or with reduced motion.
 * Call in a component's setup; the returned function takes the click event.
 */
export function useAppearanceToggle() {
  const { isDark } = useData()

  return async (event?: MouseEvent) => {
    const animate =
      typeof document !== 'undefined' &&
      'startViewTransition' in document &&
      window.matchMedia('(prefers-reduced-motion: no-preference)').matches

    if (!animate) {
      isDark.value = !isDark.value
      return
    }

    // Keyboard "clicks" have no pointer position: start from the button's centre instead.
    let x = event?.clientX ?? innerWidth / 2
    let y = event?.clientY ?? 0
    if (event && event.detail === 0 && event.currentTarget instanceof Element) {
      const rect = event.currentTarget.getBoundingClientRect()
      x = rect.left + rect.width / 2
      y = rect.top + rect.height / 2
    }
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))

    // The circle is a CSS animation (custom.css), so it is in place on the very first frame.
    // `vt-appearance` also switches off colour transitions, so the new view is final at once.
    const root = document.documentElement
    root.style.setProperty('--vt-x', `${x}px`)
    root.style.setProperty('--vt-y', `${y}px`)
    root.style.setProperty('--vt-r', `${radius}px`)
    root.classList.add('vt-appearance')

    const transition = document.startViewTransition(async () => {
      isDark.value = !isDark.value
      await nextTick()
    })
    try {
      await transition.finished
    } finally {
      root.classList.remove('vt-appearance')
    }
  }
}
