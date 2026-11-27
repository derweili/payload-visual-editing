// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { keepInView } from './keep-in-view.ts'

/**
 * A ResizeObserver we can trigger by hand. Like the real one it reports every target once when
 * observing starts; `layoutChanges()` then reports them with a new size ("lazy image loaded").
 */
type Entry = { callback: (entries: ResizeObserverEntry[]) => void; targets: Element[]; disconnected: boolean }
let observers: Entry[] = []
let height = 100
const report = (entry: Entry) =>
  entry.callback(entry.targets.map((target) => ({ target, contentRect: { width: 100, height } }) as unknown as ResizeObserverEntry))
class FakeResizeObserver {
  entry: Entry
  constructor(callback: Entry['callback']) {
    this.entry = { callback, targets: [], disconnected: false }
    observers.push(this.entry)
  }
  observe(target: Element) {
    this.entry.targets.push(target)
    report({ ...this.entry, targets: [target] }) // the initial report
  }
  disconnect() {
    this.entry.disconnected = true
  }
}
const layoutChanges = () => {
  height += 50
  observers.filter((o) => !o.disconnected).forEach(report)
}

let field: HTMLElement
let top = 300
beforeEach(() => {
  vi.useFakeTimers()
  observers = []
  height = 100
  vi.stubGlobal('ResizeObserver', FakeResizeObserver)
  field = document.createElement('input')
  document.body.append(field)
  field.getBoundingClientRect = () => DOMRect.fromRect({ x: 0, y: top, width: 100, height: 30 })
  field.scrollIntoView = vi.fn(() => {
    top = innerHeight / 2 - 15
  })
  top = innerHeight / 2 - 15
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  document.body.innerHTML = ''
})

describe('keepInView', () => {
  it('re-centres the field whenever a layout change moves it (out of view or behind a top bar)', () => {
    keepInView(field)
    for (const moved of [2000, 20, 400]) {
      top = moved // an image above loaded
      layoutChanges()
    }
    expect(field.scrollIntoView).toHaveBeenCalledTimes(3)
    expect(field.scrollIntoView).toHaveBeenCalledWith({ block: 'center', behavior: 'instant' })
  })

  it('ignores the initial report, so the first smooth scroll is not cut short', () => {
    top = 2000 // still far away: the smooth scroll has only just started
    keepInView(field)
    expect(field.scrollIntoView).not.toHaveBeenCalled()
  })

  it('leaves a centred field alone', () => {
    keepInView(field)
    top = innerHeight / 2 - 15 + 3 // field centre 3 px off the window centre
    layoutChanges()
    expect(field.scrollIntoView).not.toHaveBeenCalled()
  })

  it('calls onDone once when it stops: settled, user input or the maximum', () => {
    for (const end of [() => vi.advanceTimersByTime(1000), () => window.dispatchEvent(new Event('wheel'))]) {
      const onDone = vi.fn()
      keepInView(field, { onDone })
      expect(onDone).not.toHaveBeenCalled()
      end()
      vi.advanceTimersByTime(10_000)
      expect(onDone).toHaveBeenCalledTimes(1)
    }
  })

  it.each(['wheel', 'touchstart', 'pointerdown', 'keydown'])('stops at the first user input (%s)', (type) => {
    keepInView(field)
    window.dispatchEvent(new Event(type))
    top = 2000
    layoutChanges()
    expect(field.scrollIntoView).not.toHaveBeenCalled()
  })

  it('also when the input event is stopped on the way (capture phase)', () => {
    keepInView(field)
    field.addEventListener('keydown', (event) => event.stopPropagation())
    field.dispatchEvent(new Event('keydown', { bubbles: true }))
    top = 2000
    layoutChanges()
    expect(field.scrollIntoView).not.toHaveBeenCalled()
  })

  it('stops once the layout is quiet, and after the maximum at the latest', () => {
    keepInView(field, { settle: 500, max: 4000 })
    vi.advanceTimersByTime(500)
    top = 2000
    layoutChanges()
    expect(field.scrollIntoView).not.toHaveBeenCalled()

    keepInView(field, { settle: 500, max: 1000 })
    for (let i = 0; i < 4; i++) {
      vi.advanceTimersByTime(400) // keeps changing: never settles
      layoutChanges()
    }
    const calls = vi.mocked(field.scrollIntoView).mock.calls.length
    top = 2000
    layoutChanges()
    expect(vi.mocked(field.scrollIntoView).mock.calls.length).toBe(calls)
  })

  it('watches every ancestor of the field, not only <body> (the admin fixes its height)', () => {
    const observed: Element[] = []
    vi.stubGlobal(
      'ResizeObserver',
      class extends FakeResizeObserver {
        override observe(target: Element) {
          observed.push(target)
          super.observe(target)
        }
      },
    )
    const wrapper = document.createElement('div')
    const row = document.createElement('div')
    wrapper.append(row)
    document.body.append(wrapper)
    row.append(field)
    keepInView(field)
    expect(observed).toEqual([field, row, wrapper, document.body])
  })

  it('removes its listeners when done', () => {
    const remove = vi.spyOn(window, 'removeEventListener')
    keepInView(field)()
    expect(remove.mock.calls.map(([type]) => type).sort()).toEqual(['keydown', 'pointerdown', 'touchstart', 'wheel'])
  })
})
